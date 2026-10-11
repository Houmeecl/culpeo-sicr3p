import { useEffect, useState, type CSSProperties } from "react";
import type { WorldViewProps } from "./World3D";
import { SCENES } from "../../modules/journey-engine/steps";
import { WORLD } from "../assets/palette";
import { stationAngle, stationIndex } from "../stations/layout";

/** Alternativa 2D (sin WebGL o por preferencia): misma información que el mundo 3D. */
function usePortrait() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    setPortrait(mq.matches);
    const on = (e: MediaQueryListEvent) => setPortrait(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return portrait;
}

const CX = 400;
const CY = 270;
const RX = 230;
const RY = 105;

function ellipsePoint(sv: number): [number, number] {
  const a = stationAngle(sv);
  return [CX + Math.cos(a) * RX, CY + Math.sin(a) * RY];
}

export function World2D(props: WorldViewProps) {
  const { scene, path, stationsDone, trail, walkerTarget, reducedMotion, onStationSelect } = props;
  const portrait = usePortrait();
  const walker = walkerTarget === null ? null : ellipsePoint(walkerTarget);

  // "Cámara": acerca y centra al personaje (a la derecha en pantallas anchas).
  let transform = "translate(0px, 0px) scale(1)";
  if (walker) {
    const k = portrait ? 2 : 1.7;
    const goalX = portrait ? 400 : 560;
    const goalY = portrait ? 230 : 260;
    transform = `translate(${goalX - k * walker[0]}px, ${goalY - k * walker[1]}px) scale(${k})`;
  }
  const style: CSSProperties = {
    transform,
    transformOrigin: "0 0",
    transition: reducedMotion ? "none" : "transform 1.4s cubic-bezier(.65,0,.35,1)",
  };
  const moving: CSSProperties = {
    transition: reducedMotion ? "none" : "transform 1.4s cubic-bezier(.65,0,.35,1)",
  };

  const identityIdx = stationIndex("identity");

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio={portrait ? "xMidYMid meet" : "xMidYMid slice"}
      className="jy-world2d"
      aria-hidden="true"
    >
      <rect width="800" height="500" fill={WORLD.background} />
      <g style={style}>
        <ellipse cx={CX} cy={CY + 22} rx="330" ry="150" fill={WORLD.islandSide} />
        <ellipse cx={CX} cy={CY} rx="330" ry="150" fill={WORLD.island} />
        {stationsDone.map((lit, i) => {
          const [x, y] = ellipsePoint(i);
          return (
            <g
              key={i}
              onClick={lit ? () => onStationSelect(SCENES[i].id) : undefined}
              style={lit ? { cursor: "pointer" } : undefined}
            >
              <ellipse cx={x} cy={y} rx="17" ry="8" fill={lit ? WORLD.pink : WORLD.tileOff} />
              <rect x={x - 2} y={y - 30} width="4" height="28" fill={WORLD.stone} />
              <circle
                cx={x}
                cy={y - 32}
                r="6"
                fill={lit ? WORLD.pink : "#fff"}
                stroke={WORLD.stone}
              />
            </g>
          );
        })}
        {scene === "identity"
          ? Array.from({ length: trail[1] }, (_, i) => {
              const [x, y] = ellipsePoint(identityIdx + (i + 0.5) / trail[1]);
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="7"
                  ry="3.5"
                  fill={i < trail[0] ? WORLD.pink : WORLD.tileOff}
                />
              );
            })
          : null}
        <ellipse cx={CX} cy={CY - 20} rx="42" ry="16" fill="#fff" stroke={WORLD.tileOff} />
        <ellipse
          cx={CX}
          cy={CY - 65}
          rx="34"
          ry="34"
          fill="none"
          stroke={WORLD.pink}
          strokeWidth="12"
        />
        {walker && scene === "path" ? (
          <>
            <g
              style={{
                ...moving,
                transform: `translate(${walker[0] - 26}px, ${walker[1] - 48}px) scale(0.7)`,
              }}
            >
              <Fox x={0} y={0} />
            </g>
            <g
              style={{
                ...moving,
                transform: `translate(${walker[0] + 26}px, ${walker[1] - 48}px) scale(0.7)`,
              }}
            >
              <Pig x={0} y={0} />
            </g>
          </>
        ) : walker && path ? (
          <g
            style={{
              ...moving,
              transform: `translate(${walker[0]}px, ${walker[1] - 48}px) scale(0.7)`,
            }}
          >
            {path === "company" ? <Fox x={0} y={0} /> : <Pig x={0} y={0} />}
          </g>
        ) : null}
      </g>
    </svg>
  );
}

function Fox({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="30" rx="26" ry="20" fill={WORLD.culpeo} />
      <ellipse cx="0" cy="36" rx="14" ry="11" fill={WORLD.cream} />
      <path d="M-24 22 C-50 18 -52 -4 -36 -8 C-38 6 -30 14 -22 16Z" fill={WORLD.culpeo} />
      <circle cx="0" cy="0" r="20" fill={WORLD.culpeo} />
      <path d="M-16 -10 L-12 -32 L-2 -16Z M16 -10 L12 -32 L2 -16Z" fill={WORLD.culpeo} />
      <path d="M-9 6 L0 18 L9 6Z" fill={WORLD.cream} />
      <circle cx="0" cy="17" r="3" fill={WORLD.ink} />
      <circle cx="-7" cy="-2" r="2.6" fill={WORLD.ink} />
      <circle cx="7" cy="-2" r="2.6" fill={WORLD.ink} />
    </g>
  );
}

function Pig({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="30" rx="30" ry="22" fill={WORLD.pink} />
      <circle cx="0" cy="2" r="21" fill={WORLD.pink} />
      <path d="M-18 -10 L-20 -26 L-6 -18Z M18 -10 L20 -26 L6 -18Z" fill={WORLD.pinkDeep} />
      <ellipse cx="0" cy="8" rx="10" ry="7" fill={WORLD.pinkDeep} />
      <circle cx="-3.5" cy="8" r="1.8" fill={WORLD.ink} />
      <circle cx="3.5" cy="8" r="1.8" fill={WORLD.ink} />
      <circle cx="-8" cy="-4" r="2.6" fill={WORLD.ink} />
      <circle cx="8" cy="-4" r="2.6" fill={WORLD.ink} />
    </g>
  );
}

export function GuideAvatar({ path, size = 44 }: { path: "company" | "person"; size?: number }) {
  return (
    <svg viewBox="-40 -40 80 80" width={size} height={size} aria-hidden="true">
      {path === "company" ? <Fox x={0} y={-6} /> : <Pig x={0} y={-6} />}
    </svg>
  );
}
