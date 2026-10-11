import type { ApplicationStatus } from "../journey-engine/types";

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: "Borrador",
  journey_started: "Recorrido iniciado",
  identity_incomplete: "Identidad incompleta",
  kyc_pending: "Verificación pendiente",
  kyc_submitted: "Verificación enviada",
  payment_pending: "Pago pendiente",
  payment_received: "Pago recibido",
  in_review: "En revisión",
  needs_documents: "Requiere antecedentes",
  approved: "Aprobado",
  rejected: "Rechazado",
  account_active: "Cuenta activa",
};

/** Transiciones permitidas (ver diagrama de estados en docs/journey). */
export const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["journey_started"],
  journey_started: ["identity_incomplete", "draft"],
  identity_incomplete: ["kyc_pending", "journey_started"],
  kyc_pending: ["kyc_submitted", "identity_incomplete"],
  kyc_submitted: ["payment_pending", "needs_documents", "identity_incomplete"],
  payment_pending: ["payment_received"],
  payment_received: ["in_review", "account_active"],
  in_review: ["approved", "rejected", "needs_documents"],
  needs_documents: ["in_review"],
  approved: ["account_active"],
  rejected: [],
  account_active: [],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus) {
  return from === to || TRANSITIONS[from].includes(to);
}
