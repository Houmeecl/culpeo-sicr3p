import type { ApplicationStatus, JourneyState } from "../engine/types";

/**
 * Puertos de integración. El Journey Engine y las escenas nunca llaman APIs
 * directamente: siempre a través de estas interfaces.
 */

export type StatusSnapshot = {
  status: ApplicationStatus;
  reason?: string;
  corrections: { field: string; message: string }[];
  updatedAt: string;
};

export interface JourneyRepository {
  readonly kind: "local" | "api";
  load(): Promise<JourneyState | null>;
  save(state: JourneyState): Promise<void>;
  clear(): Promise<void>;
  status?(): Promise<StatusSnapshot | null>;
}

export type PaymentResult = {
  status: "received" | "failed" | "redirect";
  redirectUrl?: string;
  simulated: boolean;
};

export interface PaymentProvider {
  readonly simulated: boolean;
  start(req: { sessionId: string; amountClp: number }): Promise<PaymentResult>;
}

export type KycResult = { status: "submitted" | "failed"; simulated: boolean };

export interface KycProvider {
  readonly simulated: boolean;
  submit(sessionId: string): Promise<KycResult>;
}

export type PosDemoResult = { approved: boolean; pointsEarned: number; simulated: true };

/** El POS es una estación del recorrido: si no está disponible, el recorrido sigue. */
export interface PosStation {
  isAvailable(): Promise<boolean>;
  demoPurchase(input: { productId: string; amountClp: number }): Promise<PosDemoResult>;
}

export type JourneyServices = {
  repository: JourneyRepository;
  payment: PaymentProvider;
  kyc: KycProvider;
  pos: PosStation;
};
