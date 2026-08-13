import { useEffect, useRef } from "react";
import type { HandLandmark, HandednessLabel } from "../hooks/useHands";
import { isExtended } from "../hooks/useFingerCount";

const DEFAULT_COLOR = "#6cdcff";
const WHEEL_SIZE = 260;
const PEN_SIZE = 5;
const SHAPE_SIZE = 3;
const ERASE_SIZE = 20;
const MIN_MOVE = 2.5;
const SMOOTH = 0.6;

/* Match the R3F camera projection used by the hand skeleton
   (Canvas camera: fov 50, position z 3.5; HandScene worldScale 1.3) */
const CAM_FOV = 50;
const CAM_Z = 3.5;
const WORLD_SCALE = 1.3;
const VISIBLE_H = 2 * Math.tan((CAM_FOV / 2) * (Math.PI / 180)) * CAM_Z;

function projectToScreen(
  lm: HandLandmark,
  w: number,
  h: number,
): { x: number; y: number } {
  const aspect = w / Math.max(h, 1);
  const wx = (lm.x - 0.5) * aspect * WORLD_SCALE;
  const wy = (0.5 - lm.y) * WORLD_SCALE;
  const ndcX = wx / ((VISIBLE_H * aspect) / 2);
  const ndcY = wy / (VISIBLE_H / 2);
  return { x: ((ndcX + 1) / 2) * w, y: ((1 - ndcY) / 2) * h };
}

const SHAPE_TYPES = ["rect", "circle", "star"] as const;

type Tool = "pen" | "shape" | "erase";
type ShapeType = (typeof SHAPE_TYPES)[number];

interface Stroke {
  tool: Tool;
  color: string;
  size: number;
  shape?: ShapeType;
  points: { x: number; y: number }[];
}

export const AIRGLOW_TOOL_INFO: Record<number, { label: string }> = {
  0: { label: "Pen" },
  1: { label: "Pen" },
  2: { label: "Shape" },
  3: { label: "Pen" },
  4: { label: "Eraser" },
};

export type PenHand = "auto" | "left" | "right";

interface AirGlowProps {
  landmarks: HandLandmark[][];
  handedness: HandednessLabel[];
  penHand: PenHand;
  mode: number;
  modeHandIndex: number;
  resetSignal: number;
}

function toolOf(mode: number): Tool {
  if (mode === 4) return "erase";
  if (mode === 2) return "shape";
  return "pen";
}

function pinkyOnlyFolded(hand: HandLandmark[]): boolean {
  const pinkyFolded = !isExtended(hand, 20, 19);
  const indexUp = isExtended(hand, 8, 7);
  const middleUp = isExtended(hand, 12, 11);
  const ringUp = isExtended(hand, 16, 15);
  return pinkyFolded && indexUp && middleUp && ringUp;
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const to = (n: number) => Math.round((n + m) * 255);
  return [to(r), to(g), to(b)];
}

function hsvToHex(h: number, s: number, v: number): string {
  const [r, g, b] = hsvToRgb(h, s, v);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function buildWheelImage(size: number): ImageData {
  const data = new ImageData(size, size);
  const radius = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const r = Math.hypot(dx, dy);
      const idx = (y * size + x) * 4;
      if (r <= radius) {
        const hue = (Math.atan2(dy, dx) * 180) / Math.PI;
        const sat = r / radius;
        const [cr, cg, cb] = hsvToRgb(hue, sat, 1);
        data.data[idx] = cr;
        data.data[idx + 1] = cg;
        data.data[idx + 2] = cb;
        data.data[idx + 3] = 255;
      } else {
        data.data[idx + 3] = 0;
      }
    }
  }
  return data;
}

