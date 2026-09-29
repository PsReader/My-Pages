import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { AmbientBackground } from "./components/AmbientBackground";
import { computeHandAngle, computePalmCenter, isLowPerfDevice } from "./lib/utils";
import { OnboardingOverlay } from "./components/OnboardingOverlay";
import { RoutingPanel } from "./components/RoutingPanel";
import { useHands } from "./hooks/useHands";
import { useWebcam } from "./hooks/useWebcam";
import { HandScene } from "./scene/HandScene";
import { shaderRegistry } from "./shaders/shaderRegistry";
import { fingerCount, ringFingerFolded } from "./hooks/useFingerCount";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { defaultCentralParams, MODE_INFO, type CentralParams } from "./components/centralParams";
import { INTERACTIVES } from "./components/interactives";
import { AirGlow, AIRGLOW_TOOL_INFO, type PenHand } from "./components/AirGlow";

const shaderMap = {
  4: "plasma-bridge",
  8: "chromatic-aberration",
  12: "neon-scattering",
  16: "scanline-pulse",
  20: "topographic-matrix",
};

const activeJointLabel = "Index Tip";
const activeShaderEntry = shaderRegistry["chromatic-aberration"];
const activeShaderLabel = activeShaderEntry.name;
const activeShaderDescription = activeShaderEntry.description;

const MODE_HOLD_FRAMES = 5;

