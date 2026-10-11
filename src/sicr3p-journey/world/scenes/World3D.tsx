import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { SCENES } from "../../modules/journey-engine/steps";
import type { JourneyPath, SceneId } from "../../modules/journey-engine/types";
import { WORLD } from "../assets/palette";
import { Chancha3D, Culpeo3D } from "../characters/Guides3D";
import { Walker } from "../characters/Walker";
import { StationRing, TrailTiles } from "../stations/StationRing";
import { stationIndex } from "../stations/layout";
import { Connection, Island } from "./Island";

export type WorldViewProps = {
  scene: SceneId;
  path: JourneyPath | null;
  /** Estaciones del anillo completadas (una por escena del recorrido). */
  stationsDone: boolean[];
  /** Respuestas de la entrevista: [respondidas, total]. */
  trail: [number, number];
  /** Punto del anillo al que camina el personaje (null en la portada). */
  walkerTarget: number | null;
  cue: number;
  reducedMotion: boolean;
  paused: boolean;
  onStationSelect: (scene: SceneId) => void;
};

const UP = new Vector3(0, 1, 0);

/**
 * Cámara en tercera persona: se ubica dentro del anillo, frente y sobre el
 * personaje, y lo sigue mientras camina. En la portada muestra la maqueta entera.
 */
function FollowCamera({
  follow,
  overview,
  sidePanel,
  instant,
}: {
  follow: Vector3;
  overview: boolean;
  /** El panel ocupa la izquierda (entrevista): correr al personaje a la derecha. */
  sidePanel: boolean;
  instant: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const portrait = useThree((s) => s.size.width < s.size.height);
  const look = useRef(new Vector3());
  const pos = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  const out = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    if (overview) {
      pos.set(0, portrait ? 15 : 10.5, portrait ? 22 : 15);
      target.set(0, 0, 0);
    } else {
      // Desde el interior del anillo mirando hacia afuera: las casas quedan de fondo.
      out.set(follow.x, 0, follow.z).normalize();
      const dist = portrait ? 5.4 : 4.9;
      const height = portrait ? 5.2 : 3.3;
      pos.copy(follow).addScaledVector(out, -dist).addScaledVector(UP, height);
      target.copy(follow).addScaledVector(UP, portrait ? -0.9 : sidePanel ? 0.5 : -0.7);
      if (!portrait && sidePanel) {
        // En pantallas anchas el panel queda a la izquierda: el personaje, a la derecha.
        right.copy(target).sub(pos).cross(UP).normalize();
        target.addScaledVector(right, -1.9);
      }
    }
    const k = instant ? 1 : 1 - Math.exp(-delta * 1.8);
    camera.position.lerp(pos, k);
    look.current.lerp(target, k);
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
    const goal = active ? Math.sin(state.clock.elapsedTime * 0.15) * 0.35 : 0;
    g.rotation.y += (goal - g.rotation.y) * Math.min(1, delta * 1.2);
  });
  return <group ref={ref}>{children}</group>;
}

function Characters({
  scene,
  path,
  target,
  follow,
  cue,
  still,
}: {
  scene: SceneId;
  path: JourneyPath | null;
  target: number | null;
  follow: Vector3;
  cue: number;
  still: boolean;
}) {
  if (target === null) return null;
  // En la elección esperan los dos guías, lado a lado.
  if (scene === "path") {
    return (
      <>
        <Walker target={target} side={-0.55} follow={follow} still={still}>
          <Culpeo3D position={[0, 0, 0]} cue={path === "company" ? cue : 0} still={still} />
        </Walker>
        <Walker target={target} side={0.55} still={still}>
          <Chancha3D position={[0, 0, 0]} cue={path === "person" ? cue : 0} still={still} />
        </Walker>
      </>
    );
  }
  if (!path) return null;
  return (
    <Walker target={target} follow={follow} still={still}>
      {path === "company" ? (
        <Culpeo3D position={[0, 0, 0]} cue={cue} still={still} />
      ) : (
        <Chancha3D position={[0, 0, 0]} cue={cue} still={still} />
      )}
    </Walker>
  );
}

export default function World3D(props: WorldViewProps) {
  const { scene, path, stationsDone, trail, walkerTarget, cue, reducedMotion, paused } = props;
  const follow = useMemo(() => new Vector3(0, 0.2, 4.3), []);
  const identityIdx = stationIndex("identity");
  const activeIndex = walkerTarget === null ? null : Math.ceil(walkerTarget - 1e-6);

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
      <FollowCamera
        follow={follow}
        overview={scene === "cover"}
        sidePanel={scene === "identity"}
        instant={reducedMotion}
      />
      <Spin active={scene === "cover" && !reducedMotion}>
        <Island />
        <StationRing
          done={stationsDone}
          activeIndex={activeIndex}
          still={reducedMotion}
          onSelect={(i) => props.onStationSelect(SCENES[i].id)}
        />
        {scene === "identity" && trail[1] > 0 ? (
          <TrailTiles from={identityIdx} count={trail[1]} lit={trail[0]} />
        ) : null}
        <Connection still={reducedMotion} />
        <Characters
          scene={scene}
          path={path}
          target={walkerTarget}
          follow={follow}
          cue={cue}
          still={reducedMotion}
        />
      </Spin>
    </Canvas>
  );
}
