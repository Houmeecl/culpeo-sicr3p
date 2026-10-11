import { useEffect, useState, type CSSProperties } from "react";
import type { WorldViewProps } from "./World3D";
import { WORLD } from "./palette";

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

export function World2D({ scene, path, stationsDone, trail, reducedMotion }: WorldViewProps) {
  const portrait = usePortrait();
  const zoom =
    scene === "cover"
      ? "scale(1)"
      : scene === "path" || !path
        ? "scale(1.35) translateY(6%)"
        : path === "company"
          ? `scale(${portrait ? 2.2 : 1.9}) translate(${portrait ? 13.5 : 12}%, 2%)`
          : `scale(${portrait ? 2.2 : 1.9}) translate(${portrait ? -13.5 : -12}%, 2%)`;

  const style: CSSProperties = {
    transform: zoom,
    transformOrigin: "50% 55%",
    transition: reducedMotion ? "none" : "transform 1.6s cubic-bezier(.65,0,.35,1)",
  };

  const ring = stationsDone.map((lit, i) => {
    const a = Math.PI / 2 + (i / stationsDone.length) * Math.PI * 2;
    return { lit, x: 400 + Math.cos(a) * 230, y: 270 + Math.sin(a) * 105 };
  });

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio={portrait ? "xMidYMid meet" : "xMidYMid slice"}
      className="jy-world2d"
      aria-hidden="true"
    >
      <rect width="800" height="500" fill={WORLD.background} />
      <g style={style}>
        <ellipse cx="400" cy="292" rx="330" ry="150" fill={WORLD.islandSide} />
        <ellipse cx="400" cy="270" rx="330" ry="150" fill={WORLD.island} />
        {ring.map((r, i) => (
          <g key={i}>
            <ellipse cx={r.x} cy={r.y} rx="17" ry="8" fill={r.lit ? WORLD.pink : WORLD.tileOff} />
            <rect x={r.x - 2} y={r.y - 30} width="4" height="28" fill={WORLD.stone} />
            <circle
              cx={r.x}
              cy={r.y - 32}
              r="6"
              fill={r.lit ? WORLD.pink : "#fff"}
              stroke={WORLD.stone}
            />
          </g>
        ))}
        <ellipse cx="400" cy="250" rx="42" ry="16" fill="#fff" stroke={WORLD.tileOff} />
        <ellipse
          cx="400"
          cy="205"
          rx="34"
          ry="34"
          fill="none"
          stroke={WORLD.pink}
          strokeWidth="12"
        />
        {scene !== "cover" ? (
          <>
            <Pedestal x={290} active={path === "company"} />
            <Pedestal x={510} active={path === "person"} />
            {path === "company" ? <Fox x={290} y={262} /> : <Blocks x={290} y={300} />}
            {path === "person" ? <Pig x={510} y={262} /> : <Heart x={510} y={290} />}
            {scene === "identity" && path
              ? Array.from({ length: trail[1] }, (_, i) => (
                  <ellipse
                    key={i}
                    cx={path === "company" ? 290 : 510}
                    cy={332 + i * 12}
                    rx="9"
                    ry="4"
                    fill={i < trail[0] ? WORLD.pink : WORLD.tileOff}
                  />
                ))
              : null}
          </>
        ) : null}
      </g>
    </svg>
  );
}

function Pedestal({ x, active }: { x: number; active: boolean }) {
  return (
    <g>
      <ellipse cx={x} cy={318} rx="46" ry="16" fill={WORLD.islandSide} />
      <ellipse
        cx={x}
        cy={310}
        rx="46"
        ry="16"
        fill={active ? WORLD.pinkSoft : "#fff"}
        stroke={WORLD.tileOff}
      />
    </g>
  );
}

function Blocks({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 18} y={y - 40} width="18" height="40" fill={WORLD.ink} rx="2" />
      <rect x={x + 2} y={y - 26} width="16" height="26" fill={WORLD.culpeo} rx="2" />
    </g>
  );
}

function Heart({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y} c-26 -16 -26 -38 -10 -38 c6 0 10 6 10 6 c0 0 4 -6 10 -6 c16 0 16 22 -10 38z`}
      fill={WORLD.pink}
    />
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
