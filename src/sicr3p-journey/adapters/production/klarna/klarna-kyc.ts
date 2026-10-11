import type { KycProvider } from "../../../modules/kyc/kyc";
import { klarnaOnboardCompany } from "./klarna.functions";

/**
 * Verificación de empresas vía Klarna (onboarding de partner).
 * Personas: la fidelización no se bloquea; su verificación con un proveedor
 * externo aún no está definida y queda "no configurada".
 */
export const klarnaKyc: KycProvider = {
  name: "Klarna",
  simulated: false,
  async submit(req) {
    if (req.path === "person") {
      return {
        status: "not_configured",
        provider: "Verificación de personas",
        simulated: false,
        missing: [],
      };
    }
    return klarnaOnboardCompany({ data: { sessionId: req.sessionId, answers: req.answers } });
  },
};
