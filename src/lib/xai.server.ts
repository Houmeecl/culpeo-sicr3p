import { SYSTEM_PROMPT } from "./knowledge";

const CHAT_URL = "https://api.x.ai/v1/chat/completions";
const STT_URL = "https://api.x.ai/v1/stt";
const TTS_URL = "https://api.x.ai/v1/tts";

const STT_KEYTERMS = [
  "Proveedor Regional",
  "Antofagasta",
  "valor retenido",
  "membresía",
  "registro",
  "inscripción",
  "diagnóstico",
  "Gemelo Digital Humano",
  "protección paramétrica",
  "Índice de Retención",
  "Calama",
  "Mejillones",
  "Taltal",
  "Tocopilla",
  "San Pedro de Atacama",
  "Ollagüe",
  "Sierra Gorda",
  "María Elena",
  "Likan Antai",
];

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ConverseInput = {
  mode: "voice" | "text" | "greet";
  text?: string;
  audioBase64?: string;
  mimeType?: string;
  history: ChatTurn[];
  speak: boolean;
  origen?: "seleccion" | "embed";
  empresa?: string;
  sessionId?: string;
};

export type Faena = [boolean, boolean, boolean, boolean, boolean];

export type ConverseOk = {
  ok: true;
  userText: string;
  assistantText: string;
  audioBase64?: string;
  audioMime?: string;
  next?: "incorporar";
  faena?: Faena;
};

export type ConverseErr = {
  ok: false;
  error: "unavailable" | "no-speech" | "too-long" | "quota" | "failed";
  message: string;
};

export type ConverseResult = ConverseOk | ConverseErr;

function apiKey() {
  return process.env.XAI_API_KEY ?? "";
}

function mimeToExt(mime: string) {
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  return "webm";
}

function takeMarks(text: string) {
  const registro = /\[\[REGISTRO\]\]/i.test(text);
  const faenaMatch = text.match(/\[\[FAENA:([01],[01],[01],[01],[01])\]\]/i);
  const faena: Faena | undefined = faenaMatch
    ? (faenaMatch[1].split(",").map((n) => n === "1") as Faena)
    : undefined;
  const clean = text
    .replace(/\[\[REGISTRO\]\]/gi, "")
    .replace(/\[\[FAENA:[01],[01],[01],[01],[01]\]\]/gi, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
  return {
    text: clean,
    next: registro ? ("incorporar" as const) : undefined,
    faena: registro ? ([true, true, true, true, true] as Faena) : faena,
  };
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string,
): Promise<string> {
  const key = apiKey();
  const bytes = Buffer.from(audioBase64, "base64");
  const filename = `speech.${mimeToExt(mimeType)}`;
  const file = new File([bytes], filename, {
    type: mimeType || "audio/webm",
  });

  const form = new FormData();
  form.append("model", "grok-voice-transcribe-2.0");
  form.append("file", file);
  form.append("language", "es");
  for (const term of STT_KEYTERMS) {
    form.append("keyterm", term);
  }

  const res = await fetch(STT_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`stt ${res.status}`);
  }
  const body = (await res.json()) as { text?: string };
  return (body.text ?? "").trim();
}

