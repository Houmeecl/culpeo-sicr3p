import { QUESTIONS } from "../identity/questions";
import { validateAnswer } from "../identity/validation";
import { STATUS_LABEL, canTransition } from "../status/status";
import { GUIDES, SCENES } from "./steps";
import type {
  ApplicationStatus,
  JourneyMode,
  JourneyPath,
  JourneyState,
  KycSnapshot,
  SceneId,
} from "./types";

export type JourneyAction =
  | { type: "start"; sessionId: string }
  | { type: "choosePath"; path: JourneyPath }
  | { type: "answer"; value: string }
  | { type: "back" }
  | { type: "editAnswers" }
  | { type: "fill"; answers: Record<string, string> }
  | { type: "goTo"; scene: SceneId }
  | { type: "kycResult"; kyc: KycSnapshot }
  | { type: "hydrate"; state: JourneyState }
  | { type: "reset" };

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
    startedAt: null,
    updatedAt: null,
  };
}

function now() {
  return new Date().toISOString();
}

function withStatus(state: JourneyState, next: ApplicationStatus): JourneyState {
  return canTransition(state.status, next) ? { ...state, status: next } : state;
}

function complete(state: JourneyState, scene: SceneId): SceneId[] {
  return state.completed.includes(scene) ? state.completed : [...state.completed, scene];
}

export function questionsFor(state: JourneyState) {
  return state.path ? QUESTIONS[state.path] : [];
}

/** `true` cuando la entrevista ya se respondió completa. */
export function identityDone(state: JourneyState) {
  return state.completed.includes("identity");
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
      return {
        ...withStatus(state, "identity_incomplete"),
        path: action.path,
        scene: "identity",
        questionIndex: 0,
        answers: switched ? {} : state.answers,
        completed: complete(state, "path").filter((s) => !switched || s !== "identity"),
        ...stamp,
      };
    }

    case "answer": {
      const questions = questionsFor(state);
      const question = questions[state.questionIndex];
      if (!question || validateAnswer(question, action.value)) return state;
      const answers = { ...state.answers, [question.id]: action.value.trim() };
      const last = state.questionIndex >= questions.length - 1;
      if (!last) {
        return { ...state, answers, questionIndex: state.questionIndex + 1, ...stamp };
      }
      return {
        ...withStatus({ ...state, answers }, "kyc_pending"),
        questionIndex: questions.length,
        completed: complete(state, "identity"),
        ...stamp,
      };
    }

    case "fill": {
      const questions = questionsFor(state);
      const answers = { ...state.answers, ...action.answers };
      const allValid = questions.every((q) => !validateAnswer(q, answers[q.id]));
      if (!allValid) return { ...state, answers, ...stamp };
      return {
        ...withStatus({ ...state, answers }, "kyc_pending"),
        questionIndex: questions.length,
        completed: complete(state, "identity"),
        ...stamp,
      };
    }

    case "back": {
      if (state.scene === "identity" && state.questionIndex > 0) {
        return { ...state, questionIndex: state.questionIndex - 1, ...stamp };
      }
      if (state.scene === "identity") return { ...state, scene: "path", ...stamp };
      if (state.scene === "path") return { ...state, scene: "cover", ...stamp };
      return state;
    }

    case "editAnswers":
      return {
        ...withStatus(state, "identity_incomplete"),
        kyc: null,
        scene: "identity",
        questionIndex: 0,
        completed: state.completed.filter((s) => s !== "identity"),
        ...stamp,
      };

    case "goTo": {
      const def = SCENES.find((s) => s.id === action.scene);
      const reachable = action.scene === "cover" || state.completed.includes(action.scene);
      if (!def?.available || !reachable) return state;
      return { ...state, scene: action.scene, ...stamp };
    }

    case "kycResult": {
      const next = { ...state, kyc: action.kyc, ...stamp };
      return action.kyc.status === "submitted" ? withStatus(next, "kyc_submitted") : next;
    }

    case "hydrate":
      return { ...action.state, kyc: action.state.kyc ?? null };

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

/** Escenas visibles para el camino elegido, con su estado en el mapa. */
export function journeyMap(state: JourneyState) {
  return SCENES.filter((s) => !s.onlyFor || !state.path || s.onlyFor === state.path).map((s) => ({
    ...s,
    done: state.completed.includes(s.id),
    current: s.id === state.scene,
  }));
}

export function nextStation(state: JourneyState) {
  const map = journeyMap(state);
  const idx = map.findIndex((s) => s.id === "identity");
  return map[idx + 1] ?? null;
}
