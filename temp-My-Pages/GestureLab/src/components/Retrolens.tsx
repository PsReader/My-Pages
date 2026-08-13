import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import type { HandLandmark } from "../hooks/useHands";
import { isExtended } from "../hooks/useFingerCount";

const FILTERS = [
  "MONO",
  "DUAL-TONE",
  "PIXELATE",
  "INVERT",
  "SEPIA",
  "BLUR",
  "THERMAL",
  "SKETCH",
  "GLITCH",
  "NEON",
];

const EDGE_POINTS = 12;

function pinkyOnlyFolded(hand: HandLandmark[]): boolean {
  if (!hand || hand.length < 21) return false;
  const pinkyFolded = !isExtended(hand, 20, 19);
  const indexUp = isExtended(hand, 8, 7);
  const middleUp = isExtended(hand, 12, 11);
  const ringUp = isExtended(hand, 16, 15);
  return pinkyFolded && indexUp && middleUp && ringUp;
}

const portalVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const portalFragmentShader = /* glsl */ `
  uniform sampler2D u_tex;
  uniform int u_filter;
  uniform float u_time;
  uniform vec2 u_texel;
  varying vec2 vUv;

  float luma(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  vec3 jet(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 low = vec3(0.0, 0.0, 0.55);
    vec3 mid = vec3(0.1, 1.0, 0.9);
    vec3 high = vec3(1.0, 0.05, 0.0);
    vec3 c = mix(low, mid, smoothstep(0.0, 0.5, t));
    return mix(c, high, smoothstep(0.5, 1.0, t));
  }

  float edgeMag(sampler2D tex, vec2 uv) {
    vec2 e = u_texel;
    float s00 = luma(texture2D(tex, uv + e * vec2(-1.0, -1.0)).rgb);
    float s01 = luma(texture2D(tex, uv + e * vec2( 0.0, -1.0)).rgb);
    float s02 = luma(texture2D(tex, uv + e * vec2( 1.0, -1.0)).rgb);
    float s10 = luma(texture2D(tex, uv + e * vec2(-1.0,  0.0)).rgb);
    float s12 = luma(texture2D(tex, uv + e * vec2( 1.0,  0.0)).rgb);
    float s20 = luma(texture2D(tex, uv + e * vec2(-1.0,  1.0)).rgb);
    float s21 = luma(texture2D(tex, uv + e * vec2( 0.0,  1.0)).rgb);
    float s22 = luma(texture2D(tex, uv + e * vec2( 1.0,  1.0)).rgb);
    float gx = (s02 + 2.0 * s12 + s22) - (s00 + 2.0 * s10 + s20);
    float gy = (s00 + 2.0 * s01 + s02) - (s20 + 2.0 * s21 + s22);
    return sqrt(gx * gx + gy * gy);
  }

  void main() {
    vec2 uv = vUv;
    vec3 col = texture2D(u_tex, uv).rgb;

    if (u_filter == 0) {
      float g = luma(col);
      col = vec3(g);
    } else if (u_filter == 1) {
      float g = luma(col);
      col = g > 0.5 ? vec3(1.0, 0.65, 0.0) : vec3(1.0, 0.08, 0.58);
    } else if (u_filter == 2) {
      float grid = 80.0;
      vec2 pu = (floor(uv * grid) + 0.5) / grid;
      col = texture2D(u_tex, pu).rgb;
    } else if (u_filter == 3) {
      col = 1.0 - col;
    } else if (u_filter == 4) {
      mat3 sepia = mat3(
        0.272, 0.534, 0.131,
        0.349, 0.686, 0.168,
        0.393, 0.769, 0.189
      );
      col = clamp(sepia * col, 0.0, 1.0);
    } else if (u_filter == 5) {
      vec2 e = u_texel;
      col = texture2D(u_tex, uv + e * vec2(-1.0, -1.0)).rgb
          + texture2D(u_tex, uv + e * vec2(0.0, -1.0)).rgb
          + texture2D(u_tex, uv + e * vec2(1.0, -1.0)).rgb
          + texture2D(u_tex, uv + e * vec2(-1.0, 0.0)).rgb
          + texture2D(u_tex, uv + e * vec2(1.0, 0.0)).rgb
          + texture2D(u_tex, uv + e * vec2(-1.0, 1.0)).rgb
          + texture2D(u_tex, uv + e * vec2(0.0, 1.0)).rgb
          + texture2D(u_tex, uv + e * vec2(1.0, 1.0)).rgb;
      col /= 8.0;
    } else if (u_filter == 6) {
      col = jet(luma(col));
    } else if (u_filter == 7) {
      float g = luma(col);
      float e = edgeMag(u_tex, uv);
      float sketch = clamp(g - e * 2.2, 0.0, 1.0);
      col = vec3(sketch * 1.25);
    } else if (u_filter == 8) {
      float shift = 0.015 + 0.02 * sin(u_time * 6.0);
      float r = texture2D(u_tex, uv + vec2(shift, 0.0)).r;
      float b = texture2D(u_tex, uv - vec2(shift, 0.0)).b;
      col = vec3(r, col.g, b);
    } else if (u_filter == 9) {
      float e = edgeMag(u_tex, uv);
      col = vec3(0.0) + vec3(0.1, 1.0, 1.0) * smoothstep(0.15, 0.6, e);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface RetrolensProps {
  landmarks: HandLandmark[][];
  videoRef: RefObject<HTMLVideoElement | null>;
  lowPerf?: boolean;
  onFilterChange?: (name: string) => void;
}

type Corner = { x: number; y: number };

export function Retrolens({
  landmarks,
  videoRef,
  lowPerf,
  onFilterChange,
}: RetrolensProps) {
  const groupRef = useRef<THREE.Group>(null);
  const quadRef = useRef<THREE.Mesh>(null);
  const borderRef = useRef<THREE.LineLoop>(null);
  const glowRef = useRef<THREE.Points>(null);

  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    setVideoTexture(tex);
    return () => {
      tex.dispose();
    };
  }, [videoRef]);

  const quadGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(8), 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: portalVertexShader,
        fragmentShader: portalFragmentShader,
        uniforms: {
          u_tex: { value: null },
          u_filter: { value: 0 },
          u_time: { value: 0 },
          u_texel: { value: new THREE.Vector2(1 / 1280, 1 / 720) },
        },
        side: THREE.DoubleSide,
        transparent: false,
      }),
    [],
  );

  const borderGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    return geo;
  }, []);

  const glowPoints = useMemo(() => {
    const count = lowPerf ? 8 : EDGE_POINTS;
    const positions = new Float32Array(count * 4 * 3);
    const jitter = new Float32Array(count * 4 * 2);
    for (let i = 0; i < count * 4; i++) {
      jitter[i * 2] = (Math.random() - 0.5) * 0.02;
      jitter[i * 2 + 1] = (Math.random() - 0.5) * 0.02;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geo, jitter, count };
  }, [lowPerf]);

  const smoothCornersRef = useRef<Corner[]>([
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
  ]);
  const hadHandsRef = useRef(false);

    const filterIndexRef = useRef(0);
    const filterCooldownRef = useRef(0);
    const prevPoseRef = useRef(false);

  useFrame(({ clock, size }) => {
    const group = groupRef.current;
    if (!group) return;

    const aspect = size.width / Math.max(size.height, 1);
    const wX = aspect * 1.3;
    const wY = 1.3;

    const hand0 = landmarks[0];
    const hand1 = landmarks[1];
    const both = hand0?.length >= 21 && hand1?.length >= 21;
    const targets = both
      ? [
          { x: hand0[4].x, y: hand0[4].y },
          { x: hand0[8].x, y: hand0[8].y },
          { x: hand1[4].x, y: hand1[4].y },
          { x: hand1[8].x, y: hand1[8].y },
        ]
      : null;

    const visible = both && !!targets;
    if (!visible) hadHandsRef.current = false;
    if (!visible || !targets) {
      group.visible = false;
      return;
    }

    const smooth = smoothCornersRef.current;
    if (!hadHandsRef.current) {
      for (let i = 0; i < 4; i++) smooth[i] = { ...targets[i] };
      hadHandsRef.current = true;
    } else {
      for (let i = 0; i < 4; i++) {
        smooth[i].x += (targets[i].x - smooth[i].x) * 0.4;
        smooth[i].y += (targets[i].y - smooth[i].y) * 0.4;
      }
    }

    const order = [0, 1, 2, 3].sort((a, b) => {
      const cx = (smooth[0].x + smooth[1].x + smooth[2].x + smooth[3].x) / 4;
      const cy = (smooth[0].y + smooth[1].y + smooth[2].y + smooth[3].y) / 4;
      const aa = Math.atan2(smooth[a].y - cy, smooth[a].x - cx);
      const ab = Math.atan2(smooth[b].y - cy, smooth[b].x - cx);
      return aa - ab;
    });

    const pos = quadGeometry.attributes.position as THREE.BufferAttribute;
    const uv = quadGeometry.attributes.uv as THREE.BufferAttribute;
    const px = pos.array as Float32Array;
    const uva = uv.array as Float32Array;
    order.forEach((corner, i) => {
      const c = smooth[corner];
      px[i * 3] = (c.x - 0.5) * wX;
      px[i * 3 + 1] = (0.5 - c.y) * wY;
      px[i * 3 + 2] = 0;
      uva[i * 2] = c.x;
      uva[i * 2 + 1] = 1 - c.y;
    });
    pos.needsUpdate = true;
    uv.needsUpdate = true;
    quadGeometry.computeBoundingSphere();

    const borderPos = borderGeometry.attributes.position as THREE.BufferAttribute;
    const bp = borderPos.array as Float32Array;
    for (let i = 0; i < 4; i++) {
      const c = smooth[order[i]];
      bp[i * 3] = (c.x - 0.5) * wX;
      bp[i * 3 + 1] = (0.5 - c.y) * wY;
      bp[i * 3 + 2] = 0;
    }
    borderPos.needsUpdate = true;
    borderGeometry.computeBoundingSphere();

    const glowGeo = glowRef.current?.geometry as THREE.BufferGeometry | undefined;
    if (glowGeo) {
      const gp = (glowGeo.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const jitter = glowPoints.jitter;
      const count = glowPoints.count;
      for (let e = 0; e < 4; e++) {
        const a = smooth[order[e]];
        const b = smooth[order[(e + 1) % 4]];
        for (let i = 0; i < count; i++) {
          const t = (i + 0.5) / count;
          const idx = e * count + i;
          gp[idx * 3] = (a.x + (b.x - a.x) * t - 0.5) * wX + jitter[idx * 2];
          gp[idx * 3 + 1] = (0.5 - (a.y + (b.y - a.y) * t)) * wY + jitter[idx * 2 + 1];
          gp[idx * 3 + 2] = 0;
        }
      }
      (glowGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      glowGeo.computeBoundingSphere();
    }

    if (videoTexture) {
      const video = videoRef.current;
      if (video && video.videoWidth > 0) {
        material.uniforms.u_texel.value.set(1 / video.videoWidth, 1 / video.videoHeight);
      }
    }
    material.uniforms.u_time.value = clock.elapsedTime;

    group.visible = true;

    /* ---- Gesture cycling ---- */
    const idxDist = Math.hypot(hand0[8].x - hand1[8].x, hand0[8].y - hand1[8].y);
    const pose = idxDist < 0.06 || pinkyOnlyFolded(hand0) || pinkyOnlyFolded(hand1);

    if (pose && !prevPoseRef.current) {
      const now = clock.elapsedTime * 1000;
      if (now - filterCooldownRef.current > 500) {
        filterCooldownRef.current = now;
        filterIndexRef.current = (filterIndexRef.current + 1) % FILTERS.length;
        material.uniforms.u_filter.value = filterIndexRef.current;
        onFilterChange?.(FILTERS[filterIndexRef.current]);
      }
    }
    prevPoseRef.current = pose;
  });

  useEffect(() => {
    if (videoTexture && material) {
      material.uniforms.u_tex.value = videoTexture;
    }
  }, [videoTexture, material]);

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={quadRef} geometry={quadGeometry} material={material} />
      <lineLoop ref={borderRef} geometry={borderGeometry}>
        <lineBasicMaterial
          color="#7df3ff"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineLoop>
      <points ref={glowRef} geometry={glowPoints.geo} frustumCulled={false}>
        <pointsMaterial
          size={0.025}
          sizeAttenuation={true}
          transparent
          opacity={0.9}
          color="#8ff0ff"
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
