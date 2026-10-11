import { QUESTIONS } from "../identity/questions";
import { validateAnswer } from "../identity/validation";
import { STATUS_LABEL, canTransition } from "../status/status";
import { GUIDES, SCENES } from "./steps";
import type {
  ApplicationStatus,
  JourneyMode,
  JourneyPath,
  JourneyProfile,
  JourneyState,
  KycSnapshot,
  PaymentSnapshot,
  SceneId,
} from "./types";

export type JourneyAction =
  | { type: "start"; sessionId: string }
  | { type: "choosePath"; path: JourneyPath }
  | { type: "answer"; value: string }
  | { type: "fill"; answers: Record<string, string> }
  | { type: "setProfile"; profile: Partial<JourneyProfile> }
  | { type: "addPoints"; points: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "goTo"; scene: SceneId }
  | { type: "editFromReview"; scene: SceneId }
  | { type: "confirmReview"; confirmed: boolean }
  | { type: "kycResult"; kyc: KycSnapshot }
  | { type: "paymentResult"; payment: PaymentSnapshot }
  | { type: "hydrate"; state: JourneyState }
  | { type: "reset" };

const EMPTY_PROFILE: JourneyProfile = {
  activity: "",
  brand: "",
  channels: [],
  branches: 0,
  interests: [],
  solutions: [],
};

export function initialState(mode: JourneyMode): JourneyState {
  return {
    mode,
    path: null,
    scene: "cover",
    questionIndex: 0,
    answers: {},
    completed: [],
    status: "draft",
    sessionId: null,
    kyc: null,
    profile: EMPTY_PROFILE,
    points: 0,
    reviewConfirmed: false,
    payment: null,
    returnTo: null,
    startedAt: null,
    updatedAt: null,
  };
}

const ORDER = SCENES.map((s) => s.id);

function now() {
  return new Date().toISOString();
}

function withStatus(state: JourneyState, next: ApplicationStatus): JourneyState {
  return canTransition(state.status, next) ? { ...state, status: next } : state;
}

function complete(state: JourneyState, scene: SceneId): SceneId[] {
  return state.completed.includes(scene) ? state.completed : [...state.completed, scene];
}

export function questionsFor(state: Pick<JourneyState, "path">) {
  return state.path ? QUESTIONS[state.path] : [];
}

/** `true` cuando la entrevista ya se respondió completa. */
export function identityDone(state: JourneyState) {
  return state.completed.includes("identity");
}

function sceneAfter(scene: SceneId): SceneId {
  const i = ORDER.indexOf(scene);
  return ORDER[Math.min(i + 1, ORDER.length - 1)];
}

/** Valida que "Tu mundo" esté completo antes de seguir. */
export function worldReady(state: JourneyState) {
  return state.path === "company"
    ? Boolean(state.profile.activity && state.profile.brand.trim())
    : state.profile.interests.length > 0;
}

/** Completa la escena actual y avanza (o vuelve a Revisión si se estaba editando). */
function advance(state: JourneyState): JourneyState {
  const done = complete(state, state.scene);
  const scene = state.returnTo ?? sceneAfter(state.scene);
  return { ...state, completed: done, scene, returnTo: null, updatedAt: now() };
}

