import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { WORLD } from "../assets/palette";
import { ringPoint } from "./layout";

type Props = {
  done: boolean[];
  /** Estación hacia la que camina el personaje: su farol pulsa. */
  activeIndex: number | null;
  onSelect: (index: number) => void;
  still: boolean;
};

/** Anillo de estaciones: una por escena; se ilumina al completarla. Las completadas se pueden tocar. */
export function StationRing({ done, activeIndex, onSelect, still }: Props) {
  return (
    <group>
      {done.map((lit, i) => {
        const [x, z] = ringPoint(i);
        return (
          <Station
            key={i}
            position={[x, 0.2, z]}
            lit={lit}
            active={activeIndex === i}
            onSelect={lit ? () => onSelect(i) : undefined}
            still={still}
          />
        );
      })}
    </group>
  );
}

function Station({
  position,
  lit,
  active,
  onSelect,
  still,
}: {
  position: [number, number, number];
  lit: boolean;
  active: boolean;
  onSelect?: () => void;
  still: boolean;
}) {
  const lamp = useRef<Mesh>(null);
  useFrame((state) => {
    const m = lamp.current;
    if (!m) return;
    const pulse = active && !still ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.18 : 1;
    m.scale.setScalar(pulse);
  });
  const on = lit || active;
  return (
    <group
      position={position}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => {
        if (onSelect) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh receiveShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 28]} />
        <meshStandardMaterial
          color={lit ? WORLD.pink : WORLD.tileOff}
          emissive={lit ? WORLD.pink : "#000000"}
          emissiveIntensity={lit ? 0.35 : 0}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 10]} />
        <meshStandardMaterial color={WORLD.stone} />
      </mesh>
      <mesh ref={lamp} position={[0, 0.68, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color={on ? WORLD.pink : WORLD.island}
          emissive={on ? WORLD.pink : "#000000"}
          emissiveIntensity={on ? 0.9 : 0}
        />
      </mesh>
    </group>
  );
}

/** Baldosas entre dos estaciones: una por pregunta, se iluminan al responder. */
export function TrailTiles({ from, count, lit }: { from: number; count: number; lit: number }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const [x, z] = ringPoint(from + (i + 0.5) / count);
        const on = i < lit;
        return (
          <mesh key={i} position={[x, 0.22, z]} receiveShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 20]} />
            <meshStandardMaterial
              color={on ? WORLD.pink : WORLD.tileOff}
              emissive={on ? WORLD.pink : "#000000"}
              emissiveIntensity={on ? 0.5 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}
