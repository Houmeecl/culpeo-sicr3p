import type {
  ApplicationStatus,
  JourneyMode,
  JourneyPath,
  SceneId,
} from "../../modules/journey-engine/types";

/** DTOs del API externo de SICR3P/ Journey (ver docs/journey, sección 9). */

export type CreateSessionRequest = { mode: JourneyMode; path?: JourneyPath; locale: "es-CL" };

export type CreateSessionResponse = {
  sessionId: string;
  sessionToken: string;
  status: ApplicationStatus;
  expiresAt: string;
};

export type JourneySessionDTO = {
  sessionId: string;
  mode: JourneyMode;
  path: JourneyPath | null;
  currentStepId: SceneId;
  answers: Record<string, string>;
  checkpoints: { stepId: SceneId; completedAt: string }[];
  status: ApplicationStatus;
};

export type ConsentRequest = { purpose: string; textVersion: string; accepted: true };

export type PaymentRequest = {
  subscription: "activation";
  amountClp: number;
  returnUrl: string;
};

export type HandoffResponse = { resumeUrl: string; qrPayload: string; expiresAt: string };

export type ApiError = {
  error: { code: string; message: string; fields?: Record<string, string> };
};
