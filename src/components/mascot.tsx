import { useEffect, useRef, useState, type CSSProperties } from "react";

export type MascotState = "idle" | "listening" | "thinking" | "speaking" | "error";

type MascotProps = {
  state: MascotState;
  onClick: () => void;
  disabled?: boolean;
};

type Frame = "idle" | "listening" | "thinking" | "speaking";
type Fidget = "none" | "left" | "right";

const FRAMES: Record<Frame, string> = {
  idle: "/culpeo/idle.webp",
  listening: "/culpeo/listening.webp",
  thinking: "/culpeo/thinking.webp",
  speaking: "/culpeo/speaking.webp",
};

const DUST = Array.from({ length: 9 }, (_, i) => i);

function frameFor(state: MascotState): Frame {
  if (state === "error") return "thinking";
  return state;
}

export function Mascot({ state, onClick, disabled }: MascotProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const figureRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef(state);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const petMovedRef = useRef(false);

  const [hover, setHover] = useState(false);
  const [petting, setPetting] = useState(false);
  const [fidget, setFidget] = useState<Fidget>("none");

  stateRef.current = state;
  const listening = state === "listening";
  const frame = frameFor(state);

  useEffect(() => {
    Object.values(FRAMES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * 0.16;
      cur.y += (tgt.y - cur.y) * 0.16;
      if (figureRef.current) {
        figureRef.current.style.setProperty("--gaze-x", `${cur.x * 9}deg`);
        figureRef.current.style.setProperty("--gaze-y", `${cur.y * -5}deg`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onMove = (event: PointerEvent) => {
      if (petting || stateRef.current === "listening") return;
      const node = rootRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const nx = (event.clientX - (rect.left + rect.width * 0.5)) / (rect.width * 0.5);
      const ny = (event.clientY - (rect.top + rect.height * 0.34)) / (rect.height * 0.5);
      if (fidget === "none") {
        targetRef.current = {
          x: Math.max(-1, Math.min(1, nx)),
          y: Math.max(-1, Math.min(1, ny)),
        };
      }
      if (downRef.current) {
        const dx = event.clientX - downRef.current.x;
        const dy = event.clientY - downRef.current.y;
        if (dx * dx + dy * dy > 64) {
          petMovedRef.current = true;
          setPetting(true);
        }
      }
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [petting, fidget]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      if (stateRef.current !== "idle" || petting) {
        setFidget("none");
        return;
      }
      const roll = Math.random();
      if (roll > 0.62) {
        const dir: Fidget = Math.random() > 0.5 ? "left" : "right";
        setFidget(dir);
        targetRef.current = { x: dir === "left" ? -0.85 : 0.85, y: 0.2 };
        window.setTimeout(() => {
          setFidget("none");
          targetRef.current = { x: 0, y: 0 };
        }, 1800);
      }
    }, 4200);
    return () => window.clearInterval(id);
  }, [petting]);

  const label =
    state === "listening"
      ? "Culpeo te escucha"
      : state === "speaking"
        ? "Toca para interrumpir a Culpeo"
        : state === "thinking"
          ? "Culpeo está pensando"
          : "Toca para hablar con Culpeo";

  const caption =
    state === "listening"
      ? "Te escucha"
      : state === "speaking"
        ? "Toca para interrumpir"
        : "Hablar con Culpeo";

  return (
    <div className="relative flex flex-col items-center">
      {(listening || state === "speaking") && (
        <>
          <span className="pulse-ring pointer-events-none absolute left-1/2 top-[46%] size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-copper sm:size-64" />
          <span className="pulse-ring pointer-events-none absolute left-1/2 top-[46%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-copper/40 [animation-delay:280ms] sm:size-80" />
        </>
      )}
      <button
        ref={rootRef}
        type="button"
        disabled={disabled}
        data-state={state}
        data-hover={hover ? "true" : "false"}
        data-petting={petting ? "true" : "false"}
        data-fidget={fidget}
        className="mascot relative z-10 w-56 origin-bottom overflow-visible bg-transparent p-0 transition-transform duration-150 ease-out enabled:active:scale-[0.96] disabled:cursor-default sm:w-80"
        aria-pressed={listening}
        aria-label={label}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => {
          setHover(false);
          setPetting(false);
          downRef.current = null;
        }}
        onPointerDown={(event) => {
          downRef.current = { x: event.clientX, y: event.clientY };
          petMovedRef.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={() => {
          downRef.current = null;
          setPetting(false);
        }}
        onClick={(event) => {
          if (petMovedRef.current) {
            event.preventDefault();
            petMovedRef.current = false;
            return;
          }
          onClick();
        }}
      >
        <span className="mascot-stage relative block aspect-[2/3] w-full">
          <span className="mascot-shadow" aria-hidden="true" />
          <span className="mascot-dust" aria-hidden="true">
            {DUST.map((i) => (
              <i key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
          <span ref={figureRef} className="mascot-figure absolute inset-0 block">
            {(Object.keys(FRAMES) as Frame[]).map((key) => (
              <img
                key={key}
                src={FRAMES[key]}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-200 ease-out"
                style={{ opacity: frame === key ? 1 : 0 }}
              />
            ))}
            <span className="mascot-lamp" aria-hidden="true" />
            <span className="mascot-beam" aria-hidden="true" />
          </span>
        </span>
      </button>
      <p className="sr-only" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}
