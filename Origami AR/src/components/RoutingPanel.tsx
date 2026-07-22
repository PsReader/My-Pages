import type { RefObject } from "react";

interface ShaderOption {
  value: string;
  label: string;
}

interface JointOption {
  value: number;
  label: string;
}

interface RoutingPanelProps {
  panelRef: RefObject<HTMLDivElement>;
  jointOptions: JointOption[];
  selectedJoint: number;
  shaderOptions: ShaderOption[];
  shaderMap: Record<number, string>;
  activeJointLabel: string;
  activeShaderLabel: string;
  activeShaderDescription: string;
  isReady: boolean;
  isTracking: boolean;
  hasDetectedHand: boolean;
  error: string | null;
  onSelectJoint: (value: number) => void;
  onSelectShader: (value: string) => void;
}

export function RoutingPanel({
  panelRef,
  jointOptions,
  selectedJoint,
  shaderOptions,
  shaderMap,
  activeJointLabel,
  activeShaderLabel,
  activeShaderDescription,
  isReady,
  isTracking,
  hasDetectedHand,
  error,
  onSelectJoint,
  onSelectShader,
}: RoutingPanelProps) {
  const currentShader = shaderMap[selectedJoint] ?? "thermal-vision";
  const statusText =
    isReady && isTracking
      ? hasDetectedHand
        ? "Hand detected — live view"
        : "Camera live — waiting for hand"
      : "Camera idle — initializing";

  return (
    <nav ref={panelRef} className="overlay-panel top-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <p className="eyebrow">Origami AR</p>
          <div className="brand-title">Route light through the hand</div>
          <div className="brand-subtitle">
            {activeShaderLabel} · {activeJointLabel}
          </div>
        </div>

        <div className="navbar-controls">
          <label className="navbar-item">
            <span>Landmark</span>
            <select
              id="joint-select"
              value={selectedJoint}
              onChange={(event) => onSelectJoint(Number(event.target.value))}
              className="navbar-select"
            >
              {jointOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="navbar-item">
            <span>Shader preset</span>
            <select
              id="shader-select"
              value={currentShader}
              onChange={(event) => onSelectShader(event.target.value)}
              className="navbar-select"
            >
              {shaderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="navbar-status">
          <span className="status-pill">
            <span
              className={`status-dot ${isReady && isTracking ? "active" : ""}`}
            />
            {isReady && isTracking ? "Live" : "Standby"}
          </span>
          <div className="status-text">{statusText}</div>
        </div>
      </div>
      <div className="navbar-subinfo">
        <span className="subinfo-pill">{activeShaderDescription}</span>
        {error ? <span className="error-pill">{error}</span> : null}
      </div>
    </nav>
  );
}
