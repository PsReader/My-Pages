import { useRef } from "react"

const THRESHOLD = 0.15
const SNAP_RATIO = 0.45
const COOLDOWN = 800
const PALM_JOINTS = [0, 5, 9, 13, 17]

type Landmark = { x: number; y: number; z?: number }

function reset(el: HTMLElement) {
  el.style.transition = ""
  el.style.transform = ""
  el.style.opacity = ""
}

function getPalmY(hand: Landmark[]): number | null {
  if (!hand || hand.length < 21) return null
  let sy = 0
  for (const idx of PALM_JOINTS) {
    const lm = hand[idx]
    if (!lm) return null
    sy += lm.y
  }
  return sy / PALM_JOINTS.length
}

export function useSwipeGesture(
  landmarks: Array<Landmark[]>,
  fingerCounts: [number, number],
  activeMode: number,
  navOpen: boolean,
  onToggle: () => void,
) {
  const navRef = useRef<HTMLDivElement>(null)
  const s = useRef({
    tracking: false,
    startY: 0,
    dir: null as "down" | "up" | null,
    progress: 0,
    lastToggle: 0,
  }).current

  const flatIdx =
    activeMode === 0 && fingerCounts[0] >= 5 ? 0
    : activeMode === 0 && fingerCounts[1] >= 5 ? 1
    : -1

  const palmY = flatIdx >= 0 ? getPalmY(landmarks[flatIdx] || []) : null

  const now = Date.now()

  if (now - s.lastToggle < COOLDOWN) {
    if (s.tracking) { s.tracking = false; if (navRef.current) reset(navRef.current) }
    return navRef
  }

  if (s.tracking && palmY === null) {
    if (s.progress > SNAP_RATIO && s.dir) {
      if (navRef.current) reset(navRef.current)
      s.lastToggle = now
      setTimeout(() => onToggle(), 0)
    } else {
      if (navRef.current) reset(navRef.current)
    }
    s.tracking = false
    return navRef
  }

  if (!s.tracking) {
    if (palmY !== null) {
      s.tracking = true
      s.startY = palmY
      s.dir = null
      s.progress = 0
    }
    return navRef
  }

  const delta = palmY! - s.startY
  const dir = delta > 0 ? "down" : "up"
  s.dir = dir

  const open = dir === "down" && !navOpen
  const close = dir === "up" && navOpen

  if (!open && !close) {
    s.tracking = false
    if (navRef.current) reset(navRef.current)
    return navRef
  }

  const abs = Math.abs(delta)
  const prog = Math.min(1, abs / THRESHOLD)
  s.progress = prog

  const el = navRef.current
  if (el) {
    el.style.transition = "none"
    if (dir === "down") {
      el.style.transform = `translateY(${(1 - prog) * -100}%)`
      el.style.opacity = `${prog}`
    } else {
      el.style.transform = `translateY(${-prog * 100}%)`
      el.style.opacity = `${1 - prog}`
    }
  }

  if (prog >= 1) {
    if (el) reset(el)
    s.lastToggle = now
    s.tracking = false
    setTimeout(() => onToggle(), 0)
  }

  return navRef
}
