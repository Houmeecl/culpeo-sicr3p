import type { Question } from "../journey-engine/types";

/**
 * Cumplimiento: declaración de actividad permitida según la política pública de
 * Klarna sobre negocios prohibidos y restringidos. Es una declaración del
 * usuario; la evaluación final la hace el proveedor o el adquirente aliado.
 */
export const KLARNA_PROHIBITED_BUSINESSES_URL =
  "https://docs.klarna.com/klarna-network-distribution/resources/legal-and-compliance/policies-and-term-of-service/prohibited-and-restricted-businesses/";

export const COMPLIANCE_DECLARATION: Question = {
  id: "complianceDeclaration",
  kind: "consent",
  prompt: "¿Tu actividad está fuera de la lista de negocios prohibidos o restringidos?",
  label: "Declaro que mi actividad no está en la lista de negocios prohibidos o restringidos.",
  hint: "La revisión final la realiza el proveedor de verificación.",
  link: { href: KLARNA_PROHIBITED_BUSINESSES_URL, text: "Ver la lista (Klarna)" },
  required: true,
};
