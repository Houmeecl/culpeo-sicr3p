import { useMemo, useRef, type ComponentType, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group } from "three";
import { WORLD } from "../assets/palette";
import { badgeTexture, type BadgeState } from "./badge-texture";
import { RING_RADIUS, STATION_COUNT, ringPoint, stationAngle } from "./layout";

/**
 * Señalética del recorrido: el camino que une las estaciones (se pinta al
 * avanzar) y el número de cada estación, siempre de cara a la cámara.
 */

/** Tramos del camino entre estaciones; un tramo se pinta cuando se recorrió. */
export function ProgressRoad({
  done,
  activeIndex,
}: {
  done: boolean[];
  activeIndex: number | null;
}) {
  const step = (Math.PI * 2) / STATION_COUNT;
  return (
    <group position={[0, 0.205, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {done.map((isDone, i) => {
        const nextDone = done[(i + 1) % STATION_COUNT] || activeIndex === i + 1;
        const lit = isDone && nextDone && i < STATION_COUNT - 1;
        return (
          <mesh key={i} receiveShadow>
            <ringGeometry
              args={[RING_RADIUS - 0.26, RING_RADIUS + 0.26, 18, 1, stationAngle(i), step]}
            />
            <meshStandardMaterial
              color={lit ? WORLD.accentSoft : WORLD.road}
              emissive={lit ? WORLD.accent : "#000000"}
              emissiveIntensity={lit ? 0.12 : 0}
              roughness={0.9}
              side={DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Número flotante de estación (1–11), con el estado codificado por color. */
export function StationBadges({
  done,
  activeIndex,
}: {
  done: boolean[];
  activeIndex: number | null;
}) {
  return (
    <group>
      {done.map((isDone, i) => {
        const state: BadgeState = activeIndex === i ? "current" : isDone ? "done" : "todo";
        const [x, z] = ringPoint(i);
        return (
          <Badge
            key={i}
            n={i + 1}
            state={state}
            position={[x, state === "current" ? 1.75 : 1.2, z]}
          />
        );
      })}
    </group>
  );
}

function Badge({
  n,
  state,
  position,
}: {
  n: number;
  state: BadgeState;
  position: [number, number, number];
}) {
  const map = useMemo(() => badgeTexture(n, state), [n, state]);
  const scale = state === "current" ? 0.42 : 0.36;
  return (
    <sprite position={position} scale={[scale, scale, scale]}>
      <spriteMaterial map={map} transparent depthWrite={false} />
    </sprite>
  );
}

/**
 * Objeto que anticipa el contenido de cada estación (narrativa visual).
 * Se ubica hacia afuera del anillo; el de la estación actual flota.
 */
export function StationProps({
  activeIndex,
  still,
}: {
  activeIndex: number | null;
  still: boolean;
}) {
  return (
    <group>
      {PROPS.map((Prop, i) => {
        if (!Prop) return null;
        const [x, z] = ringPoint(i, RING_RADIUS + 0.85);
        const facing = Math.atan2(-x, -z);
        return (
          <Floating
            key={i}
            active={activeIndex === i && !still}
            position={[x, 0.2, z]}
            rotationY={facing}
          >
            <Prop />
          </Floating>
        );
      })}
    </group>
  );
}

function Floating({
  active,
  position,
  rotationY,
  children,
}: {
  active: boolean;
  position: [number, number, number];
  rotationY: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const goal = active ? 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.06 : 0;
    g.position.y += (goal - g.position.y) * Math.min(1, delta * 4);
    g.rotation.y = active ? Math.sin(state.clock.elapsedTime * 0.8) * 0.25 : 0;
  });
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

const mat = (color: string, roughness = 0.7) => (
  <meshStandardMaterial color={color} roughness={roughness} />
);

/** 2 · Elige tu camino: señal con dos flechas. */
function Signpost() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        {mat(WORLD.stone)}
      </mesh>
      <mesh position={[0.12, 0.58, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.03]} />
        {mat(WORLD.accent)}
      </mesh>
      <mesh position={[-0.12, 0.44, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.03]} />
        {mat(WORLD.ink)}
      </mesh>
    </group>
  );
}

/** 3 · Identidad: credencial. */
function IdBadge() {
  return (
    <group position={[0, 0.3, 0]} rotation={[-0.2, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.44, 0.03]} />
        {mat(WORLD.lightBlue)}
      </mesh>
      <mesh position={[0, 0.06, 0.02]}>
        <circleGeometry args={[0.08, 20]} />
        {mat(WORLD.accent)}
      </mesh>
      <mesh position={[0, -0.12, 0.02]}>
        <planeGeometry args={[0.22, 0.04]} />
        {mat(WORLD.ink)}
      </mesh>
    </group>
  );
}

/** 4 · Tu mundo: local con toldo. */
function Shop() {
  return (
    <group>
      <mesh position={[0, 0.17, 0]} castShadow>
        <boxGeometry args={[0.42, 0.34, 0.32]} />
        {mat("#FFFFFF", 0.85)}
      </mesh>
      <mesh position={[0, 0.3, 0.19]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.46, 0.03, 0.14]} />
        {mat(WORLD.accent)}
      </mesh>
      <mesh position={[0, 0.1, 0.162]}>
        <planeGeometry args={[0.14, 0.2]} />
        {mat(WORLD.ink)}
      </mesh>
    </group>
  );
}

/** 5 · El POS: terminal con pantalla. */
function Terminal() {
  return (
    <group position={[0, 0.2, 0]} rotation={[-0.25, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.38, 0.1]} />
        {mat(WORLD.ink, 0.5)}
      </mesh>
      <mesh position={[0, 0.07, 0.051]}>
        <planeGeometry args={[0.18, 0.13]} />
        <meshStandardMaterial color="#DFF7EC" emissive={WORLD.green} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

/** 6 · La red: nodos conectados. */
function Nodes() {
  const pts: [number, number, number][] = [
    [0, 0.5, 0],
    [-0.2, 0.25, 0],
    [0.2, 0.25, 0],
  ];
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[i === 0 ? 0.08 : 0.065, 16, 16]} />
          {mat(i === 0 ? WORLD.accent : WORLD.ink, 0.5)}
        </mesh>
      ))}
      {[
        [-0.1, 0.375, -0.9],
        [0.1, 0.375, 0.9],
      ].map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, r]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
          {mat(WORLD.stone)}
        </mesh>
      ))}
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />
        {mat(WORLD.stone)}
      </mesh>
    </group>
  );
}