function finishIdentity(state: JourneyState, answers: Record<string, string>): JourneyState {
  const questions = questionsFor(state);
  return advance({
    ...withStatus({ ...state, answers }, "kyc_pending"),
    questionIndex: questions.length,
    // Si cambió la identidad, la verificación anterior ya no aplica.
    kyc: null,
  });
}

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  const stamp = { updatedAt: now() };
  switch (action.type) {
    case "start":
      return {
        ...withStatus(state, "journey_started"),
        scene: "path",
        sessionId: state.sessionId ?? action.sessionId,
        startedAt: state.startedAt ?? now(),
        completed: complete(state, "cover"),
        ...stamp,
      };

    case "choosePath": {
      const switched = state.path !== null && state.path !== action.path;
      const base = switched
        ? { ...initialState(state.mode), sessionId: state.sessionId, startedAt: state.startedAt }
        : state;
      return {
        ...withStatus(
          { ...base, status: switched ? "journey_started" : base.status },
          "identity_incomplete",
        ),
        path: action.path,
        scene: "identity",
        questionIndex: 0,
        completed: complete(base, "cover").concat(base.completed.includes("path") ? [] : ["path"]),
        ...stamp,
      };
    }

    case "answer": {
      const questions = questionsFor(state);
      const question = questions[state.questionIndex];
      if (!question || validateAnswer(question, action.value)) return state;
      const answers = { ...state.answers, [question.id]: action.value.trim() };
      if (state.questionIndex < questions.length - 1) {
        return { ...state, answers, questionIndex: state.questionIndex + 1, ...stamp };
      }
      return finishIdentity(state, answers);
    }

    case "fill": {
      const answers = { ...state.answers, ...action.answers };
      const allValid = questionsFor(state).every((q) => !validateAnswer(q, answers[q.id]));
      return allValid ? finishIdentity(state, answers) : { ...state, answers, ...stamp };
    }

    case "setProfile":
      return { ...state, profile: { ...state.profile, ...action.profile }, ...stamp };

    case "addPoints":
      return { ...state, points: state.points + Math.max(0, action.points), ...stamp };

    case "next": {
      if (state.scene === "world" && !worldReady(state)) return state;
      if (state.scene === "review") {
        if (!state.reviewConfirmed || !identityDone(state)) return state;
        return { ...withStatus(advance(state), "payment_pending") };
      }
      if (state.scene === "payment" || state.scene === "result") return state;
      return advance(state);
    }

    case "back": {
      if (state.returnTo) return { ...state, scene: state.returnTo, returnTo: null, ...stamp };
      if (state.scene === "identity" && state.questionIndex > 0) {
        return { ...state, questionIndex: state.questionIndex - 1, ...stamp };
      }
      if (state.scene === "cover" || state.scene === "result") return state;
      const i = ORDER.indexOf(state.scene);
      const prev = ORDER[i - 1];
      return {
        ...state,
        scene: prev,
        questionIndex:
          prev === "identity" ? Math.max(0, questionsFor(state).length - 1) : state.questionIndex,
        ...stamp,
      };
    }

    case "goTo": {
      const reachable = action.scene === "cover" || state.completed.includes(action.scene);
      if (!reachable || state.scene === "result") return state;
      return {
        ...state,
        scene: action.scene,
        questionIndex: action.scene === "identity" ? 0 : state.questionIndex,
        ...stamp,
      };
    }

    case "editFromReview": {
      if (!state.completed.includes(action.scene)) return state;
      const editingIdentity = action.scene === "identity";
      return {
        ...(editingIdentity ? withStatus(state, "identity_incomplete") : state),
        scene: action.scene,
        questionIndex: editingIdentity ? 0 : state.questionIndex,
        returnTo: "review",
        reviewConfirmed: false,
        ...stamp,
      };
    }

    case "confirmReview":
      return { ...state, reviewConfirmed: action.confirmed, ...stamp };

    case "kycResult": {
      const next = { ...state, kyc: action.kyc, ...stamp };
      return action.kyc.status === "submitted" ? withStatus(next, "kyc_submitted") : next;
    }

    case "paymentResult": {
      if (action.payment.status !== "received")
        return { ...state, payment: action.payment, ...stamp };
      const paid = withStatus({ ...state, payment: action.payment }, "payment_received");
      // Persona: cuenta activa para fidelización. Empresa: en modo evento se
      // simula la aprobación; en modo real queda en revisión.
      const final: ApplicationStatus =
        state.path === "person" || state.mode === "event" ? "account_active" : "in_review";
      return { ...advance(withStatus(paid, final)), completed: complete(paid, "payment") };
    }

    case "hydrate":
      return { ...initialState(action.state.mode), ...action.state };

    case "reset":
      return initialState(state.mode);
  }
}

/* ── Selectores (estado derivado para la presentación) ── */

export function currentQuestion(state: JourneyState) {
  return questionsFor(state)[state.questionIndex] ?? null;
}

/** Baldosas iluminadas de la ruta de identidad: [respondidas, total]. */
export function trailProgress(state: JourneyState): [number, number] {
  const total = questionsFor(state).length;
  return [Math.min(state.questionIndex, total), total];
}

export function guideFor(state: JourneyState) {
  return state.path ? GUIDES[state.path] : null;
}

export function statusLabel(state: JourneyState) {
  return STATUS_LABEL[state.status];
}

/** Escenas con su estado en el mapa. */
export function journeyMap(state: JourneyState) {
  return SCENES.map((s) => ({
    ...s,
    done: state.completed.includes(s.id),
    current: s.id === state.scene,
  }));
}

/** Identificador público de la cuenta de fidelización (derivado de la sesión). */
export function loyaltyPublicId(state: JourneyState) {
  const raw = (state.sessionId ?? "000000").replace(/[^0-9a-f]/gi, "").toUpperCase();
  return `S3P-${raw.slice(0, 4).padEnd(4, "0")}-${raw.slice(4, 8).padEnd(4, "0")}`;
}

/** Datos que aún faltan para la revisión (no bloquean la fidelización de personas). */
export function pendingItems(state: JourneyState): string[] {
  const out: string[] = [];
  if (!identityDone(state)) out.push("Identidad");
  if (state.path === "company" && !worldReady(state)) out.push("Actividad y marca");
  if (state.kyc?.status === "pending_data") out.push(...state.kyc.missing);
  return out;
}
