import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group, type Mesh } from "three";
import type { JourneyPath, SceneId } from "../engine/types";
import { Chancha3D, Culpeo3D } from "./Guides3D";
import { PEDESTAL_X, PEDESTAL_Z, WORLD, type CameraShot } from "./palette";

export type WorldViewProps = {
  scene: SceneId;
  path: JourneyPath | null;
  /** Estaciones del anillo completadas (una por escena del recorrido). */
  stationsDone: boolean[];
  /** Respuestas de la entrevista: [respondidas, total]. */
  trail: [number, number];
  cue: number;
  reducedMotion: boolean;
  paused: boolean;
};

const RING_RADIUS = 4.3;

/** Encuadre por escena; en pantallas verticales el panel ocupa la mitad inferior. */
function shotFor(scene: SceneId, path: JourneyPath | null, portrait: boolean): CameraShot {
  if (scene === "cover") {
    return portrait
      ? { pos: [0, 15, 22], look: [0, 0, 0] }
      : { pos: [0, 10.5, 15], look: [0, 0, 0] };
  }
  if (scene === "path" || !path) {
    return portrait
      ? { pos: [0, 9.5, 13.5], look: [0, -1.8, 0.8] }
      : { pos: [0, 5.2, 9], look: [0, -0.6, 1] };
  }
  const gx = path === "company" ? -PEDESTAL_X : PEDESTAL_X;
  return portrait
    ? { pos: [gx * 0.6, 3.6, PEDESTAL_Z + 7.8], look: [gx, -0.5, PEDESTAL_Z] }
    : { pos: [gx - 0.4, 2.9, PEDESTAL_Z + 6.4], look: [gx - 1.5, 0.75, PEDESTAL_Z] };
}

