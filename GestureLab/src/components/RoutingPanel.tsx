interface ShaderOption {
  value: string;
  label: string;
}

interface JointOption {
  value: number;
  label: string;
}

interface RoutingPanelProps {
  jointOptions: JointOption[];
  selectedJoint: number;
  shaderOptions: ShaderOption[];
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
  onScreenshot?: () => void;
  onGifCapture?: () => void;
  isCapturingGif?: boolean;
  onNavToggle: () => void;
}

export function RoutingPanel({
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
  handLabels,
  activeHand,
  onActiveHandChange,
  onSelectJoint,
  onSelectShader,
  onScreenshot,
  onGifCapture,
  isCapturingGif,
  onNavToggle,
}: RoutingPanelProps) {
  const currentShader = shaderMap[activeHand]?.[selectedJoint] ?? shaderMap[0]?.[selectedJoint] ?? "thermal-vision";
  const statusText =
    isReady && isTracking
      ? hasDetectedHand
        ? "Hand detected — live view"
        : "Camera live — waiting for hand"
      : "Camera idle — initializing";

  return (
    <div className="overlay-panel drawer-content">
      <div className="drawer-section">
        <p className="drawer-title">GestureLab</p>
        <p className="drawer-subtitle">Route light through the hand</p>
        <p className="drawer-tag">{activeShaderLabel} &middot; {activeJointLabel}</p>
      </div>

      <div className="drawer-section">
        <div className="drawer-row">
          <span className="drawer-label">Hand</span>
          <div className="drawer-hand-toggle">
            <button
              className={`drawer-hand-btn ${activeHand === 0 ? "active" : ""}`}
              onClick={() => onActiveHandChange(0)}
            >
              {handLabels[0] || "Left"}
            </button>
            <button
              className={`drawer-hand-btn ${activeHand === 1 ? "active" : ""}`}
              onClick={() => onActiveHandChange(1)}
            >
              {handLabels[1] || "Right"}
            </button>
          </div>
        </div>
        <div className="drawer-row">
          <span className="drawer-label">Joint</span>
          <select
            value={selectedJoint}
            onChange={(e) => onSelectJoint(Number(e.target.value))}
            className="drawer-select"
          >
            {jointOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="drawer-label" style={{ marginLeft: 8 }}>Shader</span>
          <select
            value={currentShader}
            onChange={(e) => onSelectShader(e.target.value)}
            className="drawer-select"
          >
            {shaderOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="drawer-section">
        <div className="drawer-row">
          <div className="drawer-status">
            <span className="status-pill" style={{ margin: 0 }}>
              <span className={`status-dot ${isReady && isTracking ? "active" : ""}`} />
              {isReady && isTracking ? "Live" : "Standby"}
            </span>
            <span className="drawer-status-text">{statusText}</span>
          </div>
          <div className="drawer-actions">
            <button className="drawer-action-btn" onClick={onScreenshot} title="Screenshot">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <button className="drawer-action-btn" onClick={onGifCapture} disabled={isCapturingGif} title={isCapturingGif ? "Recording..." : "Record GIF"}>
              {isCapturingGif ? (
                <span className="recording-dot" style={{ width: 6, height: 6 }} />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="drawer-section">
        <p className="drawer-desc">
          {activeShaderDescription}
          {error ? <span style={{ color: "#ff8c8c", display: "block", marginTop: 4 }}>{error}</span> : null}
        </p>
      </div>

      <div className="drawer-handle" onClick={onNavToggle}>
        <div className="drawer-handle-bar" />
      </div>
    </div>
  );
}
