import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { AmbientBackground } from "./components/AmbientBackground";
import { RoutingPanel } from "./components/RoutingPanel";
import { useHands } from "./hooks/useHands";
import { useWebcam } from "./hooks/useWebcam";
import { HandScene } from "./scene/HandScene";
import { shaderRegistry } from "./shaders/shaderRegistry";

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

function computePinchDistance(
  handLandmarks: Array<{ x: number; y: number; z?: number }>,
) {
  if (!handLandmarks || handLandmarks.length < 21) return 1;
  const thumb = handLandmarks[4];
  const index = handLandmarks[8];
  if (!thumb || !index) return 1;
  return Math.sqrt((thumb.x - index.x) ** 2 + (thumb.y - index.y) ** 2);
}

function App() {
  const { videoRef, isReady, error } = useWebcam();
  const { landmarks, handedness, isTracking } = useHands(videoRef);
  const [selectedJoint, setSelectedJoint] = useState(8);
  const [shaderMap, setShaderMap] = useState<Record<number, string>>({
    4: "plasma-bridge",
    8: "chromatic-aberration",
    12: "neon-scattering",
    16: "scanline-pulse",
    20: "topographic-matrix",
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const shaderOptions = useMemo(
    () =>
      Object.entries(shaderRegistry).map(([value, entry]) => ({
        value,
        label: entry.name,
      })),
    [],
  );

  useEffect(() => {
    gsap.from(panelRef.current, {
      y: 24,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
    });
  }, []);

  const activeJointLabel =
    jointOptions.find((joint) => joint.value === selectedJoint)?.label ??
    "Index Tip";
  const hasDetectedHand = landmarks.some((hand) => hand.length > 0);

  const activeShaderEntry = shaderOptions.find(
    (option) => option.value === (shaderMap[selectedJoint] ?? "thermal-vision"),
  );
  const activeShaderLabel = activeShaderEntry?.label ?? "Thermal Vision";
  const activeShaderDescription =
    Object.entries(shaderRegistry).find(
      ([value]) => value === (shaderMap[selectedJoint] ?? "thermal-vision"),
    )?.[1]?.description ?? "A luminous membrane that responds to motion.";

  // Compute palm data from the first detected hand
  const firstHand = landmarks.find((hand) => hand.length > 0);
  const palmCenter = firstHand ? computePalmCenter(firstHand) : null;
  const pinchDistance = firstHand ? computePinchDistance(firstHand) : 1;

  return (
    <div className="app-shell">
      <div className="canvas-shell">
        <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 2, 4]} intensity={1.2} />
          <AmbientBackground
            palmCenter={palmCenter}
            interactionStrength={hasDetectedHand ? 1 : 0}
          />
          <HandScene
            landmarks={landmarks}
            shaderMap={shaderMap}
            palmCenter={palmCenter}
            pinchDistance={pinchDistance}
          />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

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
      <RoutingPanel
        panelRef={panelRef}
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
        onSelectJoint={setSelectedJoint}
        onSelectShader={(value) =>
          setShaderMap((prev) => ({
            ...prev,
            [selectedJoint]: value,
          }))
        }
      />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden-video"
      />
    </div>
  );
}

export default App;
