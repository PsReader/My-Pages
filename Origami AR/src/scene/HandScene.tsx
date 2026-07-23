import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { HandLandmark } from "../hooks/useHands";
import { buildShaderMaterial } from "../shaders/buildShaderMaterial";

const jointIndices = Array.from({ length: 21 }, (_, index) => index);
const skeletonPairs = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];
const maxHands = 2;

interface HandSceneProps {
  landmarks: HandLandmark[][];
  shaderMap: Record<number, string>;
  palmCenter: { x: number; y: number } | null;
  pinchDistance: number;
}

export function HandScene({
  landmarks,
  shaderMap,
  palmCenter,
  pinchDistance,
}: HandSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const handGroupRefs = useRef<Array<THREE.Group | null>>([]);
  const jointGroupRefs = useRef<Array<Array<THREE.Group | null>>>([]);
  const meshRefs = useRef<Array<Array<THREE.Mesh | null>>>([]);
  const lineRef = useRef<THREE.Line<
    THREE.BufferGeometry,
    THREE.LineBasicMaterial
  > | null>(null);
  const lineGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialCacheRef = useRef<Map<string, THREE.ShaderMaterial>>(new Map());
  const prevPositionsRef = useRef<Array<THREE.Vector3>>([]);
  const skeletonRefs = useRef<Array<THREE.LineSegments | null>>([]);
  const skeletonGeometryRefs = useRef<Array<THREE.BufferGeometry | null>>([]);
  const haloRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // Smooth refs for central object interaction
  const smoothHaloPos = useRef(new THREE.Vector3(0, 0, 0));
  const smoothPulseScale = useRef(1);
  const smoothHaloTilt = useRef(new THREE.Euler(Math.PI / 2, 0, 0));
  const smoothGlowIntensity = useRef(0.18);

  const activeHands = [
    ...landmarks.slice(0, maxHands),
    ...Array(maxHands - landmarks.length).fill([]),
  ];

  useFrame(({ clock, size, camera }) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y = Math.sin(clock.elapsedTime * 0.55) * 0.18;
    group.position.z = Math.sin(clock.elapsedTime * 0.35) * 0.04;

    const aspect = size.width / Math.max(size.height, 1);
    const worldScaleX = aspect * 1.3;
    const worldScaleY = 1.3;
    const worldPositions: Array<Array<THREE.Vector3>> = [];
    let motionEnergy = 0;

    activeHands.forEach((handLandmarks, handIndex) => {
      const handGroup = handGroupRefs.current[handIndex];
      if (handGroup) {
        handGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.24);
      }

      const positionsForHand: Array<THREE.Vector3> = [];

      jointIndices.forEach((jointIndex, index) => {
        const jointGroup = jointGroupRefs.current[handIndex]?.[index];
        const mesh = meshRefs.current[handIndex]?.[index];
        const landmark = handLandmarks[jointIndex];

        // When no hand is tracked, fall back to previous position or
        // push offscreen so joints don't appear as ghosts
        const prev = prevPositionsRef.current[handIndex * 21 + index];
        const fallbackTarget =
          prev?.clone() ??
          new THREE.Vector3(
            0,
            10, // offscreen above viewport
            -2,
          );

        const target = landmark
          ? new THREE.Vector3(
              (landmark.x - 0.5) * worldScaleX,
              (0.5 - landmark.y) * worldScaleY,
              (landmark.z ?? 0) * 0.35,
            )
          : fallbackTarget.clone();

        const smoothFactor = landmark ? 0.72 : 0.2;
        const smoothed = prev
          ? prev.clone().lerp(target, smoothFactor)
          : target.clone();
        const velocity = target.distanceTo(prev ?? target);
        motionEnergy += velocity;
        prevPositionsRef.current[handIndex * 21 + index] = smoothed;
        positionsForHand[index] = smoothed.clone();

        if (jointGroup) {
          jointGroup.position.lerp(smoothed, 0.85);
        }

        if (mesh) {
          mesh.scale.setScalar(0.55 + Math.min(velocity * 2.6, 0.7));
          const shaderId = shaderMap[jointIndex] ?? "thermal-vision";
          const material =
            materialCacheRef.current.get(shaderId) ??
            buildShaderMaterial(shaderId);
          if (!materialCacheRef.current.has(shaderId)) {
            materialCacheRef.current.set(shaderId, material);
          }
          material.uniforms.u_time.value = clock.elapsedTime;
          material.uniforms.u_resolution.value.set(size.width, size.height);
          material.uniforms.u_velocity.value.set(
            velocity * 0.08,
            velocity * 0.08,
          );
          mesh.material = material;
        }
      });

      worldPositions[handIndex] = positionsForHand;

      const skeletonGeometry = skeletonGeometryRefs.current[handIndex];
      if (skeletonGeometry && positionsForHand.length) {
        const positions: number[] = [];
        skeletonPairs.forEach(([from, to]) => {
          const fromPoint = positionsForHand[from];
          const toPoint = positionsForHand[to];
          if (fromPoint && toPoint) {
            positions.push(
              fromPoint.x,
              fromPoint.y,
              fromPoint.z,
              toPoint.x,
              toPoint.y,
              toPoint.z,
            );
          }
        });
        skeletonGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3),
        );
        skeletonGeometry.attributes.position.needsUpdate = true;
      }
    });

    // ========================================================
    // CENTRAL OBJECT: Halo torus + Pulse sphere — hand reactive
    // ========================================================
    const halo = haloRef.current;
    const pulse = pulseRef.current;
    const intensity = Math.min(1, motionEnergy / 24);
    const hasPalm = palmCenter !== null;

    // Convert palm center from normalized [0,1] to world-space approx
    const palmWorldX = hasPalm ? (palmCenter!.x - 0.5) * worldScaleX : 0;
    const palmWorldY = hasPalm ? (0.5 - palmCenter!.y) * worldScaleY : 0;

    // Distance from palm to scene center (in world approx)
    const palmDistToCenter = hasPalm
      ? Math.sqrt(palmWorldX * palmWorldX + palmWorldY * palmWorldY)
      : 999;

    // Proximity factor: 1 when hand is at center, 0 when far
    const proximity = hasPalm ? Math.max(0, 1 - palmDistToCenter / 1.6) : 0;

    // Pinch factor: 0 = fully pinched, 1 = wide open
    // pinchDistance is ~0.0-0.3 normalized. Threshold ~0.05 = pinched
    const pinchNorm = Math.min(1, Math.max(0, (pinchDistance - 0.03) / 0.18));

    if (halo) {
      const haloMaterial = halo.material as THREE.MeshBasicMaterial;

      // Target position: gently attract toward palm, but clamped
      const attractStrength = proximity * 0.35;
      const targetX = palmWorldX * attractStrength;
      const targetY = palmWorldY * attractStrength;

      smoothHaloPos.current.x += (targetX - smoothHaloPos.current.x) * 0.06;
      smoothHaloPos.current.y += (targetY - smoothHaloPos.current.y) * 0.06;

      halo.position.x = smoothHaloPos.current.x;
      halo.position.y = smoothHaloPos.current.y;

      // Scale reacts to motion + proximity
      const haloScale = 1 + intensity * 0.24 + proximity * 0.15;
      halo.scale.setScalar(haloScale);

      // Tilt toward hand
      const tiltX = Math.PI / 2 + smoothHaloPos.current.y * 0.4;
      const tiltZ = clock.elapsedTime * 0.3 + smoothHaloPos.current.x * 0.3;
      const tiltY = clock.elapsedTime * 0.2;

      smoothHaloTilt.current.x += (tiltX - smoothHaloTilt.current.x) * 0.08;
      halo.rotation.x = smoothHaloTilt.current.x;
      halo.rotation.z = tiltZ;
      halo.rotation.y = tiltY;

      // Glow intensity increases with proximity
      const targetOpacity = 0.16 + intensity * 0.16 + proximity * 0.28;
      smoothGlowIntensity.current +=
        (targetOpacity - smoothGlowIntensity.current) * 0.1;
      haloMaterial.opacity = smoothGlowIntensity.current;

      // Color shifts warmer when hand is close
      const hue = 0.54 + intensity * 0.08 - proximity * 0.06;
      const sat = 0.74 + proximity * 0.2;
      const light = 0.68 + proximity * 0.15;
      haloMaterial.color.setHSL(hue, sat, light);
    }

    if (pulse) {
      const pulseMaterial = pulse.material as THREE.MeshBasicMaterial;

      // Pulse follows halo loosely
      pulse.position.x = smoothHaloPos.current.x * 0.8;
      pulse.position.y = smoothHaloPos.current.y * 0.8;
      pulse.position.z = -0.03;

      // Scale reacts to pinch: pinch = squeeze small, open = expand
      const pinchScale = 0.5 + pinchNorm * 0.8 + proximity * 0.3;
      const baseScale = 0.9 + intensity * 0.28;
      const targetScale = baseScale * pinchScale;

      smoothPulseScale.current +=
        (targetScale - smoothPulseScale.current) * 0.1;
      pulse.scale.setScalar(smoothPulseScale.current);

      // Opacity and color react to proximity + pinch
      const pulseOpacity = 0.07 + intensity * 0.14 + proximity * 0.22;
      pulseMaterial.opacity = pulseOpacity;

      const pH = 0.56 + intensity * 0.05 - proximity * 0.08;
      const pS = 0.82 + proximity * 0.15;
      const pL = 0.72 + proximity * 0.12;
      pulseMaterial.color.setHSL(pH, pS, pL);
    }

    const lineGeometry = lineGeometryRef.current;
    const line = lineRef.current;
    const firstHandPositions = worldPositions[0] ?? [];
    if (
      line &&
      lineGeometry &&
      firstHandPositions.length > 0 &&
      (shaderMap[4] === "plasma-bridge" || shaderMap[8] === "plasma-bridge")
    ) {
      lineGeometry.setFromPoints([
        firstHandPositions[4],
        firstHandPositions[8],
      ]);
      lineGeometry.attributes.position.needsUpdate = true;
      line.visible = true;
      if (line.material instanceof THREE.LineBasicMaterial) {
        line.material.opacity = 0.8;
      }
    } else if (line) {
      line.visible = false;
    }

    camera.position.x = Math.sin(clock.elapsedTime * 0.2) * 0.08;
    camera.position.y = Math.sin(clock.elapsedTime * 0.14) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.01, 12, 80]} />
        <meshBasicMaterial color="#77e9ff" transparent opacity={0.18} />
      </mesh>
      <mesh ref={pulseRef} position={[0, 0, -0.03]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#8ef4ff" transparent opacity={0.08} />
      </mesh>
      <primitive
        object={
          new THREE.Line(
            new THREE.BufferGeometry(),
            new THREE.LineBasicMaterial({
              color: "#8dfdff",
              transparent: true,
              opacity: 0.8,
              depthWrite: false,
            }),
          )
        }
        ref={lineRef}
        visible={false}
      />
      {Array.from({ length: maxHands }).map((_, handIndex) => {
        const handLandmarks = activeHands[handIndex] ?? [];
        return (
          <group
            key={`hand-${handIndex}`}
            visible={handLandmarks.length > 0}
            ref={(node) => {
              handGroupRefs.current[handIndex] = node;
            }}
          >
            {jointIndices.map((jointIndex, index) => (
              <group
                key={`${handIndex}-${jointIndex}-${index}`}
                ref={(node) => {
                  if (!jointGroupRefs.current[handIndex]) {
                    jointGroupRefs.current[handIndex] = [];
                  }
                  jointGroupRefs.current[handIndex][index] = node;
                }}
              >
                <mesh
                  ref={(node) => {
                    if (!meshRefs.current[handIndex]) {
                      meshRefs.current[handIndex] = [];
                    }
                    meshRefs.current[handIndex][index] = node;
                  }}
                >
                  <sphereGeometry args={[0.035, 16, 16]} />
                </mesh>
              </group>
            ))}
            <lineSegments
              ref={(node) => {
                skeletonRefs.current[handIndex] = node;
              }}
            >
              <bufferGeometry
                ref={(node) => {
                  skeletonGeometryRefs.current[handIndex] = node;
                }}
              />
              <lineBasicMaterial
                color={handIndex === 0 ? "#6cdcff" : "#a6a2ff"}
                transparent
                opacity={0.24}
              />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}
