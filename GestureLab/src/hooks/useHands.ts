import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export type HandLandmark = {
  x: number;
  y: number;
  z?: number;
};

interface EuroState {
  filtered: number;
  deriv: number;
}

// One-Euro filter: low-pass with a speed-adaptive cutoff. Filters keypoint
// noise when the hand is still, relaxes as motion speeds up so it stays
// responsive without going raw. Params tuned for MediaPipe normalized
// coordinates.
const EURO_MIN_CUTOFF = 1.8;
const EURO_BETA = 0.01;
const EURO_DERIV_CUTOFF = 1.0;

const euroAlpha = (cutoff: number, dt: number) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

const oneEuro = (value: number, state: EuroState, dt: number) => {
  const dx = (value - state.filtered) / dt;
  const alphaDeriv = euroAlpha(EURO_DERIV_CUTOFF, dt);
  state.deriv = alphaDeriv * dx + (1 - alphaDeriv) * state.deriv;
  const cutoff = EURO_MIN_CUTOFF + EURO_BETA * Math.abs(state.deriv);
  const alpha = euroAlpha(cutoff, dt);
  state.filtered = alpha * value + (1 - alpha) * state.filtered;
  return state.filtered;
};

export type HandednessLabel = "Left" | "Right" | "unknown";

function canUseWorker(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof createImageBitmap !== "undefined"
  );
}

