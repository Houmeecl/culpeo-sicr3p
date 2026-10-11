// API pública del módulo SICR3P/ Journey. Independiente del resto de la app.
// Quien lo embeba debe incluir también `journey.css`.
export { JourneyApp, type JourneyAppProps } from "./app/experience/JourneyApp";
export { DEFAULT_CONFIG, createJourneyServices, type JourneyConfig } from "./config";
export * from "./modules/journey-engine/types";
export { journeyReducer, initialState, type JourneyAction } from "./modules/journey-engine/engine";
export { STATUS_LABEL, TRANSITIONS, canTransition } from "./modules/status/status";
export type { KycProvider, KycRequest } from "./modules/kyc/kyc";
export type { PaymentProvider, PaymentResult } from "./modules/payment-adapter/payment";
export * from "./contracts/api/ports";
export * from "./contracts/api/dto";
export * from "./contracts/events/journey-events";
