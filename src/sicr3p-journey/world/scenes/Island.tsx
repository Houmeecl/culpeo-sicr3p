import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { WORLD } from "../assets/palette";
import { STATION_COUNT, ringPoint } from "../stations/layout";

/** Maqueta base: isla redonda con casas y árboles entre las estaciones. */
export function Island() {
  const props = useMemo(
    () =>
      Array.from({ length: STATION_COUNT }, (_, i) => {
        const [x, z] = ringPoint(i + 0.5, 5.6);
        const house = i % 2 === 0;
        const roofs = [WORLD.pink, WORLD.ink, WORLD.pinkSoft];
        return {
          x,
          z,
          house,
          h: 0.6 + ((i * 7) % 5) * 0.12,
          roof: roofs[i % 3],
          s: 0.8 + (i % 3) * 0.12,
        };
      }),
    [],
  );

  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[6.4, 6.4, 0.5, 64]} />
        <meshStandardMaterial color={WORLD.island} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[6.1, 5.6, 0.5, 64]} />
        <meshStandardMaterial color={WORLD.islandSide} roughness={1} />
      </mesh>
      {props.map((p, i) =>
        p.house ? (
          <group key={i} position={[p.x, 0.2, p.z]} rotation={[0, -Math.atan2(p.z, p.x), 0]}>
            <mesh position={[0, p.h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.7, p.h, 0.7]} />
              <meshStandardMaterial color={WORLD.island} roughness={0.85} />
            </mesh>
            <mesh position={[0, p.h + 0.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.55, 0.4, 4]} />
              <meshStandardMaterial color={p.roof} roughness={0.7} />
            </mesh>
          </group>
        ) : (
          <group key={i} position={[p.x, 0.2, p.z]} scale={p.s}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
              <meshStandardMaterial color={WORLD.trunk} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color={WORLD.tree} roughness={0.9} />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
}

/** Al centro: el anillo rosa, "todo comienza con una conexión". */
export function Connection({ still }: { still: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m || still) return;
    const t = state.clock.elapsedTime;
    m.rotation.y = t * 0.4;
    m.position.y = 1.55 + Math.sin(t * 0.9) * 0.08;
  });
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.3, 40]} />
        <meshStandardMaterial color={WORLD.island} roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, 1.55, 0]} castShadow>
        <torusGeometry args={[0.55, 0.16, 24, 64]} />
        <meshStandardMaterial color={WORLD.pink} roughness={0.45} />
      </mesh>
    </group>
  );
}