/** 7 · Soluciones: bloques apilados (crecer). */
function Blocks() {
  const colors = [WORLD.ink, WORLD.accent, WORLD.green];
  return (
    <group>
      {colors.map((c, i) => (
        <mesh
          key={i}
          position={[(i - 1) * 0.02, 0.07 + i * 0.13, 0]}
          rotation={[0, i * 0.3, 0]}
          castShadow
        >
          <boxGeometry args={[0.22 - i * 0.03, 0.12, 0.22 - i * 0.03]} />
          {mat(c)}
        </mesh>
      ))}
    </group>
  );
}

/** 8 · Tu tarjeta: el único elemento rosado del mundo, además de la chancha. */
function PinkCard() {
  return (
    <group position={[0, 0.25, 0]} rotation={[-0.15, 0, 0.12]}>
      <mesh castShadow>
        <boxGeometry args={[0.44, 0.28, 0.02]} />
        <meshStandardMaterial color="#FF6FAE" roughness={0.35} />
      </mesh>
      <mesh position={[-0.13, 0.06, 0.011]}>
        <circleGeometry args={[0.045, 16]} />
        {mat("#FFFFFF")}
      </mesh>
    </group>
  );
}

/** 9 · Revisión: portapapeles con lista. */
function Clipboard() {
  return (
    <group position={[0, 0.27, 0]} rotation={[-0.25, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.42, 0.025]} />
        {mat("#FFFFFF", 0.9)}
      </mesh>
      {[0.09, 0, -0.09].map((y) => (
        <group key={y} position={[0, y, 0.014]}>
          <mesh position={[-0.09, 0, 0]}>
            <circleGeometry args={[0.022, 12]} />
            {mat(WORLD.green)}
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <planeGeometry args={[0.16, 0.025]} />
            {mat(WORLD.stone)}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.2, 0.02]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        {mat(WORLD.ink)}
      </mesh>
    </group>
  );
}

/** 10 · Pago: moneda. */
function Coin() {
  return (
    <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
      <meshStandardMaterial color={WORLD.green} roughness={0.35} metalness={0.15} />
    </mesh>
  );
}

/** 11 · ¡Listo!: bandera. */
function Flag() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        {mat(WORLD.stone)}
      </mesh>
      <mesh position={[0.13, 0.68, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.1, 0.24, 3]} />
        {mat(WORLD.accent)}
      </mesh>
    </group>
  );
}

const PROPS: (ComponentType | null)[] = [
  null,
  Signpost,
  IdBadge,
  Shop,
  Terminal,
  Nodes,
  Blocks,
  PinkCard,
  Clipboard,
  Coin,
  Flag,
];
