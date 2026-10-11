import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Vector3 } from "three";
import { ringPoint, stationAngle } from "../stations/layout";

type Props = {
  /** Posición objetivo sobre el anillo (en unidades de estación). */
  target: number;
  /** Desplazamiento lateral (para que dos personajes esperen lado a lado). */
  side?: number;
  /** Posición viva del personaje, para que la cámara lo siga. */
  follow?: Vector3;
  still: boolean;
  children: ReactNode;
};

const SPEED = 0.9; // estaciones por segundo

/**
 * Mueve al personaje por el anillo hasta su punto objetivo: camina (con paso)
 * mirando hacia adonde va y, al llegar, se gira hacia la cámara (al centro).
 */
export function Walker({ target, side = 0, follow, still, children }: Props) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const s = useRef(target);

  useFrame((state, delta) => {
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    const diff = target - s.current;
    const step = still ? diff : Math.sign(diff) * Math.min(Math.abs(diff), SPEED * delta);
    s.current += step;
    const walking = Math.abs(target - s.current) > 0.002;

    const a = stationAngle(s.current);
    const [x, z] = ringPoint(s.current);
    // tangente (sentido de avance) y normal hacia afuera
    const tx = -Math.sin(a);
    const tz = Math.cos(a);
    g.position.set(x + tx * side, 0.2, z + tz * side);
    follow?.set(x, 0.2, z);

    const dir = Math.sign(diff) || 1;
    // Al llegar mira hacia el centro, donde está la cámara.
    const heading = walking
      ? Math.atan2(tx * dir, tz * dir)
      : Math.atan2(-Math.cos(a), -Math.sin(a));
    let turn = heading - g.rotation.y;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    g.rotation.y += still ? turn : turn * Math.min(1, delta * 8);

    b.position.y = walking && !still ? Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.09 : 0;
    b.rotation.z = walking && !still ? Math.sin(state.clock.elapsedTime * 11) * 0.06 : 0;
  });

  return (
    <group ref={root}>
      <group ref={body}>{children}</group>
    </group>
  );
}
