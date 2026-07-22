import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AmbientBackgroundProps {
  palmCenter: { x: number; y: number } | null;
  interactionStrength: number;
}

export function AmbientBackground({
  palmCenter,
  interactionStrength,
}: AmbientBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const smoothHandRef = useRef(new THREE.Vector2(0.5, 0.5));
  const smoothStrengthRef = useRef(0);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_hand: { value: new THREE.Vector2(0.5, 0.5) },
        u_strength: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float u_time;
        uniform vec2 u_hand;
        uniform float u_strength;
        varying vec2 vUv;

        // Smooth hash for web noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          // Map UV from sphere to full screen coords
          vec2 uv = vUv * 2.0 - 1.0;

          // -- Hand interaction: map palm center from [0,1] to [-1,1] space --
          vec2 handPos = (u_hand * 2.0 - 1.0) * vec2(1.0, -1.0);
          float handDist = length(uv - handPos);

          // -- Warp UVs around the hand position --
          float warpAmount = u_strength * 0.35 * exp(-handDist * 2.8);
          vec2 warpDir = normalize(uv - handPos + 0.001);
          vec2 warped = uv + warpDir * warpAmount * sin(u_time * 2.0 + handDist * 8.0);

          // -- Dot grid web pattern --
          float gridScale = 14.0;
          vec2 gridUv = warped * gridScale;
          vec2 cellId = floor(gridUv);
          vec2 cellUv = fract(gridUv) - 0.5;

          // Animated dots at grid intersections
          float dotRadius = 0.08 + 0.03 * sin(u_time * 0.8 + cellId.x * 1.3 + cellId.y * 0.7);
          float dot = 1.0 - smoothstep(dotRadius - 0.02, dotRadius + 0.02, length(cellUv));

          // -- Web lines connecting dots --
          float lineThickness = 0.02 + 0.01 * sin(u_time * 0.5);
          float lineX = 1.0 - smoothstep(lineThickness, lineThickness + 0.015, abs(cellUv.y));
          float lineY = 1.0 - smoothstep(lineThickness, lineThickness + 0.015, abs(cellUv.x));
          float web = max(lineX, lineY) * 0.25;

          // -- Combine dot + web --
          float pattern = max(dot * 0.6, web);

          // -- Color palette: deep indigo base with cyan web --
          vec3 baseDark = vec3(0.01, 0.015, 0.04);
          vec3 webColor = vec3(0.12, 0.42, 0.72);
          vec3 glowColor = vec3(0.25, 0.85, 1.0);

          // Subtle noise for texture
          float n = noise(warped * 6.0 + u_time * 0.2) * 0.08;

          // Base color with web pattern
          vec3 col = baseDark + webColor * pattern * 0.35 + n;

          // -- Hand proximity glow --
          float handGlow = u_strength * 0.6 * exp(-handDist * handDist * 3.0);
          col += glowColor * handGlow;

          // -- Ripple rings emanating from hand --
          float ripple = sin(handDist * 24.0 - u_time * 4.0) * 0.5 + 0.5;
          ripple *= exp(-handDist * 2.2) * u_strength;
          col += glowColor * ripple * 0.25;

          // Subtle ambient wave for life when no hand present
          float ambientWave = sin(uv.x * 6.0 + u_time * 0.4) * cos(uv.y * 5.0 - u_time * 0.3);
          col += vec3(0.02, 0.04, 0.08) * ambientWave * 0.5 * (1.0 - u_strength * 0.6);

          // Vignette
          float vignette = 1.0 - dot(uv, uv) * 0.3;
          col *= vignette;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.03;
      material.uniforms.u_time.value = clock.elapsedTime;

      // Smooth hand position tracking
      const targetX = palmCenter?.x ?? 0.5;
      const targetY = palmCenter?.y ?? 0.5;
      smoothHandRef.current.x += (targetX - smoothHandRef.current.x) * 0.12;
      smoothHandRef.current.y += (targetY - smoothHandRef.current.y) * 0.12;
      material.uniforms.u_hand.value.copy(smoothHandRef.current);

      // Smooth strength transition
      const targetStrength = interactionStrength;
      smoothStrengthRef.current +=
        (targetStrength - smoothStrengthRef.current) * 0.08;
      material.uniforms.u_strength.value = smoothStrengthRef.current;
    }
  });

  return (
    <mesh ref={meshRef} scale={30}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
