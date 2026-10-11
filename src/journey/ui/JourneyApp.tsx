import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { DEFAULT_CONFIG, createJourneyServices, type JourneyConfig } from "../config";
import { fictionalAnswers } from "../data/fixtures";
import {
  currentQuestion,
  initialState,
  journeyMap,
  journeyReducer,
  nextStation,
  questionsFor,
  statusLabel,
  trailProgress,
} from "../engine/engine";
import { SCENES } from "../engine/steps";
import type { JourneyState } from "../engine/types";
import { WorldStage } from "../world/WorldStage";
import { usePrefersReducedMotion, useWebGLSupport } from "../world/useWebGL";
import { Hud, type A11yPrefs } from "./Hud";
import { Cover } from "./scenes/Cover";
import { Interview } from "./scenes/Interview";
import { NextStation } from "./scenes/NextStation";
import { PathChoice } from "./scenes/PathChoice";

const PREFS_KEY = "sicr3p.journey.prefs";

function loadPrefs(): A11yPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) return { force2D: false, reduceMotion: false, largeText: false, ...JSON.parse(raw) };
  } catch {
    /* preferencias no disponibles */
  }
  return { force2D: false, reduceMotion: false, largeText: false };
}

export type JourneyAppProps = {
  config?: Partial<JourneyConfig>;
  onStateChange?: (state: JourneyState) => void;
};

export function JourneyApp({ config, onStateChange }: JourneyAppProps) {
  const cfg = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const services = useMemo(() => createJourneyServices(cfg), [cfg]);
  const [state, dispatch] = useReducer(journeyReducer, cfg.mode, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [paused, setPaused] = useState(false);
  const [panel, setPanel] = useState<"map" | "a11y" | null>(null);
  const [prefs, setPrefs] = useState<A11yPrefs>({
    force2D: false,
    reduceMotion: false,
    largeText: false,
  });
  const webgl = useWebGLSupport();
  const osReduced = usePrefersReducedMotion();
  const eventMode = cfg.mode === "event";

  // Hidratar avance guardado y preferencias del visitante.
  useEffect(() => {
    setPrefs(loadPrefs());
    let alive = true;
    services.repository.load().then((saved) => {
      if (alive && saved && saved.mode === cfg.mode) dispatch({ type: "hydrate", state: saved });
      if (alive) setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, [services, cfg.mode]);

  useEffect(() => {
    if (!hydrated) return;
    void services.repository.save(state);
    onStateChange?.(state);
  }, [state, hydrated, services, onStateChange]);

  function updatePrefs(next: A11yPrefs) {
    setPrefs(next);
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento */
    }
  }

  function restart() {
    void services.repository.clear();
    dispatch({ type: "reset" });
    setPanel(null);
    setPaused(false);
  }

  // Modo evento: limpiar la sesión del stand tras inactividad.
  const restartRef = useRef(restart);
  restartRef.current = restart;
  useEffect(() => {
    if (!eventMode || state.scene === "cover") return;
    let timer = window.setTimeout(() => restartRef.current(), cfg.eventIdleResetMs);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => restartRef.current(), cfg.eventIdleResetMs);
    };
    window.addEventListener("pointerdown", bump);
    window.addEventListener("keydown", bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
    };
  }, [eventMode, state.scene, cfg.eventIdleResetMs]);

  // Teclado: Esc cierra paneles o retrocede; Alt+← retrocede.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (panel) setPanel(null);
        else if (state.scene !== "cover") dispatch({ type: "back" });
      } else if (e.altKey && e.key === "ArrowLeft") {
        dispatch({ type: "back" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, state.scene]);

  const reducedMotion = osReduced || prefs.reduceMotion;
  const use3D = webgl === true && !prefs.force2D;
  const question = currentQuestion(state);
  const questions = questionsFor(state);
  const map = journeyMap(state);

  return (
    <div className="jy-root" data-large={prefs.largeText} data-reduced={reducedMotion}>
      {webgl !== null ? (
        <WorldStage
          use3D={use3D}
          scene={state.scene}
          path={state.path}
          stationsDone={SCENES.map((s) => state.completed.includes(s.id))}
          trail={trailProgress(state)}
          cue={state.questionIndex + (state.scene === "identity" ? 100 : 0)}
          reducedMotion={reducedMotion}
          paused={paused}
        />
      ) : (
        <div className="jy-stage" />
      )}

      <Hud
        started={state.scene !== "cover"}
        statusLabel={statusLabel(state)}
        eventMode={eventMode}
        paused={paused}
        panel={panel}
        map={map}
        prefs={prefs}
        webgl={webgl}
        onPanel={setPanel}
        onPause={() => setPaused((p) => !p)}
        onRestart={restart}
        onGoTo={(scene) => {
          dispatch({ type: "goTo", scene });
          setPanel(null);
        }}
        onPrefs={updatePrefs}
      />

      <main className="jy-overlay" data-scene={state.scene}>
        {paused ? (
          <section className="jy-panel jy-paused">
            <h2 className="jy-panel-title">Recorrido en pausa</h2>
            <button
              type="button"
              className="jy-btn jy-btn-primary"
              onClick={() => setPaused(false)}
              autoFocus
            >
              Seguir
            </button>
          </section>
        ) : state.scene === "cover" ? (
          <Cover onStart={() => dispatch({ type: "start" })} />
        ) : state.scene === "path" ? (
          <PathChoice
            selected={state.path}
            onChoose={(path) => dispatch({ type: "choosePath", path })}
            onBack={() => dispatch({ type: "back" })}
          />
        ) : state.scene === "identity" && state.path && question ? (
          <Interview
            key={`${state.path}-${question.id}`}
            path={state.path}
            question={question}
            index={state.questionIndex}
            total={questions.length}
            initial={state.answers[question.id] ?? ""}
            eventMode={eventMode}
            onAnswer={(value) => dispatch({ type: "answer", value })}
            onBack={() => dispatch({ type: "back" })}
            onFillFictional={() =>
              state.path && dispatch({ type: "fill", answers: fictionalAnswers(state.path) })
            }
          />
        ) : state.scene === "identity" && state.path ? (
          <NextStation
            path={state.path}
            questions={questions}
            answers={state.answers}
            statusLabel={statusLabel(state)}
            next={nextStation(state)}
            eventMode={eventMode}
            onEdit={() => dispatch({ type: "editAnswers" })}
            onRestart={restart}
          />
        ) : null}
      </main>
    </div>
  );
}
