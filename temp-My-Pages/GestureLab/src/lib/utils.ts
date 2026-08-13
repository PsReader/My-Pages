import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