function App() {
  const { videoRef, isReady, error } = useWebcam();
  const isLowPerf = isLowPerfDevice();
  const { landmarks, handedness, isTracking } = useHands(videoRef, { lowPerf: isLowPerf });

  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem("gesturelab-onboarded") === "true");

  const handleOnboardingDismiss = useCallback(() => {
    setOnboardingDone(true)
    localStorage.setItem("gesturelab-onboarded", "true")
  }, [])

  const [centralParams, setCentralParams] = useState<CentralParams>(defaultCentralParams)

  const [interactiveId, setInteractiveId] = useState<string>(
    () => localStorage.getItem("gesturelab-interactive") ?? "sphere-halo",
  )
  const handleInteractiveChange = useCallback((id: string) => {
    setInteractiveId(id)
    localStorage.setItem("gesturelab-interactive", id)
  }, [])

  const handleReset = useCallback(() => setResetSignal((s) => s + 1), [])

  const [portalFilter, setPortalFilter] = useState("MONO")

  const [resetSignal, setResetSignal] = useState(0)

  const [navOpen, setNavOpen] = useState(false)
  const prevRingRef = useRef(false)
  const ringCooldownRef = useRef(0)

  const [penHand, setPenHand] = useState<PenHand>(
    () => (localStorage.getItem("gesturelab-airglow-hand") as PenHand) ?? "auto",
  )
  const handlePenHandChange = useCallback((hand: PenHand) => {
    setPenHand(hand)
    localStorage.setItem("gesturelab-airglow-hand", hand)
  }, [])

  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  const takeScreenshot = useCallback(() => {
    const canvas = glRef.current?.domElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `gesturelab-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const hasDetectedHand = landmarks.some((hand) => hand.length > 0);

  // Compute palm data from the first detected hand
  const firstHand = landmarks.find((hand) => hand.length > 0);
  const palmCenter = firstHand ? computePalmCenter(firstHand) : null;
  const handAngle = firstHand ? computeHandAngle(firstHand) : 0;

  const fCount0 = fingerCount(landmarks[0] || [])
  const fCount1 = fingerCount(landmarks[1] || [])
  // Commit a mode only after the same finger count holds for MODE_HOLD_FRAMES
  // consecutive frames, so transient flicker through in-between counts never
  // snaps the sphere across modes.
  const pendingIdxRef = useRef(-1)
  const pendingCountRef = useRef(0)
  const stableFramesRef = useRef(0)
  const committedIdxRef = useRef(-1)
  const committedCountRef = useRef(0)
  const rawIdx = fCount0 >= 1 && fCount0 <= 4 ? 0 : fCount1 >= 1 && fCount1 <= 4 ? 1 : -1
  const rawCount = rawIdx >= 0 ? (rawIdx === 0 ? fCount0 : fCount1) : 0
  if (rawIdx === pendingIdxRef.current && rawCount === pendingCountRef.current) {
    stableFramesRef.current++
    if (stableFramesRef.current >= MODE_HOLD_FRAMES) {
      committedIdxRef.current = rawIdx
      committedCountRef.current = rawCount
    }
  } else {
    pendingIdxRef.current = rawIdx
    pendingCountRef.current = rawCount
    stableFramesRef.current = 0
  }
  const modeHandIndex = committedIdxRef.current
  const activeMode = committedCountRef.current
  const ringFolded = ringFingerFolded(landmarks)

  const handleCentralChange = useCallback((update: Partial<CentralParams>) => {
    setCentralParams(prev => ({ ...prev, ...update }))
  }, [])

  // Ring finger → navbar toggle
  useEffect(() => {
    if (ringFolded && !prevRingRef.current) {
      const now = Date.now()
      if (now - ringCooldownRef.current > 500) {
        ringCooldownRef.current = now
        setNavOpen(p => !p)
      }
    }
    prevRingRef.current = ringFolded
  }, [ringFolded])

  return (
      <div className="app-shell">
        <div className="canvas-shell">
          <Canvas
            onCreated={(state) => {
              glRef.current = state.gl;
            }}
            camera={{ position: [0, 0, 3.5], fov: 50 }} dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true }} style={{ zIndex: 0 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 2, 4]} intensity={1.2} />
            <AmbientBackground
              palmCenter={palmCenter}
              interactionStrength={hasDetectedHand ? 1 : 0}
              lowPerf={isLowPerf}
            />
            <HandScene
              landmarks={landmarks}
              shaderMap={shaderMap}
              palmCenter={palmCenter}
              handAngle={handAngle}
              lowPerf={isLowPerf}
              interactiveId={interactiveId}
              videoRef={videoRef}
              onFilterChange={setPortalFilter}
              centralParams={centralParams}
              onCentralParamsChange={handleCentralChange}
              centralMode={activeMode}
              modeHandIndex={modeHandIndex}
            />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>

        <ErrorBoundary>
          {!onboardingDone && (
          <OnboardingOverlay
            hasDetectedHand={hasDetectedHand}
            isReady={isReady}
            onDismiss={handleOnboardingDismiss}
          />
        )}
        <div className="hand-debug-overlay">
          {handedness.map((label, index) => (
            <div
              key={index}
              className={`hand-debug-pill hand-debug-${label.toLowerCase()}`}
            >
              {`Hand ${index + 1}: ${label}`}
            </div>
          ))}
        </div>
        <div className={`nav-grip ${navOpen ? "hidden" : ""}`} onClick={() => setNavOpen(true)} />
        <nav className={`nav-overlay ${!navOpen ? "nav-closed" : ""}`}>
          <RoutingPanel
            activeJointLabel={activeJointLabel}
            activeShaderLabel={activeShaderLabel}
            activeShaderDescription={activeShaderDescription}
            isReady={isReady}
            isTracking={isTracking}
            hasDetectedHand={hasDetectedHand}
            error={error}
            onScreenshot={takeScreenshot}
            onNavToggle={() => setNavOpen(p => !p)}
            onReset={handleReset}
            interactives={INTERACTIVES}
            activeInteractive={interactiveId}
            onInteractiveChange={handleInteractiveChange}
          />
        </nav>
        </ErrorBoundary>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden-video"
        />
        {interactiveId === "sphere-halo" && (
          <div className="mode-badge">
            {MODE_INFO[activeMode].icon} {MODE_INFO[activeMode].label}
          </div>
        )}
        {interactiveId === "airglow" && (
          <div className="airglow-layer">
            <AirGlow
              landmarks={landmarks}
              handedness={handedness}
              penHand={penHand}
              mode={activeMode}
              modeHandIndex={modeHandIndex}
              resetSignal={resetSignal}
            />
            <div className="airglow-hand-menu" role="group" aria-label="Pen hand">
              {(["left", "auto", "right"] as const).map((hand) => (
                <button
                  key={hand}
                  className={`airglow-hand-btn ${penHand === hand ? "active" : ""}`}
                  aria-pressed={penHand === hand}
                  onClick={() => handlePenHandChange(hand)}
                >
                  {hand === "auto" ? "Auto" : hand[0].toUpperCase() + hand.slice(1)}
                </button>
              ))}
            </div>
            <div className="mode-badge airglow-badge">
              AIRGLOW &middot; {AIRGLOW_TOOL_INFO[activeMode]?.label ?? "Pen"}
            </div>
          </div>
        )}
        {interactiveId === "retrolens" && (
          <div className="portal-badge">RETROLENS &middot; {portalFilter}</div>
        )}
      </div>
  );
}

export default App;