export function useHands(
  videoRef: RefObject<HTMLVideoElement>,
  options?: { lowPerf?: boolean },
) {
  const [useWorker, setUseWorker] = useState(canUseWorker);

  const [landmarks, setLandmarks] = useState<HandLandmark[][]>([[], []]);
  const [handedness, setHandedness] = useState<HandednessLabel[]>([
    "unknown",
    "unknown",
  ]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const prevLandmarksRef = useRef<HandLandmark[][]>([[], []]);
  const prevHandednessRef = useRef<HandednessLabel[]>(["unknown", "unknown"]);
  const lostFrameCountRef = useRef<[number, number]>([0, 0]);
  const maxLostFrames = 10;
  const euroStateRef = useRef<
    Array<Array<{ x: EuroState; y: EuroState; z: EuroState } | null>>
  >([[], []]);
  const lastDetectTimeRef = useRef<number | null>(null);
  const pendingFramesRef = useRef(0);

  const normalizeHandedness = (value: string | undefined) => {
    const normalized = value?.toLowerCase() ?? "";
    return normalized.startsWith("l")
      ? "Left"
      : normalized.startsWith("r")
        ? "Right"
        : "unknown";
  };

  const getWrist = (hand: HandLandmark[]) =>
    hand[0] ?? { x: 0.5, y: 0.5, z: 0 };
  const distanceSq = (a: HandLandmark, b: HandLandmark) =>
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z ?? 0) - (b.z ?? 0)) ** 2;

  const pastAssignmentsRef = useRef<Array<number | null>>([null, null]);
  // Committed slot order: order[slotIndex] = rawHands index. Anchored across
  // frames so a single wobble in the cheap assignment test cannot flip slots.
  const slotOrderRef = useRef<[number, number]>([0, 1]);
  const slotFlipFramesRef = useRef(0);
  const slotOrderKnownRef = useRef(false);
  const SLOT_SWITCH_MARGIN = 0.25;
  const SLOT_HOLD_FRAMES = 6;

  const handCost = (
    hand: { landmarks: HandLandmark[]; handedness: string },
    slotIndex: number,
    previousHand: HandLandmark[] | undefined,
    handIndex: number,
    useHandedness: boolean,
  ) => {
    const handednessPenalty = useHandedness
      ? hand.handedness === "unknown"
        ? 0.12
        : hand.handedness === "Left" && slotIndex === 0
          ? 0
          : hand.handedness === "Right" && slotIndex === 1
            ? 0
            : 0.32
      : 0;
    const prevPenalty = previousHand?.length
      ? Math.min(1, distanceSq(getWrist(hand.landmarks), getWrist(previousHand)) * 1.8)
      : 0.18;
    const xBias = hand.landmarks[0]?.x ?? 0.5;
    const sidePenalty =
      slotIndex === 0
        ? Math.max(0, xBias - 0.5) * 0.2
        : Math.max(0, 0.5 - xBias) * 0.2;
    const temporalPenalty =
      pastAssignmentsRef.current[slotIndex] === handIndex ? 0 : 0.15;
    return handednessPenalty + prevPenalty + sidePenalty + temporalPenalty;
  };

  const assignHandSlots = (
    rawHands: Array<{ landmarks: HandLandmark[]; handedness: string }>,
    previousHands: HandLandmark[][],
    previousLabels: HandednessLabel[],
  ) => {
    const slots: Array<HandLandmark[] | null> = [null, null];
    const labels: HandednessLabel[] = ["unknown", "unknown"];

    if (rawHands.length === 0) {
      return { slots, labels: previousLabels };
    }

    const slotLabel = (index: number, hand: { handedness: string }) =>
      hand.handedness !== "unknown"
        ? (hand.handedness as HandednessLabel)
        : previousLabels[index] !== "unknown"
          ? previousLabels[index]
          : index === 0
            ? "Left"
            : "Right";

    if (rawHands.length === 1) {
      const hand = rawHands[0];
      let slotIndex = 0;

      if (hand.handedness === "Left") {
        slotIndex = 0;
      } else if (hand.handedness === "Right") {
        slotIndex = 1;
      } else {
        const leftDist = previousHands[0]?.length
          ? distanceSq(getWrist(hand.landmarks), getWrist(previousHands[0]))
          : Infinity;
        const rightDist = previousHands[1]?.length
          ? distanceSq(getWrist(hand.landmarks), getWrist(previousHands[1]))
          : Infinity;
        slotIndex = leftDist <= rightDist ? 0 : 1;
        if (!previousHands[0]?.length && !previousHands[1]?.length) {
          slotIndex = (hand.landmarks[0]?.x ?? 0.5) < 0.5 ? 0 : 1;
        }
      }

      slots[slotIndex] = hand.landmarks;
      labels[slotIndex] = slotLabel(slotIndex, hand);
      return { slots, labels };
    }

    // With two hands, handedness from MediaPipe is unreliable and can jitter
    // frame to frame. When prior wrists are available, decide by wrist
    // proximity + temporal stickiness only; bootstrap with handedness only on
    // the first frames.
    const bothTracked = !!previousHands[0]?.length && !!previousHands[1]?.length;
    const useHandedness = !bothTracked;
    const candidates = [
      {
        order: [0, 1] as [number, number],
        cost:
          handCost(rawHands[0], 0, previousHands[0], 0, useHandedness) +
          handCost(rawHands[1], 1, previousHands[1], 1, useHandedness),
      },
      {
        order: [1, 0] as [number, number],
        cost:
          handCost(rawHands[0], 1, previousHands[1], 0, useHandedness) +
          handCost(rawHands[1], 0, previousHands[0], 1, useHandedness),
      },
    ];
    const best = candidates.reduce(
      (min, current) => (current.cost < min.cost ? current : min),
      candidates[0],
    );

    // Hysteresis: only switch the committed order when the alternative wins
    // by a clear margin for several consecutive frames. A single-frame wobble
    // never flips slots.
    const cur = slotOrderRef.current;
    const curCost = candidates.find(
      (c) => c.order[0] === cur[0] && c.order[1] === cur[1],
    )?.cost ?? best.cost;
    if (!slotOrderKnownRef.current) {
      slotOrderRef.current = best.order;
      slotOrderKnownRef.current = true;
    } else if (best.order[0] !== cur[0] && best.cost + SLOT_SWITCH_MARGIN < curCost) {
      slotFlipFramesRef.current++;
      if (slotFlipFramesRef.current >= SLOT_HOLD_FRAMES) {
        slotOrderRef.current = best.order;
      }
    } else {
      slotFlipFramesRef.current = 0;
    }
    const order = slotOrderRef.current;
    slots[order[0]] = rawHands[0].landmarks;
    slots[order[1]] = rawHands[1].landmarks;
    labels[order[0]] = slotLabel(order[0], rawHands[0]);
    labels[order[1]] = slotLabel(order[1], rawHands[1]);
    return { slots, labels };
  };

  // Shared smoothing + state update logic
  const processRawHands = (
    rawHands: Array<{ landmarks: HandLandmark[]; handedness: string }>,
  ) => {
    // dt once per detection, shared by both hands (clamped; the main-thread
    // fallback and worker produce results at slightly different cadences).
    const now = performance.now();
    const dt = lastDetectTimeRef.current
      ? Math.min(Math.max((now - lastDetectTimeRef.current) / 1000, 0.005), 0.2)
      : 1 / 60;
    lastDetectTimeRef.current = now;
    // Normalize handedness and mirror X once, so every consumer sees
    // user-perspective coordinates (selfie view): the left hand renders on
    // the left and is labeled "Left", regardless of worker vs main thread.
    const processed = rawHands.map((hand) => ({
      handedness: normalizeHandedness(hand.handedness),
      landmarks: hand.landmarks.map((landmark) => ({
        x: 1 - landmark.x,
        y: landmark.y,
        z: landmark.z,
      })),
    }));
    const {
      slots: [leftHand, rightHand],
      labels: nextLabels,
    } = assignHandSlots(
      processed,
      prevLandmarksRef.current,
      prevHandednessRef.current,
    );
    // Track which processed index went to which slot for temporal consistency
    if (processed.length >= 1) pastAssignmentsRef.current[0] = leftHand ? 0 : null;
    if (processed.length >= 2) pastAssignmentsRef.current[1] = rightHand ? 1 : null;
    const nextLandmarks: HandLandmark[][] = [[], []];

    [leftHand, rightHand].forEach((handLandmarks, handIndex) => {
      const prevHand = prevLandmarksRef.current[handIndex] ?? [];

      if (handLandmarks && handLandmarks.length > 0) {
        lostFrameCountRef.current[handIndex] = 0;
        nextLandmarks[handIndex] = handLandmarks.map((landmark, index) => {
          let euro = euroStateRef.current[handIndex][index];
          if (!euro) {
            // Fresh hand after absence: seed the filter state from raw values
            // so a new hand never inherits a dead hand's stale state.
            euro = euroStateRef.current[handIndex][index] = {
              x: { filtered: landmark.x, deriv: 0 },
              y: { filtered: landmark.y, deriv: 0 },
              z: { filtered: landmark.z ?? 0, deriv: 0 },
            };
          }
          return {
            x: oneEuro(landmark.x, euro.x, dt),
            y: oneEuro(landmark.y, euro.y, dt),
            z: oneEuro(landmark.z ?? 0, euro.z, dt),
          };
        });
      } else if (
        prevHand.length > 0 &&
        lostFrameCountRef.current[handIndex] < maxLostFrames
      ) {
        // Brief loss: hold the last pose so the hand doesn't flicker out
        lostFrameCountRef.current[handIndex] += 1;
        nextLandmarks[handIndex] = prevHand;
      } else {
        lostFrameCountRef.current[handIndex] = 0;
        euroStateRef.current[handIndex] = [];
        nextLandmarks[handIndex] = [];
      }
    });

    prevLandmarksRef.current = nextLandmarks;
    prevHandednessRef.current = nextLabels;
    setLandmarks(nextLandmarks);
    setHandedness(nextLabels);
  };

  // ============ WORKER PATH ============
  useEffect(() => {
    if (!useWorker) return;

    let cancelled = false;
    let worker: Worker | null = null;

    function fallback() {
      if (!cancelled) {
        worker?.terminate();
        workerRef.current = null;
        console.warn("[useHands] worker path failed; falling back to main thread");
        setUseWorker(false);
      }
    }

    // Timeout: if worker doesn't signal ready within 10s, fall back
    const initTimeout = setTimeout(() => {
      if (!workerRef.current) return;
      fallback();
    }, 10000);

    async function initWorker() {
      try {
        worker = new Worker(
          new URL("../workers/handTracker.worker.ts", import.meta.url),
          { type: "module" },
        );
        workerRef.current = worker;

        worker.onmessage = (e) => {
          if (cancelled) return;
          const msg = e.data;

          if (msg.type === "ready") {
            clearTimeout(initTimeout);
            setIsTracking(true);
            setError(null);
            startWorkerLoop(worker!);
          } else if (msg.type === "result") {
            pendingFramesRef.current = Math.max(0, pendingFramesRef.current - 1);
            const rawHands = msg.hands as Array<{
              landmarks: HandLandmark[];
              handedness: string;
            }>;
            processRawHands(rawHands);
          } else if (msg.type === "error") {
            if (!cancelled) fallback();
          }
        };

        worker.onerror = () => {
          if (!cancelled) fallback();
        };

        worker.postMessage({ type: "init" });
      } catch (err) {
        clearTimeout(initTimeout);
        if (!cancelled) fallback();
      }
    }

    function startWorkerLoop(workerInstance: Worker) {
      const video = videoRef.current;
      if (!video) return;

      const step = async () => {
        if (cancelled) return;

        if (!video.videoWidth || !video.videoHeight) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        // Skip inference if the video frame hasn't advanced
        if (video.currentTime === lastVideoTimeRef.current) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        lastVideoTimeRef.current = video.currentTime;

        // Skip if too many pending frames (backpressure)
        if (pendingFramesRef.current < 3) {
          try {
            const bitmap = await createImageBitmap(video);
            // Downscale for lighter inference on low-perf devices
            const targetW = options?.lowPerf ? 320 : 640;
            const targetH = options?.lowPerf ? 240 : 480;
            let sendBitmap = bitmap;
            if (bitmap.width > targetW || bitmap.height > targetH) {
              const oc = new OffscreenCanvas(targetW, targetH);
              const ctx = oc.getContext("2d")!;
              ctx.drawImage(bitmap, 0, 0, targetW, targetH);
              bitmap.close();
              sendBitmap = await createImageBitmap(oc);
            }
            pendingFramesRef.current++;
            workerInstance.postMessage(
              { type: "detect", image: sendBitmap, timestamp: performance.now() },
              [sendBitmap],
            );
          } catch {
            // Fallback if createImageBitmap fails
          }
        }

        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    }

    initWorker();

    return () => {
      clearTimeout(initTimeout);
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      worker?.terminate();
      workerRef.current = null;
      setIsTracking(false);
    };
  }, [useWorker, videoRef]);

  // ============ MAIN-THREAD PATH (fallback) ============
  useEffect(() => {
    if (useWorker) return;

    let cancelled = false;

    async function initialize() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.3,
minHandPresenceConfidence: 0.55,
minTrackingConfidence: 0.5,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setIsTracking(true);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to initialize hand tracking",
          );
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      setIsTracking(false);
    };
  }, [useWorker]);

  // Main-thread tracking loop
  useEffect(() => {
    if (useWorker) return;

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || !isTracking) return;

    const step = () => {
      if (!video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (video.currentTime === lastVideoTimeRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      lastVideoTimeRef.current = video.currentTime;

      const result = landmarker.detectForVideo(video, performance.now());
      const rawHands = Array.from(result.landmarks ?? []).map(
        (handLandmarks, handIndex) => ({
          handedness:
            result.handedness?.[handIndex]?.[0]?.categoryName ||
            result.handednesses?.[handIndex]?.[0]?.categoryName ||
            "unknown",
          landmarks: handLandmarks.map((landmark) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
          })),
        }),
      );

      processRawHands(rawHands);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [useWorker, videoRef, isTracking]);

  return { landmarks, handedness, isTracking, error };
}