function drawShapeStroke(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
  shape: ShapeType,
  color: string,
  size: number,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color + "40";
  ctx.lineWidth = size;
  ctx.beginPath();
  if (shape === "rect") {
    ctx.rect(
      Math.min(a.x, b.x),
      Math.min(a.y, b.y),
      Math.abs(b.x - a.x),
      Math.abs(b.y - a.y),
    );
  } else if (shape === "circle") {
    ctx.arc(a.x, a.y, Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)), 0, Math.PI * 2);
  } else {
    const r = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const inner = r * 0.5;
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : inner;
      const px = a.x + Math.cos(ang) * rad;
      const py = a.y + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  if (s.tool === "erase") {
    if (s.points.length < 2) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = s.size;
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  if (s.tool === "shape" && s.points.length >= 2) {
    drawShapeStroke(ctx, s.points[0], s.points[s.points.length - 1], s.shape ?? "rect", s.color, s.size);
    return;
  }

  if (s.points.length >= 2) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.stroke();
    ctx.restore();
  }
}

export function AirGlow({ landmarks, handedness, penHand, mode, modeHandIndex, resetSignal }: AirGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef({ w: 0, h: 0 });

  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);
  const smoothRef = useRef<{ x: number; y: number } | null>(null);
  const colorRef = useRef(DEFAULT_COLOR);
  const shapeIdxRef = useRef(0);
  const prevModeRef = useRef(-1);
  const wheelBaseRef = useRef<ImageData | null>(null);
  const wheelDprRef = useRef(1);
  const wheelMarkerRef = useRef<{ x: number; y: number } | null>(null);

  const landmarksRef = useRef(landmarks);
  landmarksRef.current = landmarks;
  const handednessRef = useRef(handedness);
  handednessRef.current = handedness;
  const penHandRef = useRef(penHand);
  penHandRef.current = penHand;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const mhRef = useRef(modeHandIndex);
  mhRef.current = modeHandIndex;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimRef.current = { w, h };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    window.addEventListener("resize", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(WHEEL_SIZE * dpr);
    canvas.width = px;
    canvas.height = px;
    canvas.style.width = WHEEL_SIZE + "px";
    canvas.style.height = WHEEL_SIZE + "px";
    wheelDprRef.current = dpr;
    wheelBaseRef.current = buildWheelImage(px);
  }, []);

  useEffect(() => {
    strokesRef.current = [];
    currentRef.current = null;
    drawingRef.current = false;
    smoothRef.current = null;
    shapeIdxRef.current = 0;
    prevModeRef.current = -1;
  }, [resetSignal]);

  useEffect(() => {
    let raf = 0;

    const loop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const wheelCanvas = wheelRef.current;
      const wctx = wheelCanvas?.getContext("2d");

      const { w, h } = dimRef.current;
      const lm = landmarksRef.current;
      const curHandedness = handednessRef.current;
      const curPenHand = penHandRef.current;
      const curMode = modeRef.current;
      const mhIdx = mhRef.current;

      let drawHand: HandLandmark[] = [];
      if (curPenHand === "auto") {
        const otherIdx = mhIdx === 0 ? 1 : mhIdx === 1 ? 0 : -1;
        const hasOther = otherIdx >= 0 && lm[otherIdx]?.length >= 21;
        drawHand = hasOther
          ? lm[otherIdx]
          : lm[mhIdx] ?? lm[0] ?? [];
      } else {
        const targetLabel = curPenHand === "left" ? "Left" : "Right";
        const slot = curHandedness.findIndex((label) => label === targetLabel);
        const idx = slot >= 0 ? slot : curPenHand === "left" ? 0 : 1;
        const hand = lm[idx];
        drawHand = hand?.length >= 21 ? hand : [];
      }
      const valid = drawHand.length >= 21;
      const tip = valid ? drawHand[8] : null;

      const wheelOpen = valid && pinkyOnlyFolded(drawHand);

      if (curMode !== prevModeRef.current) {
        if (curMode === 2) shapeIdxRef.current = (shapeIdxRef.current + 1) % SHAPE_TYPES.length;
        prevModeRef.current = curMode;
      }

      if (tip) {
        const p = projectToScreen(tip, w, h);
        if (!smoothRef.current) smoothRef.current = { x: p.x, y: p.y };
        else {
          smoothRef.current.x += (p.x - smoothRef.current.x) * SMOOTH;
          smoothRef.current.y += (p.y - smoothRef.current.y) * SMOOTH;
        }
      } else {
        smoothRef.current = null;
      }

      wheelMarkerRef.current = null;
      if (wheelOpen && smoothRef.current) {
        const sp = smoothRef.current;
        const cx = w / 2;
        const cy = h / 2;
        const dx = sp.x - cx;
        const dy = sp.y - cy;
        const r = Math.hypot(dx, dy);
        const R = WHEEL_SIZE / 2;
        const hue = (Math.atan2(dy, dx) * 180) / Math.PI;
        const sat = Math.min(1, r / R);
        colorRef.current = hsvToHex(hue, sat, 1);
        const clampR = Math.min(r, R);
        wheelMarkerRef.current = {
          x: cx + (r > 0.001 ? (dx / r) * clampR : 0),
          y: cy + (r > 0.001 ? (dy / r) * clampR : 0),
        };
      }

      if (wheelCanvas) {
        wheelCanvas.style.visibility = wheelOpen ? "visible" : "hidden";
      }

      const gesture = valid && isExtended(drawHand, 8, 7);

      if (!valid || !gesture || wheelOpen || !smoothRef.current) {
        const cur = currentRef.current;
        if (cur) {
          if (cur.points.length >= 2) strokesRef.current.push(cur);
          currentRef.current = null;
        }
        drawingRef.current = false;
      } else {
        const sp = smoothRef.current;
        if (!drawingRef.current) {
          drawingRef.current = true;
          const tool = toolOf(curMode);
          const color = colorRef.current;
          const size = tool === "erase" ? ERASE_SIZE : tool === "shape" ? SHAPE_SIZE : PEN_SIZE;
          currentRef.current = {
            tool,
            color,
            size,
            shape: SHAPE_TYPES[shapeIdxRef.current],
            points: [{ x: sp.x, y: sp.y }],
          };
        } else {
          const cur = currentRef.current;
          if (cur) {
            const last = cur.points[cur.points.length - 1];
            if (Math.hypot(sp.x - last.x, sp.y - last.y) >= MIN_MOVE) {
              cur.points.push({ x: sp.x, y: sp.y });
            }
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      for (const s of strokesRef.current) drawStroke(ctx, s);
      const cur = currentRef.current;
      if (cur) drawStroke(ctx, cur);

      if (smoothRef.current && valid) {
        const sp = smoothRef.current;
        const col = colorRef.current;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, drawingRef.current ? 6 : 11, 0, Math.PI * 2);
        ctx.strokeStyle = drawingRef.current ? col : col + "88";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (wctx && wheelCanvas && wheelOpen) {
        wctx.setTransform(1, 0, 0, 1, 0, 0);
        wctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        if (wheelBaseRef.current) {
          wctx.putImageData(wheelBaseRef.current, 0, 0);
        }
        wctx.setTransform(wheelDprRef.current, 0, 0, wheelDprRef.current, 0, 0);
        const cx = w / 2;
        const cy = h / 2;
        wctx.beginPath();
        wctx.arc(cx, cy, WHEEL_SIZE / 2, 0, Math.PI * 2);
        wctx.strokeStyle = "rgba(255,255,255,0.3)";
        wctx.lineWidth = 1.5;
        wctx.stroke();
        wctx.fillStyle = colorRef.current;
        wctx.beginPath();
        wctx.arc(cx, cy, 11, 0, Math.PI * 2);
        wctx.fill();
        wctx.strokeStyle = "rgba(255,255,255,0.85)";
        wctx.lineWidth = 2;
        wctx.stroke();
        const marker = wheelMarkerRef.current;
        if (marker) {
          wctx.beginPath();
          wctx.arc(marker.x, marker.y, 7, 0, Math.PI * 2);
          wctx.strokeStyle = "#ffffff";
          wctx.lineWidth = 2.5;
          wctx.stroke();
          wctx.beginPath();
          wctx.arc(marker.x, marker.y, 3, 0, Math.PI * 2);
          wctx.fillStyle = "#ffffff";
          wctx.fill();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="airglow-canvas" />
      <canvas ref={wheelRef} className="airglow-wheel" />
    </>
  );
}
