import type {
  ApplicationStatus,
  JourneyPath,
  KycSnapshot,
  SceneId,
} from "../../modules/journey-engine/types";

/**
 * Eventos de dominio que emite el módulo. La aplicación anfitriona puede
 * escucharlos (onEvent) para analítica, integración o embebido vía postMessage.
 */
export type JourneyEvent =
  | { type: "journey.started"; at: string }
  | { type: "journey.path_chosen"; at: string; path: JourneyPath }
  | { type: "journey.station_reached"; at: string; scene: SceneId }
  | { type: "identity.answered"; at: string; questionId: string }
  | { type: "identity.completed"; at: string; path: JourneyPath }
  | { type: "kyc.result"; at: string; kyc: KycSnapshot }
  | { type: "status.changed"; at: string; from: ApplicationStatus; to: ApplicationStatus }
  | { type: "journey.reset"; at: string };

export type JourneyEventHandler = (event: JourneyEvent) => void;

/** Prefijo de mensajes al embeber el módulo en otra aplicación. */
export const JOURNEY_MESSAGE_SOURCE = "sicr3p-journey";
