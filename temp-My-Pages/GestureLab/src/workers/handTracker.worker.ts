import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision"

let landmarker: HandLandmarker | null = null
let consecutiveFailures = 0
const MAX_CONSECUTIVE_FAILURES = 5

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data

  if (msg.type === "init") {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      )
      landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.3,
        minHandPresenceConfidence: 0.3,
        minTrackingConfidence: 0.35,
      })
      self.postMessage({ type: "ready" })
    } catch (err) {
      console.warn("[worker] handTracker init failed:", err)
      self.postMessage({
        type: "error",
        message: err instanceof Error ? err.message : "Worker initialization failed",
      })
    }
    return
  }

  if (msg.type === "detect" && landmarker) {
    try {
      const { image, timestamp } = msg as {
        image: ImageBitmap
        timestamp: number
      }

      const result = landmarker.detectForVideo(image, timestamp)
      consecutiveFailures = 0
      const hands = Array.from(result.landmarks ?? []).map((hand, i) => ({
        landmarks: hand.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
        })),
        handedness:
          result.handedness?.[i]?.[0]?.categoryName ??
          result.handednesses?.[i]?.[0]?.categoryName ??
          "unknown",
      }))

      self.postMessage({ type: "result", hands, timestamp })
    } catch (err) {
      // Repeated inference failures (e.g. broken GPU graph) must surface so
      // the app can fall back to the main-thread path instead of going silent
      consecutiveFailures++
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        self.postMessage({
          type: "error",
          message:
            err instanceof Error ? err.message : "Worker detection failed",
        })
      }
    }
    return
  }
}
