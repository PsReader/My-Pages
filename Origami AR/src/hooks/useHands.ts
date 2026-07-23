import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export type HandLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type HandednessLabel = "Left" | "Right" | "unknown";

export function useHands(videoRef: RefObject<HTMLVideoElement>) {
  const [landmarks, setLandmarks] = useState<HandLandmark[][]>([[], []]);
  const [handedness, setHandedness] = useState<HandednessLabel[]>([
    "unknown",
    "unknown",
  ]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevLandmarksRef = useRef<HandLandmark[][]>([[], []]);
  const prevHandednessRef = useRef<HandednessLabel[]>(["unknown", "unknown"]);
  const lostFrameCountRef = useRef<[number, number]>([0, 0]);
  const maxLostFrames = 4;

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.45,
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
            err instanceof Error
              ? err.message
              : "Unable to initialize hand tracking",
          );
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      setIsTracking(false);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || !isTracking) return;

    const normalizeHandedness = (value: string | undefined) => {
      const normalized = value?.toLowerCase() ?? "";
      const rawLabel = normalized.startsWith("l")
        ? "Left"
        : normalized.startsWith("r")
          ? "Right"
          : "unknown";
      // For a front-facing camera, MediaPipe reports the hand relative to the
      // camera image. To keep the app aligned with the user's perspective,
      // swap left/right labels here.
      if (rawLabel === "Left") return "Right";
      if (rawLabel === "Right") return "Left";
      return "unknown";
    };

    const getWrist = (hand: HandLandmark[]) =>
      hand[0] ?? { x: 0.5, y: 0.5, z: 0 };
    const distanceSq = (a: HandLandmark, b: HandLandmark) =>
      (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z ?? 0) - (b.z ?? 0)) ** 2;

    const handCost = (
      hand: { landmarks: HandLandmark[]; handedness: string },
      slotIndex: number,
      previousHand: HandLandmark[] | undefined,
    ) => {
      const handednessPenalty =
        hand.handedness === "unknown"
          ? 0.12
          : hand.handedness === "Left" && slotIndex === 0
            ? 0
            : hand.handedness === "Right" && slotIndex === 1
              ? 0
              : 0.32;
      const prevPenalty = previousHand?.length
        ? Math.min(
            1,
            distanceSq(getWrist(hand.landmarks), getWrist(previousHand)) * 1.8,
          )
        : 0.18;
      const xBias = hand.landmarks[0]?.x ?? 0.5;
      const sidePenalty =
        slotIndex === 0
          ? Math.max(0, 0.5 - xBias) * 0.2
          : Math.max(0, xBias - 0.5) * 0.2;
      return handednessPenalty + prevPenalty + sidePenalty;
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
            slotIndex = (hand.landmarks[0]?.x ?? 0.5) < 0.5 ? 1 : 0;
          }
        }

        slots[slotIndex] = hand.landmarks;
        labels[slotIndex] = slotLabel(slotIndex, hand);
        return { slots, labels };
      }

      const candidates = [
        {
          order: [0, 1],
          cost:
            handCost(rawHands[0], 0, previousHands[0]) +
            handCost(rawHands[1], 1, previousHands[1]),
        },
        {
          order: [1, 0],
          cost:
            handCost(rawHands[0], 1, previousHands[1]) +
            handCost(rawHands[1], 0, previousHands[0]),
        },
      ];
      const best = candidates.reduce(
        (min, current) => (current.cost < min.cost ? current : min),
        candidates[0],
      );
      slots[best.order[0]] = rawHands[0].landmarks;
      slots[best.order[1]] = rawHands[1].landmarks;
      labels[best.order[0]] = slotLabel(best.order[0], rawHands[0]);
      labels[best.order[1]] = slotLabel(best.order[1], rawHands[1]);
      return { slots, labels };
    };

    const smoothingFactor = (prev: HandLandmark, next: HandLandmark) => {
      const dx = Math.abs(next.x - prev.x);
      const dy = Math.abs(next.y - prev.y);
      const dz = Math.abs((next.z ?? 0) - (prev.z ?? 0));
      const motion = dx + dy + dz;
      return Math.min(0.95, Math.max(0.68, 0.78 + motion * 0.85));
    };

    const step = () => {
      if (!video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const result = landmarker.detectForVideo(video, performance.now());
      const rawHands = Array.from(result.landmarks ?? []).map(
        (handLandmarks, handIndex) => ({
          handedness: normalizeHandedness(
            result.handedness?.[handIndex]?.[0]?.categoryName ||
              result.handednesses?.[handIndex]?.[0]?.categoryName,
          ),
          landmarks: handLandmarks.map((landmark) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
          })),
        }),
      );

      const {
        slots: [leftHand, rightHand],
        labels: nextLabels,
      } = assignHandSlots(
        rawHands,
        prevLandmarksRef.current,
        prevHandednessRef.current,
      );
      const nextLandmarks: HandLandmark[][] = [[], []];

      [leftHand, rightHand].forEach((handLandmarks, handIndex) => {
        const prevHand = prevLandmarksRef.current[handIndex] ?? [];

        if (handLandmarks && handLandmarks.length > 0) {
          lostFrameCountRef.current[handIndex] = 0;
          nextLandmarks[handIndex] = handLandmarks.map((landmark, index) => {
            const prev = prevHand[index];
            if (!prev) return landmark;
            const factor = smoothingFactor(prev, landmark);
            return {
              x: prev.x + (landmark.x - prev.x) * factor,
              y: prev.y + (landmark.y - prev.y) * factor,
              z: (prev.z ?? 0) + ((landmark.z ?? 0) - (prev.z ?? 0)) * factor,
            };
          });
        } else if (
          prevHand.length > 0 &&
          lostFrameCountRef.current[handIndex] < maxLostFrames
        ) {
          lostFrameCountRef.current[handIndex] += 1;
          // Decay: progressively shrink landmarks toward center-offscreen
          // so the hand visually fades out instead of sticking as a ghost
          const decay =
            1 - lostFrameCountRef.current[handIndex] / maxLostFrames;
          nextLandmarks[handIndex] = prevHand.map((lm) => ({
            x: 0.5 + (lm.x - 0.5) * decay,
            y: 0.5 + (lm.y - 0.5) * decay,
            z: (lm.z ?? 0) * decay,
          }));
        } else {
          lostFrameCountRef.current[handIndex] = 0;
          nextLandmarks[handIndex] = [];
        }
      });

      prevLandmarksRef.current = nextLandmarks;
      prevHandednessRef.current = nextLabels;
      setLandmarks(nextLandmarks);
      setHandedness(nextLabels);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, [videoRef, isTracking]);

  return { landmarks, handedness, isTracking, error };
}
