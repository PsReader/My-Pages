import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision"

let landmarker: HandLandmarker | null = null

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data

  if (msg.type === "init") {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
      )
      landmarker = await HandLandmarker.createFromOptions(vision, {
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
    } catch {
      // Silently skip failed frames
    }
    return
  }
}
