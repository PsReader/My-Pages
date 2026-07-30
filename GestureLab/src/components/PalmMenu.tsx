import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"

export interface MenuItem {
  id: string
  label: string
  icon: ReactNode
  action: () => void
}

interface PalmMenuProps {
  palmCenter: { x: number; y: number } | null
  handAngle: number
  pinchDistance: number
  menuItems: MenuItem[]
  isVisible: boolean
  onSelect: (item: MenuItem) => void
  onClose: () => void
}

const RADIUS = 130

export function PalmMenu({ palmCenter, handAngle, pinchDistance, menuItems, isVisible, onSelect, onClose }: PalmMenuProps) {
  const prevPinchRef = useRef(pinchDistance)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  if (!palmCenter || !isVisible) return null

  const totalItems = menuItems.length
  const angleStep = (2 * Math.PI) / totalItems

  const highlightIndex = (() => {
    let closest = 0
    let closestDiff = Infinity
    for (let i = 0; i < totalItems; i++) {
      const itemAngle = angleStep * i
      let diff = handAngle - itemAngle
      while (diff > Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI
      const absDiff = Math.abs(diff)
      if (absDiff < closestDiff) {
        closestDiff = absDiff
        closest = i
      }
    }
    return closestDiff < angleStep * 0.6 ? closest : -1
  })()

  // Pinch detection for selection
  useEffect(() => {
    if (!isVisible) return
    const prev = prevPinchRef.current
    const current = pinchDistance
    prevPinchRef.current = current

    // Pinch closed: prev was open (>0.08) and now closed (<0.05)
    if (prev > 0.08 && current < 0.05 && highlightIndex >= 0) {
      onSelect(menuItems[highlightIndex])
      onClose()
    }
  }, [pinchDistance, isVisible, highlightIndex, menuItems, onSelect, onClose])

  // Entrance animation
  useEffect(() => {
    if (!isVisible) return
    itemRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(el,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.35, delay: i * 0.04, ease: "back.out(1.7)" }
        )
      }
    })
  }, [isVisible])

  const screenX = palmCenter.x * window.innerWidth
  const screenY = palmCenter.y * window.innerHeight

  return (
    <div
      className="palm-menu-container"
      style={{ left: screenX, top: screenY }}
    >
      {menuItems.map((item, i) => {
        const angle = angleStep * i - Math.PI / 2
        const x = Math.cos(angle) * RADIUS
        const y = Math.sin(angle) * RADIUS
        const isHighlighted = i === highlightIndex

        return (
          <div
            key={item.id}
            ref={(el) => { itemRefs.current[i] = el }}
            className={`palm-menu-item ${isHighlighted ? "highlighted" : ""}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <span className="palm-menu-icon">{item.icon}</span>
            <span className="palm-menu-label">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
