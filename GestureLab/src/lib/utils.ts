let cachedIsMobile: boolean | null = null

export function isMobileDevice(): boolean {
  if (cachedIsMobile !== null) return cachedIsMobile
  cachedIsMobile =
    "maxTouchPoints" in navigator &&
    navigator.maxTouchPoints > 1 &&
    window.screen.width < 1024
  return cachedIsMobile
}

export function isLowPerfDevice(): boolean {
  return (
    isMobileDevice() ||
    ("hardwareConcurrency" in navigator && navigator.hardwareConcurrency <= 4)
  )
}

/* Palm = average of wrist(0) + finger MCP joints (5,9,13,17) */
const palmJoints = [0, 5, 9, 13, 17];

export function computePalmCenter(
  handLandmarks: Array<{ x: number; y: number; z?: number }>,
) {
  if (!handLandmarks || handLandmarks.length < 21) return null;
  let sx = 0,
    sy = 0;
  for (const idx of palmJoints) {
    const lm = handLandmarks[idx];
    if (!lm) return null;
    sx += lm.x;
    sy += lm.y;
  }
  // Return in normalized coords [0,1] matching MediaPipe output
  return { x: sx / palmJoints.length, y: sy / palmJoints.length };
}

export function computeHandAngle(
  handLandmarks: Array<{ x: number; y: number; z?: number }>,
): number {
  if (!handLandmarks || handLandmarks.length < 21) return 0
  const wrist = handLandmarks[0]
  const midMcp = handLandmarks[9]
  if (!wrist || !midMcp) return 0
  return Math.atan2(midMcp.y - wrist.y, midMcp.x - wrist.x)
}