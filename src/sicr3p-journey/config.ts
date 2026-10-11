import { createLocalRepository } from "./adapters/demo/local-repository";
import { simulatedKyc, simulatedPayment, simulatedPos } from "./adapters/demo/simulated";
import { createApiRepository } from "./adapters/production/api-repository";
import { klarnaKyc } from "./adapters/production/klarna/klarna-kyc";
import type { JourneyServices } from "./contracts/api/ports";
import type { JourneyMode } from "./modules/journey-engine/types";
import { ACTIVATION } from "./modules/subscription/activation";

export type JourneyConfig = {
  mode: JourneyMode;
  /** Base del API externo de SICR3P/. Sin ella, el modo real guarda en este dispositivo. */
  apiBase?: string;
  /** Modo evento: reinicio automático por inactividad. */
  eventIdleResetMs: number;
  /** Monto de activación única (sin niveles). */
  activationClp: number;
};

export const DEFAULT_CONFIG: JourneyConfig = {
  mode: "event",
  eventIdleResetMs: 5 * 60 * 1000,
  activationClp: ACTIVATION.amountClp,
};

/**
 * Elige los adaptadores según el modo:
 * - evento: todo local y simulado;
 * - real: verificación con Klarna (si el servidor tiene credenciales) y API propia si existe.
 * El pago y el POS siguen simulados hasta definir proveedores.
 */
export function createJourneyServices(config: JourneyConfig): JourneyServices {
  const event = config.mode === "event";
  const repository =
    !event && config.apiBase
      ? createApiRepository(config.apiBase)
      : createLocalRepository(event ? "session" : "local");
  return {
    repository,
    kyc: event ? simulatedKyc : klarnaKyc,
    payment: simulatedPayment,
    pos: simulatedPos,
  };
}
