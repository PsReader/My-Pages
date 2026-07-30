import { useMemo } from "react"
import type { HandLandmark } from "./useHands"

function isExtended(hand: HandLandmark[], tip: number, pip: number, ratio = 1.1): boolean {
  const wrist = hand[0]
  const t = hand[tip]
  const p = hand[pip]
  if (!wrist || !t || !p) return false
  const dt = Math.sqrt((t.x - wrist.x) ** 2 + (t.y - wrist.y) ** 2)
  const dp = Math.sqrt((p.x - wrist.x) ** 2 + (p.y - wrist.y) ** 2)
  return dt > dp * ratio
}

// Thumb abduction test – distance from thumb tip to index MCP vs hand size.
// In a fist the thumb is tucked (tip near index MCP); extended it sticks out.
function thumbExtended(hand: HandLandmark[]): boolean {
  const tip = hand[4]
  const idxMcp = hand[5]
  const wrist = hand[0]
  if (!tip || !idxMcp || !wrist) return false
  const d = Math.sqrt((tip.x - idxMcp.x) ** 2 + (tip.y - idxMcp.y) ** 2)
  const handSize = Math.sqrt((idxMcp.x - wrist.x) ** 2 + (idxMcp.y - wrist.y) ** 2)
  if (handSize < 0.001) return false
  return d > handSize * 0.5
}

export function useFingerCount(hand: HandLandmark[]): number {
  return useMemo(() => {
    if (!hand || hand.length < 21) return 0
    let count = 0
    if (thumbExtended(hand)) count++
    if (isExtended(hand, 8, 7, 1.1)) count++
    if (isExtended(hand, 12, 11, 1.1)) count++
    if (isExtended(hand, 16, 15, 0.98)) count++
    if (isExtended(hand, 20, 19, 0.98)) count++
    return count
  }, [hand])
}

export function useRingFingerFolded(hands: HandLandmark[][]): boolean {
  return useMemo(() => {
    for (const hand of hands) {
      if (hand.length < 21) continue
      if (!isExtended(hand, 16, 15)) return true
    }
    return false
  }, [hands])
}