function CameraRig({
  scene,
  path,
  instant,
}: {
  scene: SceneId;
  path: JourneyPath | null;
  instant: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const portrait = useThree((s) => s.size.width < s.size.height);
  const shot = shotFor(scene, path, portrait);
  const look = useRef(new Vector3(...shot.look));
  const [px, py, pz] = shot.pos;
  const [lx, ly, lz] = shot.look;
  const targetPos = useMemo(() => new Vector3(px, py, pz), [px, py, pz]);
  const targetLook = useMemo(() => new Vector3(lx, ly, lz), [lx, ly, lz]);

  useFrame((_, delta) => {
    const k = instant ? 1 : 1 - Math.exp(-delta * 1.5);
    camera.position.lerp(targetPos, k);
    look.current.lerp(targetLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

/** En la portada la maqueta oscila lentamente; en las demás escenas queda quieta. */
function Spin({ active, children }: { active: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const target = active ? Math.sin(state.clock.elapsedTime * 0.15) * 0.35 : 0;
    g.rotation.y += (target - g.rotation.y) * Math.min(1, delta * 1.2);
  });
  return <group ref={ref}>{children}</group>;
}

function Island() {
  const buildings = useMemo(
    () =>
      [
        { a: 0.35, h: 0.9, roof: WORLD.pink },
        { a: 1.1, h: 0.6, roof: WORLD.ink },
        { a: 2.4, h: 1.1, roof: WORLD.pinkSoft },
        { a: 3.3, h: 0.7, roof: WORLD.ink },
        { a: 4.2, h: 1.0, roof: WORLD.pink },
        { a: 5.3, h: 0.65, roof: WORLD.pinkSoft },
      ].map((b) => ({ ...b, x: Math.cos(b.a) * 5.35, z: Math.sin(b.a) * 5.35 - 0.6 })),
    [],
  );
  const trees = useMemo(
    () =>
      [0.75, 1.75, 2.9, 3.75, 4.75, 5.8].map((a, i) => ({
        x: Math.cos(a) * 5.5,
        z: Math.sin(a) * 5.5 - 0.6,
        s: 0.8 + (i % 3) * 0.15,
      })),
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
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0.2, b.z]} rotation={[0, -b.a, 0]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, b.h, 0.8]} />
            <meshStandardMaterial color={WORLD.island} roughness={0.85} />
          </mesh>
          <mesh position={[0, b.h + 0.22, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.62, 0.44, 4]} />
            <meshStandardMaterial color={b.roof} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0.2, t.z]} scale={t.s}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
            <meshStandardMaterial color={WORLD.trunk} />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshStandardMaterial color={WORLD.tree} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Anillo de estaciones: cada una es una escena del recorrido y se ilumina al completarla. */
function StationRing({ done }: { done: boolean[] }) {
  return (
    <group>
      {done.map((lit, i) => {
        const a = Math.PI / 2 + (i / done.length) * Math.PI * 2;
        const x = Math.cos(a) * RING_RADIUS;
        const z = Math.sin(a) * RING_RADIUS;
        return (
          <group key={i} position={[x, 0.2, z]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.06, 28]} />
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
            <mesh position={[0, 0.68, 0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={lit ? WORLD.pink : WORLD.island}
                emissive={lit ? WORLD.pink : "#000000"}
                emissiveIntensity={lit ? 0.9 : 0}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Connection({ still }: { still: boolean }) {
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
      <mesh position={[0, 0.35, -0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.3, 40]} />
        <meshStandardMaterial color={WORLD.island} roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, 1.55, -0.6]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.55, 0.16, 24, 64]} />
        <meshStandardMaterial color={WORLD.pink} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Pedestals({
  path,
  scene,
  trail,
  cue,
  still,
}: {
  path: JourneyPath | null;
  scene: SceneId;
  trail: [number, number];
  cue: number;
  still: boolean;
}) {
  if (scene === "cover") return null;
  const items: { kind: JourneyPath; x: number }[] = [
    { kind: "company", x: -PEDESTAL_X },
    { kind: "person", x: PEDESTAL_X },
  ];
  return (
    <group>
      {items.map(({ kind, x }) => {
        const active = path === kind;
        return (
          <group key={kind} position={[x, 0.2, PEDESTAL_Z]}>
            <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.75, 0.82, 0.3, 40]} />
              <meshStandardMaterial
                color={active ? WORLD.pinkSoft : WORLD.island}
                roughness={0.8}
              />
            </mesh>
            {active ? null : kind === "company" ? (
              <group position={[0, 0.3, 0]}>
                <mesh position={[-0.12, 0.3, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.6, 0.3]} />
                  <meshStandardMaterial color={WORLD.ink} roughness={0.7} />
                </mesh>
                <mesh position={[0.2, 0.2, 0.05]} castShadow>
                  <boxGeometry args={[0.28, 0.4, 0.28]} />
                  <meshStandardMaterial color={WORLD.culpeo} roughness={0.7} />
                </mesh>
              </group>
            ) : (
              <group position={[0, 0.62, 0]} rotation={[0, 0, Math.PI]}>
                {[-0.12, 0.12].map((hx) => (
                  <mesh key={hx} position={[hx, -0.1, 0]} castShadow>
                    <sphereGeometry args={[0.17, 20, 20]} />
                    <meshStandardMaterial color={WORLD.pink} roughness={0.6} />
                  </mesh>
                ))}
                <mesh position={[0, 0.12, 0]} castShadow>
                  <coneGeometry args={[0.29, 0.38, 24]} />
                  <meshStandardMaterial color={WORLD.pink} roughness={0.6} />
                </mesh>
              </group>
            )}
            {active && kind === "company" ? (
              <Culpeo3D position={[0, 0.3, 0]} cue={cue} still={still} />
            ) : null}
            {active && kind === "person" ? (
              <Chancha3D position={[0, 0.3, 0]} cue={cue} still={still} />
            ) : null}
            {active && scene === "identity"
              ? Array.from({ length: trail[1] }, (_, i) => {
                  const lit = i < trail[0];
                  return (
                    <mesh key={i} position={[0, 0.03, 0.95 + i * 0.32]} receiveShadow>
                      <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
                      <meshStandardMaterial
                        color={lit ? WORLD.pink : WORLD.tileOff}
                        emissive={lit ? WORLD.pink : "#000000"}
                        emissiveIntensity={lit ? 0.5 : 0}
                      />
                    </mesh>
                  );
                })
              : null}
          </group>
        );
      })}
    </group>
  );
}

export default function World3D(props: WorldViewProps) {
  const { scene, path, stationsDone, trail, cue, reducedMotion, paused } = props;
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 16, 22], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <color attach="background" args={[WORLD.background]} />
      <fog attach="fog" args={[WORLD.background, 18, 34]} />
      <hemisphereLight args={["#ffffff", "#e9e1d6", 1.1]} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <CameraRig scene={scene} path={path} instant={reducedMotion} />
      <Spin active={scene === "cover" && !reducedMotion}>
        <Island />
        <StationRing done={stationsDone} />
        <Connection still={reducedMotion} />
        <Pedestals path={path} scene={scene} trail={trail} cue={cue} still={reducedMotion} />
      </Spin>
    </Canvas>
  );
}
