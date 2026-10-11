// API pública del módulo SICR3P/ Journey. Independiente del resto de la app.
// Quien lo embeba debe incluir también `journey.css`.
export { JourneyApp, type JourneyAppProps } from "./ui/JourneyApp";
export { DEFAULT_CONFIG, createJourneyServices, type JourneyConfig } from "./config";
export * from "./engine/types";
export * from "./data/ports";
export { STATUS_LABEL, TRANSITIONS, canTransition } from "./engine/status";
export { journeyReducer, initialState, type JourneyAction } from "./engine/engine";