export async function chatReply(
  history: ChatTurn[],
  userText: string,
): Promise<{
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}> {
  const key = apiKey();
  const clipped = history.slice(-16);
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.35,
      max_tokens: 380,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...clipped.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userText },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`chat ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  return {
    text: (body.choices?.[0]?.message?.content ?? "").trim(),
    inputTokens: body.usage?.prompt_tokens,
    outputTokens: body.usage?.completion_tokens,
    totalTokens: body.usage?.total_tokens,
  };
}

function toSpoken(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function speakText(text: string): Promise<{
  audioBase64: string;
  mime: string;
}> {
  const key = apiKey();
  const spoken = toSpoken(text).slice(0, 2500);
  let lastStatus = 0;
  for (const voice_id of ["ara", "eve"] as const) {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: spoken,
        voice_id,
        language: "es-MX",
      }),
    });
    lastStatus = res.status;
    if (!res.ok) continue;
    const ctype = res.headers.get("content-type") ?? "";
    if (ctype.includes("application/json")) {
      const body = (await res.json()) as {
        audio?: string;
        content_type?: string;
      };
      if (body.audio) {
        return {
          audioBase64: body.audio,
          mime: body.content_type || "audio/mpeg",
        };
      }
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      return {
        audioBase64: buf.toString("base64"),
        mime: ctype || "audio/mpeg",
      };
    }
  }
  throw new Error(`tts ${lastStatus}`);
}

const GREET_SELECCION =
  "Hola, soy Culpeo. Llegaste desde la carta de selección de Proveedor Regional. El dossier lo dice así: primero entendemos tu empresa, después recomendamos. ¿Me autorizas a grabar esta conversación?";

function greetText(input: ConverseInput) {
  const name = (input.empresa ?? "").trim();
  if (name) {
    return `Hola, soy Culpeo. ${name} fue seleccionada para Proveedor Regional. Primero entendemos tu empresa, después recomendamos. ¿Me autorizas a grabar esta conversación?`;
  }
  return GREET_SELECCION;
}

const greetCache = new Map<string, { audioBase64: string; mime: string }>();

export async function runConversation(
  input: ConverseInput,
): Promise<ConverseResult> {
  if (!apiKey()) {
    return {
      ok: false,
      error: "unavailable",
      message:
        "El asistente de voz no está disponible en este momento. Inténtalo más tarde.",
    };
  }

  if (input.history.length > 16) {
    return {
      ok: false,
      error: "quota",
      message:
        "Llegamos al tope de esta conversación. Un ejecutivo puede continuar el acompañamiento con tu empresa.",
    };
  }

  let userText = (input.text ?? "").trim();
  const greet = input.mode === "greet";

  if (greet) {
    const spokenText = greetText(input);
    if (input.speak) {
      try {
        let cached = greetCache.get(spokenText);
        if (!cached) {
          const spoken = await speakText(spokenText);
          cached = { audioBase64: spoken.audioBase64, mime: spoken.mime };
          greetCache.set(spokenText, cached);
        }
        return {
          ok: true,
          userText: "",
          assistantText: spokenText,
          audioBase64: cached.audioBase64,
          audioMime: cached.mime,
        };
      } catch {
        return { ok: true, userText: "", assistantText: spokenText };
      }
    }
    return { ok: true, userText: "", assistantText: spokenText };
  }

  if (input.mode === "voice") {
    const audio = input.audioBase64 ?? "";
    if (!audio) {
      return {
        ok: false,
        error: "no-speech",
        message: "No recibí audio. Vuelve a intentar o escribe tu pregunta.",
      };
    }
    if (audio.length > 900_000) {
      return {
        ok: false,
        error: "too-long",
        message: "El audio es demasiado largo. Graba hasta 20 segundos.",
      };
    }
    try {
      userText = await transcribeAudio(
        audio,
        input.mimeType || "audio/webm",
      );
    } catch {
      return {
        ok: false,
        error: "failed",
        message:
          "No pude transcribir el audio. Escribe tu pregunta o reintenta el micrófono.",
      };
    }
  }

  if (!userText) {
    return {
      ok: false,
      error: "no-speech",
      message: "No alcancé a escucharte. Habla un poco más cerca del micrófono.",
    };
  }

  let assistantText = "";
  try {
    const { culpeoAgent, ai, isAmplitudeAiEnabled } = await import(
      "./amplitude-ai.ts"
    );
    const sessionId =
      (input.sessionId && input.sessionId.trim()) || crypto.randomUUID();
    const runChat = async (s: {
      trackUserMessage: (content: string) => void;
      trackAiMessage: (
        content: string,
        model: string,
        provider: string,
        latencyMs: number,
        opts?: Record<string, unknown>,
      ) => void;
    } | null) => {
      s?.trackUserMessage(userText);
      const start = performance.now();
      try {
        const reply = await chatReply(input.history, userText);
        assistantText = reply.text;
        const latencyMs = Math.max(1, performance.now() - start);
        s?.trackAiMessage(assistantText, "grok-4.5", "xai", latencyMs, {
          inputTokens: reply.inputTokens ?? 1,
          outputTokens: reply.outputTokens ?? 1,
          totalTokens: reply.totalTokens,
          totalCostUsd: 0,
        });
      } catch (error) {
        const latencyMs = Math.max(1, performance.now() - start);
        s?.trackAiMessage("", "grok-4.5", "xai", latencyMs, {
          isError: true,
          errorMessage: error instanceof Error ? error.message : "chat failed",
          totalCostUsd: 0,
        });
        throw error;
      }
    };

    if (isAmplitudeAiEnabled()) {
      try {
        await culpeoAgent.session({ sessionId }).run(async (s) => {
          await runChat(s);
        });
      } finally {
        await ai.flush();
      }
    } else {
      await runChat(null);
    }
  } catch {
    return {
      ok: false,
      error: "failed",
      message:
        "Tuve un problema al responder. Inténtalo otra vez en unos segundos.",
    };
  }

  if (!assistantText) {
    return {
      ok: false,
      error: "failed",
      message: "No pude armar una respuesta. Reintenta, por favor.",
    };
  }

  const marked = takeMarks(assistantText);
  assistantText = marked.text;

  const result: ConverseOk = {
    ok: true,
    userText,
    assistantText,
    next: marked.next,
    faena: marked.faena,
  };

  if (input.speak) {
    try {
      const spoken = await speakText(assistantText);
      result.audioBase64 = spoken.audioBase64;
      result.audioMime = spoken.mime;
    } catch {
      // Text still succeeds if TTS is down.
    }
  }

  return result;
}
