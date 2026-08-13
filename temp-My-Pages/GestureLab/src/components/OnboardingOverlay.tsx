import { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"

interface OnboardingOverlayProps {
  hasDetectedHand: boolean
  isReady: boolean
  onDismiss: () => void
}

type StepId = "welcome" | "joint" | "shader"

interface Step {
  id: StepId
  title: string
  body: string
  highlight?: string
}

const steps: Step[] = [
  {
    id: "welcome",
    title: "Welcome to GestureLab",
    body: "Grant camera access when prompted, then wave your hand in front of the webcam. The dots will follow your fingers in real time.",
  },
  {
    id: "joint",
    title: "Pick an Interactive",
    body: "Open the panel at the top to switch between Sphere & Halo, Retrolens, and AirGlow. In Sphere & Halo, raise fingers to drive the sphere — one finger moves it, two scale it, three change color, four rotate it.",
    highlight: "Joint",
  },
  {
    id: "shader",
    title: "Gesture Shortcuts",
    body: "In Retrolens, pinch your index fingertips or fold a pinkie to cycle through 10 video filters. In AirGlow, trace the air with your index fingertip — fold a pinkie to open the color wheel.",
    highlight: "Shader",
  },
]

const stepLabels: Record<StepId, string> = {
  welcome: "1 of 3",
  joint: "2 of 3",
  shader: "3 of 3",
}

export function OnboardingOverlay({ hasDetectedHand, isReady, onDismiss }: OnboardingOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const step = steps[stepIndex]

  const goNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      const el = cardRef.current
      if (el) {
        gsap.to(el, { opacity: 0, scale: 0.96, duration: 0.15, onComplete: () => {
          setStepIndex((i) => i + 1)
        }})
      }
    } else {
      onDismiss()
    }
  }, [stepIndex, onDismiss])

  const goPrev = useCallback(() => {
    if (stepIndex > 0) {
      const el = cardRef.current
      if (el) {
        gsap.to(el, { opacity: 0, scale: 0.96, duration: 0.15, onComplete: () => {
          setStepIndex((i) => i - 1)
        }})
      }
    }
  }, [stepIndex])

  useEffect(() => {
    const el = cardRef.current
    if (el) {
      gsap.fromTo(el, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" })
    }
  }, [stepIndex])

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" onClick={onDismiss} />
      <div className="onboarding-card" ref={cardRef}>
        <div className="onboarding-step-label">{stepLabels[step.id]}</div>
        <h2 className="onboarding-title">{step.title}</h2>
        <p className="onboarding-body">{step.body}</p>

        {step.id === "welcome" && (
          <div className="onboarding-status">
            {!isReady ? (
              <span className="onboarding-status-wait">⏳ Requesting camera access...</span>
            ) : !hasDetectedHand ? (
              <span className="onboarding-status-wait">✋ Wave your hand in front of the camera</span>
            ) : (
              <span className="onboarding-status-done">✓ Hand detected!</span>
            )}
          </div>
        )}

        <div className="onboarding-footer">
          {stepIndex > 0 && (
            <button className="onboarding-btn onboarding-btn-ghost" onClick={goPrev}>
              Back
            </button>
          )}
          <div className="onboarding-footer-right">
            <button className="onboarding-btn onboarding-btn-ghost" onClick={onDismiss}>
              Skip
            </button>
            <button className="onboarding-btn onboarding-btn-primary" onClick={goNext}>
              {stepIndex < steps.length - 1 ? "Next" : "Done — Explore!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
