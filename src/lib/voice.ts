import { createServerFn } from "@tanstack/react-start";
import type { ChatTurn, ConverseInput, ConverseResult, Faena } from "./xai.server";

export type { ChatTurn, ConverseInput, ConverseResult, Faena };

function parseInput(input: unknown): ConverseInput {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid payload");
  }
  const data = input as Partial<ConverseInput>;
  if (data.mode !== "voice" && data.mode !== "text" && data.mode !== "greet") {
    throw new Error("Invalid mode");
  }
  const history = Array.isArray(data.history) ? data.history.slice(-16) : [];
  const cleanHistory: ChatTurn[] = history
    .filter(
      (m): m is ChatTurn =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 4000),
    }));

  return {
    mode: data.mode,
    text: typeof data.text === "string" ? data.text.slice(0, 2000) : undefined,
    audioBase64:
      typeof data.audioBase64 === "string"
        ? data.audioBase64.slice(0, 900_000)
        : undefined,
    mimeType:
      typeof data.mimeType === "string" ? data.mimeType.slice(0, 80) : undefined,
    history: cleanHistory,
    speak: data.speak !== false,
    origen: data.origen === "embed" ? "embed" : "seleccion",
    empresa:
      typeof data.empresa === "string" ? data.empresa.trim().slice(0, 80) : undefined,
    sessionId:
      typeof data.sessionId === "string" ? data.sessionId.trim().slice(0, 80) : undefined,
    memoryKey:
      typeof data.memoryKey === "string" ? data.memoryKey.trim().slice(0, 80) : undefined,
    memory:
      typeof data.memory === "string" ? data.memory.trim().slice(0, 1200) : undefined,
  };
}

export const converse = createServerFn({ method: "POST" })
  .validator(parseInput)
  .handler(async ({ data }): Promise<ConverseResult> => {
    const { runConversation } = await import("./xai.server.ts");
    return runConversation(data);
  });
