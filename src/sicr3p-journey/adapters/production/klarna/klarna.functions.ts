import { createServerFn } from "@tanstack/react-start";
import { companyAnswersSchema } from "../../../contracts/schemas/answers";
import type { KlarnaOnboardingResponse } from "../../../contracts/schemas/klarna-onboarding";
import { companyFromAnswers } from "../../../modules/company-profile/types";
import type { KycSnapshot } from "../../../modules/journey-engine/types";
import { buildKlarnaOnboardingPayload } from "./payload";

const PROVIDER = "Klarna Management API";

type Input = { sessionId: string; answers: Record<string, string> };

function parseInput(raw: unknown): Input {
  const data = raw as Partial<Input>;
  if (
    !data ||
    typeof data.sessionId !== "string" ||
    typeof data.answers !== "object" ||
    !data.answers
  ) {
    throw new Error("Solicitud inválida");
  }
  return {
    sessionId: data.sessionId.slice(0, 80),
    answers: data.answers as Record<string, string>,
  };
}

/**
 * Onboarding de la empresa en Klarna (servidor). Las credenciales nunca llegan
 * al navegador. Se activa sólo con estas variables de entorno del despliegue:
 *   KLARNA_API_KEY      clave del Management API (Authorization: Basic <API key>)
 *   KLARNA_ONBOARD_URL  URL completa de "Onboard a merchant" (entregada por Klarna)
 * Requiere operar como, o junto a, un Acquiring Partner habilitado por Klarna.
 */
export const klarnaOnboardCompany = createServerFn({ method: "POST" })
  .validator(parseInput)
  .handler(async ({ data }): Promise<KycSnapshot> => {
    const base = { provider: PROVIDER, simulated: false } as const;
    const apiKey = process.env.KLARNA_API_KEY?.trim();
    const url = process.env.KLARNA_ONBOARD_URL?.trim();
    if (!apiKey || !url) return { ...base, status: "not_configured", missing: [] };

    const answers = companyAnswersSchema.safeParse(data.answers);
    if (!answers.success) {
      return { ...base, status: "pending_data", missing: ["Identidad de la empresa"] };
    }

    const built = buildKlarnaOnboardingPayload(
      companyFromAnswers(data.answers),
      `sicr3p-${data.sessionId}`,
      data.answers.entityType,
    );
    if (!built.ok) return { ...base, status: "pending_data", missing: built.missing };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Basic ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(built.payload),
      });
      if (!res.ok) {
        return {
          ...base,
          status: "failed",
          missing: [
            res.status === 409 ? "La cuenta ya existe con datos distintos" : `Error ${res.status}`,
          ],
        };
      }
      const body = (await res.json()) as KlarnaOnboardingResponse;
      return { ...base, status: "submitted", missing: [], reference: body.partner_account_id };
    } catch {
      return { ...base, status: "failed", missing: ["Sin conexión con el proveedor"] };
    }
  });
