import { createApiRepository } from "./data/api-repository";
import { createLocalRepository } from "./data/local-repository";
import type { JourneyServices } from "./data/ports";
import { simulatedKyc, simulatedPayment, simulatedPos } from "./data/simulated";
import type { JourneyMode } from "./engine/types";

export type JourneyConfig = {
  mode: JourneyMode;
  /** Base del API externo. Sin ella, el modo real guarda en este dispositivo. */
  apiBase?: string;
  /** Modo evento: reinicio automático por inactividad. */
  eventIdleResetMs: number;
  /** Monto de activación única (sin niveles). */
  activationClp: number;
};

export const DEFAULT_CONFIG: JourneyConfig = {
  mode: "event",
  eventIdleResetMs: 5 * 60 * 1000,
  activationClp: 19990,
};

export function createJourneyServices(config: JourneyConfig): JourneyServices {
  const repository =
    config.mode === "real" && config.apiBase
      ? createApiRepository(config.apiBase)
      : createLocalRepository(config.mode === "event" ? "session" : "local");
  // Proveedores reales de KYC, pago y POS aún no están definidos: simulados.
  return { repository, payment: simulatedPayment, kyc: simulatedKyc, pos: simulatedPos };
}
