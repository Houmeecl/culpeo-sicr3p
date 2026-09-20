import { SYSTEM_PROMPT } from "./knowledge";
import { env } from "./env.server";
import type { ConverseInput, Faena } from "./xai.server";

export function n8nWebhookUrl() {
  return env("N8N_WEBHOOK_URL");
}

export type N8nReply = {
  assistantText: string;
  userText?: string;
  audioBase64?: string;
  audioMime?: string;
  faena?: Faena;
  next?: "incorporar";
};

function asFaena(value: unknown): Faena | undefined {
  if (typeof value === "string" && /^[01],[01],[01],[01],[01]$/.test(value)) {
    return value.split(",").map((n) => n === "1") as Faena;
  }
  if (Array.isArray(value) && value.length === 5) {
    return value.map((n) => n === true || n === 1 || n === "1") as Faena;
  }
  return undefined;
}

export async function n8nConverse(
  input: ConverseInput,
  userText: string,
): Promise<N8nReply | null> {
  const url = n8nWebhookUrl();
  if (!url) return null;

  const secret = env("N8N_WEBHOOK_SECRET");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(secret ? { "x-culpeo-secret": secret } : {}),
    },
    body: JSON.stringify({
      sessionId: input.sessionId,
      mode: input.mode,
      origen: input.origen,
      empresa: input.empresa,
      userText,
      history: input.history,
      systemPrompt: SYSTEM_PROMPT,
      audioBase64: input.mode === "voice" ? input.audioBase64 : undefined,
      mimeType: input.mimeType,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    throw new Error(`n8n ${res.status}`);
  }

  const body = (await res.json()) as {
    assistantText?: string;
    text?: string;
    output?: string;
    userText?: string;
    audioBase64?: string;
    audioMime?: string;
    faena?: unknown;
    next?: unknown;
  };

  const assistantText = (
    body.assistantText ??
    body.text ??
    body.output ??
    ""
  ).trim();
  if (!assistantText) return null;

  return {
    assistantText,
    userText: typeof body.userText === "string" ? body.userText.trim() : undefined,
    audioBase64: body.audioBase64,
    audioMime: body.audioMime,
    faena: asFaena(body.faena),
    next: body.next === "incorporar" ? "incorporar" : undefined,
  };
}
