import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCapture } from "./hooks/useCapture";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import { AmbientBackground } from "./components/AmbientBackground";
import { isLowPerfDevice } from "./lib/utils";
import { OnboardingOverlay } from "./components/OnboardingOverlay";
import { PalmMenu, type MenuItem } from "./components/PalmMenu";
import { RoutingPanel } from "./components/RoutingPanel";
import { SandboxPanel } from "./components/SandboxPanel";
import { useHands } from "./hooks/useHands";
import { useWebcam } from "./hooks/useWebcam";
import { HandScene } from "./scene/HandScene";
import { shaderRegistry } from "./shaders/shaderRegistry";
import { useFingerCount, useRingFingerFolded } from "./hooks/useFingerCount";

import { defaultCentralParams, MODE_INFO, type CentralParams } from "./components/CentralSphere";

const jointOptions = [
  { value: 4, label: "Thumb Tip" },
  { value: 8, label: "Index Tip" },
  { value: 12, label: "Middle Tip" },
  { value: 16, label: "Ring Tip" },
  { value: 20, label: "Pinky Tip" },
];

/* Palm = average of wrist(0) + finger MCP joints (5,9,13,17) */
const palmJoints = [0, 5, 9, 13, 17];

function computePalmCenter(
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

function computeHandAngle(
  handLandmarks: Array<{ x: number; y: number; z?: number }>,
): number {
  if (!handLandmarks || handLandmarks.length < 21) return 0
  const wrist = handLandmarks[0]
  const midMcp = handLandmarks[9]
  if (!wrist || !midMcp) return 0
  return Math.atan2(midMcp.y - wrist.y, midMcp.x - wrist.x)
}

function computePinchDistance(
  handLandmarks: Array<{ x: number; y: number; z?: number }>,
) {
  if (!handLandmarks || handLandmarks.length < 21) return 1;
  const thumb = handLandmarks[4];
  const index = handLandmarks[8];
  if (!thumb || !index) return 1;
  return Math.sqrt((thumb.x - index.x) ** 2 + (thumb.y - index.y) ** 2);
}

type RoutingPanelBaseProps = {
  jointOptions: { value: number; label: string }[];
  selectedJoint: number;
  shaderOptions: { value: string; label: string }[];
  shaderMap: Record<number, Record<number, string>>;
  activeJointLabel: string;
  activeShaderLabel: string;
  activeShaderDescription: string;
  isReady: boolean;
  isTracking: boolean;
  hasDetectedHand: boolean;
  error: string | null;
  handLabels: string[];
  activeHand: 0 | 1;
  onActiveHandChange: (hand: 0 | 1) => void;
  onSelectJoint: (value: number) => void;
  onSelectShader: (value: string) => void;
  onNavToggle: () => void;
}

function RoutingPanelWithCapture(props: RoutingPanelBaseProps) {
  const { gl } = useThree()
  const { takeScreenshot, startGifCapture, isCapturingGif } = useCapture(gl)
  return (
    <RoutingPanel
      {...props}
      onScreenshot={takeScreenshot}
      onGifCapture={startGifCapture}
      isCapturingGif={isCapturingGif}
    />
  )
}

function App() {
  const { videoRef, isReady, error } = useWebcam();
  const { landmarks, handedness, isTracking } = useHands(videoRef);
  const [selectedJoint, setSelectedJoint] = useState(8);
  const [activeHand, setActiveHand] = useState<0 | 1>(0);

  const initialShaderMap = {
    4: "plasma-bridge",
    8: "chromatic-aberration",
    12: "neon-scattering",
    16: "scanline-pulse",
    20: "topographic-matrix",
  }

  const [shaderMap, setShaderMap] = useState<Record<number, Record<number, string>>>({
    0: { ...initialShaderMap },
    1: { ...initialShaderMap },
  });

  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem("gesturelab-onboarded") === "true");

  const handleOnboardingDismiss = useCallback(() => {
    setOnboardingDone(true)
    localStorage.setItem("gesturelab-onboarded", "true")
  }, [])

  const isLowPerf = useMemo(() => isLowPerfDevice(), []);

  const [palmMenuOpen, setPalmMenuOpen] = useState(false);
  const palmMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const palmMenuCooldownRef = useRef(0);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxValues, setSandboxValues] = useState<Record<string, Record<string, number>>>({});
  const [centralParams, setCentralParams] = useState<CentralParams>(defaultCentralParams)

  const [navOpen, setNavOpen] = useState(true)
  const prevRingRef = useRef(false)
  const ringCooldownRef = useRef(0)

  const activeShaderId = shaderMap[activeHand]?.[selectedJoint] ?? shaderMap[0]?.[selectedJoint] ?? "thermal-vision";

  const handleSandboxChange = useCallback((key: string, val: number) => {
    setSandboxValues(prev => ({
      ...prev,
      [activeShaderId]: { ...(prev[activeShaderId] || {}), [key]: val },
    }))
  }, [activeShaderId])

  const handleSandboxReset = useCallback(() => {
    setSandboxValues(prev => {
      const next = { ...prev }
      delete next[activeShaderId]
      return next
    })
  }, [activeShaderId])

  const handlePalmMenuSelect = useCallback((item: MenuItem) => {
    item.action()
  }, [])

  const handlePalmMenuClose = useCallback(() => {
    setPalmMenuOpen(false)
    palmMenuCooldownRef.current = Date.now()
  }, [])

  const shaderOptions = useMemo(
    () =>
      Object.entries(shaderRegistry).map(([value, entry]) => ({
        value,
        label: entry.name,
      })),
    [],
  );

  const hasDetectedHand = landmarks.some((hand) => hand.length > 0);

  // Compute palm data from the first detected hand
  const firstHand = landmarks.find((hand) => hand.length > 0);
  const palmCenter = firstHand ? computePalmCenter(firstHand) : null;
  const pinchDistance = firstHand ? computePinchDistance(firstHand) : 1;
  const handAngle = firstHand ? computeHandAngle(firstHand) : 0;

  const fCount0 = useFingerCount(landmarks[0] || [])
  const fCount1 = useFingerCount(landmarks[1] || [])
  const modeHandIndex = useMemo(() => {
    if (fCount0 >= 1 && fCount0 <= 4) return 0
    if (fCount1 >= 1 && fCount1 <= 4) return 1
    return -1
  }, [fCount0, fCount1])
  const activeMode = modeHandIndex >= 0
    ? (modeHandIndex === 0 ? fCount0 : fCount1)
    : 0
  const ringFolded = useRingFingerFolded(landmarks)

  const navRef = useSwipeGesture(
    landmarks,
    [fCount0, fCount1],
    activeMode,
    navOpen,
    () => setNavOpen(p => !p),
  )

  const handleCentralChange = useCallback((update: Partial<CentralParams>) => {
    setCentralParams(prev => ({ ...prev, ...update }))
  }, [])

  const activeJointLabel =
    jointOptions.find((joint) => joint.value === selectedJoint)?.label ??
    "Index Tip";

  const currentShaderId = shaderMap[activeHand]?.[selectedJoint] ?? shaderMap[0]?.[selectedJoint] ?? "thermal-vision";
  const activeShaderEntry = shaderOptions.find(
    (option) => option.value === currentShaderId,
  );
  const activeShaderLabel = activeShaderEntry?.label ?? "Thermal Vision";
  const activeShaderDescription =
    Object.entries(shaderRegistry).find(
      ([value]) => value === currentShaderId,
    )?.[1]?.description ?? "A luminous membrane that responds to motion.";

  const Svg = ({ d }: { d: string }) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )

  const palmMenuItems: MenuItem[] = useMemo(() => [
    { id: "sandbox", label: "Tweak", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 3h8M4 8h8M4 13h8" /><circle cx="4" cy="3" r="1.5" fill="currentColor" /><circle cx="12" cy="8" r="1.5" fill="currentColor" /><circle cx="7" cy="13" r="1.5" fill="currentColor" /></svg>, action: () => setSandboxOpen((p) => !p) },
    { id: "next-joint", label: "Joint", icon: <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="4" fill="currentColor" /></svg>, action: () => setSelectedJoint((p) => p >= 20 ? 4 : p + 4) },
    { id: "capture", label: "Capture", icon: <Svg d="M14.5 13.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2l1-2h4l1 2h3a1 1 0 0 1 1 1v7.5zM8 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />, action: () => {
      const canvas = document.querySelector("canvas")
      if (canvas) {
        const link = document.createElement("a")
        link.download = `gesturelab-${Date.now()}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    }},
    { id: "reset", label: "Reset", icon: <Svg d="M4 6A6 6 0 1 1 2 9M2 2v5h5" />, action: () => handleSandboxReset() },
  ], [handleSandboxReset])

  // Gesture detection for palm menu
  useEffect(() => {
    if (!hasDetectedHand) {
      setPalmMenuOpen(false)
      return
    }

    if (palmMenuOpen) return

    if (pinchDistance > 0.15) {
      if (Date.now() - palmMenuCooldownRef.current < 1000) return
      if (!palmMenuTimerRef.current) {
        palmMenuTimerRef.current = setTimeout(() => {
          setPalmMenuOpen(true)
          palmMenuTimerRef.current = null
        }, 500)
      }
    } else {
      if (palmMenuTimerRef.current) {
        clearTimeout(palmMenuTimerRef.current)
        palmMenuTimerRef.current = null
      }
    }
  }, [hasDetectedHand, pinchDistance, palmMenuOpen])

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
          <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }} style={{ zIndex: 0 }}>
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
              sandboxValues={sandboxValues}
              lowPerf={isLowPerf}
              centralParams={centralParams}
              onCentralParamsChange={handleCentralChange}
              centralMode={activeMode}
              modeHandIndex={modeHandIndex}
            />
            <OrbitControls enableZoom={false} enablePan={false} />
            <Html fullscreen>
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
              <PalmMenu
                palmCenter={palmCenter}
                handAngle={handAngle}
                pinchDistance={pinchDistance}
                menuItems={palmMenuItems}
                isVisible={palmMenuOpen}
                onSelect={handlePalmMenuSelect}
                onClose={handlePalmMenuClose}
              />
              <div className={`nav-grip ${navOpen ? "hidden" : ""}`} onClick={() => setNavOpen(true)} />
              <nav ref={navRef} className={`nav-overlay ${!navOpen ? "nav-closed" : ""}`}>
                <RoutingPanelWithCapture
                  jointOptions={jointOptions}
                  selectedJoint={selectedJoint}
                  shaderOptions={shaderOptions}
                  shaderMap={shaderMap}
                  activeJointLabel={activeJointLabel}
                  activeShaderLabel={activeShaderLabel}
                  activeShaderDescription={activeShaderDescription}
                  isReady={isReady}
                  isTracking={isTracking}
                  hasDetectedHand={hasDetectedHand}
                  error={error}
                  handLabels={handedness}
                  activeHand={activeHand}
                  onActiveHandChange={setActiveHand}
                  onSelectJoint={setSelectedJoint}
                  onSelectShader={(value) =>
                    setShaderMap((prev) => ({
                      ...prev,
                      [activeHand]: { ...prev[activeHand], [selectedJoint]: value },
                    }))
                  }
                  onNavToggle={() => setNavOpen(p => !p)}
                />
              </nav>
            </Html>
          </Canvas>
        </div>

        <SandboxPanel
          shaderId={activeShaderId}
          values={sandboxValues[activeShaderId] ?? {}}
          onChange={handleSandboxChange}
          onReset={handleSandboxReset}
          open={sandboxOpen}
          onOpenChange={setSandboxOpen}
        />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden-video"
        />
        <div className="mode-badge">
          {MODE_INFO[activeMode].icon} {MODE_INFO[activeMode].label}
        </div>
      </div>
  );
}

export default App;
