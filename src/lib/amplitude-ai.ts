import { AmplitudeAI, AIConfig } from "@amplitude/ai";
import { env } from "@/lib/env.server";

const apiKey =
  env("AMPLITUDE_AI_API_KEY") ??
  env("VITE_AMPLITUDE_API_KEY") ??
  (typeof import.meta.env.VITE_AMPLITUDE_API_KEY === "string"
    ? import.meta.env.VITE_AMPLITUDE_API_KEY
    : undefined);

export const ai = new AmplitudeAI({
  apiKey: apiKey ?? "disabled",
  config: new AIConfig({
    contentMode: "full",
    redactPii: true,
  }),
});

export const culpeoAgent = ai.agent("culpeo", {
  description:
    "Voice of Proveedor Regional: qualifies suppliers and closes membership registration",
});

export function isAmplitudeAiEnabled() {
  return Boolean(apiKey);
}
