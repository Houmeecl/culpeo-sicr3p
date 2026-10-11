import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { WORLD } from "./palette";

type GuideProps = {
  position: [number, number, number];
  /** Cambia con cada pregunta: el guía da un pequeño salto. */
  cue: number;
  still: boolean;
};

/** Aparición con rebote, respiración y salto al cambiar de pregunta. */
function useGuideMotion(cue: number, still: boolean) {
  const ref = useRef<Group>(null);
  const born = useRef(0);
  const hop = useRef(0);

  useEffect(() => {
    hop.current = 1;
  }, [cue]);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    if (still) {
      g.scale.setScalar(1);
      g.position.y = 0;
      return;
    }
    born.current = Math.min(1, born.current + delta * 1.6);
    const t = born.current;
    const pop = t < 1 ? 1 + Math.sin(t * Math.PI) * 0.25 * (1 - t) : 1;
    g.scale.setScalar(t * pop);
    hop.current = Math.max(0, hop.current - delta * 2.2);
    const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    g.position.y = Math.sin(hop.current * Math.PI) * 0.25 + breathe;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.18;
  });

  return ref;
}

function Leg({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <mesh position={[x, 0.12, z]} castShadow>
      <cylinderGeometry args={[0.07, 0.07, 0.24, 12]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Eyes({ y, z, spread }: { y: number; z: number; spread: number }) {
  return (
    <>
      {[-spread, spread].map((x) => (
        <mesh key={x} position={[x, y, z]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={WORLD.ink} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

/** Culpeo, el zorro: guía de empresas. */
export function Culpeo3D({ position, cue, still }: GuideProps) {
  const motion = useGuideMotion(cue, still);
  const fur = { color: WORLD.culpeo, roughness: 0.75 };
  return (
    <group position={position}>
      <group ref={motion}>
        <mesh position={[0, 0.45, 0]} scale={[1, 0.85, 1.2]} castShadow>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial {...fur} />
        </mesh>
        <mesh position={[0, 0.42, 0.28]} scale={[0.75, 0.7, 0.5]}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshStandardMaterial color={WORLD.cream} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.92, 0.22]} castShadow>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial {...fur} />
        </mesh>
        <mesh position={[0, 0.86, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.13, 0.32, 20]} />
          <meshStandardMaterial color={WORLD.cream} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.86, 0.69]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={WORLD.ink} />
        </mesh>
        <Eyes y={0.98} z={0.46} spread={0.11} />
        {[-0.15, 0.15].map((x) => (
          <mesh
            key={x}
            position={[x, 1.2, 0.16]}
            rotation={[0, 0, x < 0 ? 0.25 : -0.25]}
            castShadow
          >
            <coneGeometry args={[0.1, 0.3, 16]} />
            <meshStandardMaterial {...fur} />
          </mesh>
        ))}
        <group position={[0, 0.55, -0.42]} rotation={[0.9, 0, 0]}>
          <mesh scale={[0.6, 0.6, 1.6]} castShadow>
            <sphereGeometry args={[0.17, 16, 16]} />
            <meshStandardMaterial {...fur} />
          </mesh>
          <mesh position={[0, 0, -0.26]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={WORLD.cream} roughness={0.8} />
          </mesh>
        </group>
        <Leg x={-0.17} z={0.2} color={WORLD.dark} />
        <Leg x={0.17} z={0.2} color={WORLD.dark} />
        <Leg x={-0.17} z={-0.22} color={WORLD.dark} />
        <Leg x={0.17} z={-0.22} color={WORLD.dark} />
      </group>
    </group>
  );
}

/** La chancha rosa: guía de personas y fidelización. */
export function Chancha3D({ position, cue, still }: GuideProps) {
  const motion = useGuideMotion(cue, still);
  const skin = { color: WORLD.pink, roughness: 0.7 };
  return (
    <group position={position}>
      <group ref={motion}>
        <mesh position={[0, 0.48, 0]} scale={[1.1, 0.92, 1.15]} castShadow>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        <mesh position={[0, 0.8, 0.36]} castShadow>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        <mesh position={[0, 0.76, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.14, 0.12, 24]} />
          <meshStandardMaterial color={WORLD.pinkDeep} roughness={0.6} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 0.76, 0.725]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshStandardMaterial color={WORLD.ink} />
          </mesh>
        ))}
        <Eyes y={0.9} z={0.6} spread={0.12} />
        {[-0.18, 0.18].map((x) => (
          <mesh
            key={x}
            position={[x, 1.06, 0.3]}
            rotation={[0.35, 0, x < 0 ? 0.6 : -0.6]}
            scale={[1, 1, 0.45]}
            castShadow
          >
            <coneGeometry args={[0.11, 0.22, 16]} />
            <meshStandardMaterial color={WORLD.pinkDeep} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 0.6, -0.5]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.07, 0.025, 8, 20, Math.PI * 1.6]} />
          <meshStandardMaterial color={WORLD.pinkDeep} />
        </mesh>
        <Leg x={-0.2} z={0.2} color={WORLD.pinkDeep} />
        <Leg x={0.2} z={0.2} color={WORLD.pinkDeep} />
        <Leg x={-0.2} z={-0.22} color={WORLD.pinkDeep} />
        <Leg x={0.2} z={-0.22} color={WORLD.pinkDeep} />
      </group>
    </group>
  );
}
