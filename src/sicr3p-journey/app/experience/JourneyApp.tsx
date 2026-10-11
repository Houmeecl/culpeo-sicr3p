import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { fictionalAnswers, fictionalProfile } from "../../adapters/demo/fixtures";
import { DEFAULT_CONFIG, createJourneyServices, type JourneyConfig } from "../../config";
import type { JourneyEvent, JourneyEventHandler } from "../../contracts/events/journey-events";
import {
  currentQuestion,
  identityDone,
  initialState,
  journeyMap,
  journeyReducer,
  loyaltyPublicId,
  pendingItems,
  questionsFor,
  statusLabel,
  trailProgress,
  worldReady,
} from "../../modules/journey-engine/engine";
import { SCENES } from "../../modules/journey-engine/steps";
import type { JourneyState } from "../../modules/journey-engine/types";
import { WorldStage } from "../../world/scenes/WorldStage";
import { usePrefersReducedMotion, useWebGLSupport } from "../../world/scenes/useWebGL";
import { walkerTarget } from "../../world/stations/layout";
import { Interview } from "../onboarding/Interview";
import { Payment } from "../completion/Payment";
import { Result } from "../completion/Result";
import { WorldBuilder } from "../onboarding/WorldBuilder";
import { Review } from "../review/Review";
import { LoyaltyCard } from "./LoyaltyCard";
import { Network } from "./Network";
import { PosStation } from "./PosStation";
import { Solutions } from "./Solutions";
import { Cover } from "./Cover";
import { Hud, type A11yPrefs } from "./Hud";
import { PathChoice } from "./PathChoice";

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
  /** Eventos de dominio (ver contracts/events). */
  onEvent?: JourneyEventHandler;
};

function newSessionId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function JourneyApp({ config, onStateChange, onEvent }: JourneyAppProps) {
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

  // Verificación: al completar la identidad, y otra vez al llegar a Revisión si el
  // proveedor pedía datos que se completaron en "Tu mundo".
  const kycInFlight = useRef(false);
  const kycRetried = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated || !identityDone(state) || kycInFlight.current || !state.path) return;
    const retryKey = JSON.stringify(state.profile);
    const retry =
      state.scene === "review" &&
      state.kyc?.status === "pending_data" &&
      kycRetried.current !== retryKey;
    if (state.kyc && !retry) return;
    if (retry) kycRetried.current = retryKey;
    kycInFlight.current = true;
    services.kyc
      .submit({
        sessionId: state.sessionId ?? "local",
        path: state.path,
        answers: state.answers,
        profile: state.profile,
      })
      .catch(() => ({
        status: "failed" as const,
        provider: services.kyc.name,
        simulated: services.kyc.simulated,
        missing: ["Sin conexión"],
      }))
      .then((kyc) => dispatch({ type: "kycResult", kyc }))
      .finally(() => {
        kycInFlight.current = false;
      });
  }, [hydrated, state, services]);

  // Eventos de dominio derivados de los cambios de estado.
  const prev = useRef<JourneyState | null>(null);
  useEffect(() => {
    const before = prev.current;
    prev.current = state;
    if (!onEvent || !before || !hydrated) return;
    const at = new Date().toISOString();
    const out: JourneyEvent[] = [];
    if (before.scene === "cover" && state.scene === "path")
      out.push({ type: "journey.started", at });
    if (state.path && before.path !== state.path) {
      out.push({ type: "journey.path_chosen", at, path: state.path });
    }
    if (before.scene !== state.scene)
      out.push({ type: "journey.station_reached", at, scene: state.scene });
    if (state.questionIndex > before.questionIndex) {
      const q = questionsFor(before)[before.questionIndex];
      if (q) out.push({ type: "identity.answered", at, questionId: q.id });
    }
    if (!identityDone(before) && identityDone(state) && state.path) {
      out.push({ type: "identity.completed", at, path: state.path });
    }
    if (state.kyc && before.kyc !== state.kyc) out.push({ type: "kyc.result", at, kyc: state.kyc });
    if (before.status !== state.status) {
      out.push({ type: "status.changed", at, from: before.status, to: state.status });
    }
    if (before.scene !== "cover" && state.scene === "cover" && !state.startedAt) {
      out.push({ type: "journey.reset", at });
    }
    out.forEach(onEvent);
  }, [state, hydrated, onEvent]);

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
  const displayName =
    (state.path === "company" ? state.answers.companyName : state.answers.fullName) ?? "";
  const next = () => dispatch({ type: "next" });
  const back = () => dispatch({ type: "back" });

  return (
    <div className="jy-root" data-large={prefs.largeText} data-reduced={reducedMotion}>
      {webgl !== null ? (
        <WorldStage
          use3D={use3D}
          scene={state.scene}
          path={state.path}
          stationsDone={SCENES.map((s) => state.completed.includes(s.id))}
          trail={trailProgress(state)}
          walkerTarget={walkerTarget(state, questions.length)}
          cue={state.questionIndex + (state.scene === "identity" ? 100 : 0)}
          reducedMotion={reducedMotion}
          paused={paused}
          onStationSelect={(scene) => dispatch({ type: "goTo", scene })}
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
          <Cover onStart={() => dispatch({ type: "start", sessionId: newSessionId() })} />
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
        ) : state.scene === "identity" ? null : !state.path ? null : state.scene === "world" ? (
          <WorldBuilder
            path={state.path}
            profile={state.profile}
            ready={worldReady(state)}
            onChange={(profile) => dispatch({ type: "setProfile", profile })}
            onNext={next}
            onBack={back}
            onFillFictional={
              eventMode && state.path
                ? () =>
                    state.path &&
                    dispatch({ type: "setProfile", profile: fictionalProfile(state.path) })
                : undefined
            }
          />
        ) : state.scene === "pos" ? (
          <PosStation
            path={state.path}
            pos={services.pos}
            onPoints={(points) => dispatch({ type: "addPoints", points })}
            onNext={next}
            onBack={back}
          />
        ) : state.scene === "network" ? (
          <Network path={state.path} onNext={next} onBack={back} />
        ) : state.scene === "solutions" ? (
          <Solutions
            path={state.path}
            selected={state.profile.solutions}
            onChange={(solutions) => dispatch({ type: "setProfile", profile: { solutions } })}
            onNext={next}
            onBack={back}
          />
        ) : state.scene === "card" ? (
          <LoyaltyCard
            path={state.path}
            name={displayName}
            publicId={loyaltyPublicId(state)}
            points={state.points}
            validation={statusLabel(state).toLowerCase()}
            onNext={next}
            onBack={back}
          />
        ) : state.scene === "review" ? (
          <Review
            path={state.path}
            answers={state.answers}
            profile={state.profile}
            kyc={state.kyc}
            pending={pendingItems(state)}
            confirmed={state.reviewConfirmed}
            onConfirm={(confirmed) => dispatch({ type: "confirmReview", confirmed })}
            onEdit={(scene) => dispatch({ type: "editFromReview", scene })}
            onNext={next}
            onBack={back}
          />
        ) : state.scene === "payment" ? (
          <Payment
            sessionId={state.sessionId ?? "local"}
            provider={services.payment}
            onResult={(payment) => dispatch({ type: "paymentResult", payment })}
            onBack={back}
          />
        ) : state.scene === "result" ? (
          <Result
            path={state.path}
            name={displayName}
            status={state.status}
            eventMode={eventMode}
            onRestart={restart}
          />
        ) : null}
      </main>
    </div>
  );
}
