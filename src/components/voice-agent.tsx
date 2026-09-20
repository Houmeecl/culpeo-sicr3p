import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";
import { LogoMark } from "@/components/brand-mark";
import { Mascot } from "@/components/mascot";
import { converse, type ChatTurn, type Faena } from "@/lib/voice";
import { cn } from "@/lib/utils";

type AgentStatus = "idle" | "listening" | "thinking" | "speaking" | "error";
type Layout = "page" | "embed";

function mergeFaena(prev: Faena, next?: Faena): Faena {
  if (!next) return prev;
  return prev.map((bit, i) => bit || Boolean(next[i])) as Faena;
}

function FaenaTrail({ faena }: { faena: Faena }) {
  const lit = faena.filter(Boolean).length;
  const current = faena.findIndex((bit) => !bit);
  return (
    <ol className="faena-trail" aria-label={`Diagnóstico: ${lit} de 5 hitos`}>
      {faena.map((on, i) => (
        <li
          key={i}
          className="faena-lamp"
          data-on={on ? "true" : "false"}
          data-next={!on && current === i ? "true" : "false"}
        />
      ))}
    </ol>
  );
}

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const MEMORY_KEY = "culpeo_mk";
const MEMORY_NOTE = "culpeo_mem";

function visitorMemoryKey() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(MEMORY_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(MEMORY_KEY, next);
  return next;
}

function pickRecorderMime() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function notifyParent(event: string) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage(
    { source: "proveedor-regional-agent", event },
    "*",
  );
}

function rmsLevel(analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>) {
  analyser.getByteTimeDomainData(buffer);
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    const v = (buffer[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buffer.length);
}

function createAudioContext() {
  const Win = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AC = Win.AudioContext || Win.webkitAudioContext;
  if (!AC) return null;
  return new AC();
}

export function VoiceAgent({
  layout = "page",
  origen = "seleccion",
  empresa,
  className,
}: {
  layout?: Layout;
  origen?: "seleccion" | "embed";
  empresa?: string;
  className?: string;
}) {
  const embed = layout === "embed";
  const navigate = useNavigate();
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [faena, setFaena] = useState<Faena>([false, false, false, false, false]);
  const speechRef = useRef<"server" | "browser">("server");
  const recRef = useRef<{ stop: () => void; abort: () => void } | null>(null);

  const historyRef = useRef<ChatTurn[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const speakerRef = useRef<HTMLAudioElement | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const vadCtxRef = useRef<AudioContext | null>(null);
  const speakAnalyserRef = useRef<AnalyserNode | null>(null);
  const speakRafRef = useRef<number | null>(null);
  const speakerGraphRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const vadRef = useRef<number | null>(null);
  const listenDelayRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const busyRef = useRef(false);
  const liveRef = useRef(false);
  const statusRef = useRef<AgentStatus>("idle");
  const mutedRef = useRef(false);
  const pendingNextRef = useRef<"incorporar" | null>(null);
  const sessionIdRef = useRef(crypto.randomUUID());
  const sceneRef = useRef<HTMLDivElement>(null);

  statusRef.current = status;
  mutedRef.current = muted;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const scene = sceneRef.current;
    if (!scene) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      tx = nx * -18;
      ty = ny * -10;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      scene.style.setProperty("--scene-x", `${cx}px`);
      scene.style.setProperty("--scene-y", `${cy}px`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    notifyParent("ready");
    const onGesture = () => {
      unlockAudio();
      void beginConversation();
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      liveRef.current = false;
      stopListenDelay();
      stopVad();
      stopStream();
      stopPlayback();
      stopTimer();
      stopSpeakPump();
      void outCtxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    notifyParent(status);
  }, [status]);

  function setAgentStatus(next: AgentStatus) {
    statusRef.current = next;
    setStatus(next);
  }

  function goToRegistro() {
    pendingNextRef.current = null;
    liveRef.current = false;
    busyRef.current = false;
    stopListenDelay();
    stopVad();
    stopPlayback();
    notifyParent("register");
    void navigate({ to: "/incorporar" });
  }

  function unlockAudio() {
    if (!outCtxRef.current || outCtxRef.current.state === "closed") {
      outCtxRef.current = createAudioContext();
    }
    void outCtxRef.current?.resume();
    if (!speakerRef.current) {
      const node = new Audio();
      node.preload = "auto";
      node.setAttribute("playsinline", "true");
      speakerRef.current = node;
    }
    const speaker = speakerRef.current;
    speaker.muted = true;
    speaker.src = SILENT_WAV;
    ensureSpeakerGraph();
    speaker
      .play()
      .then(() => {
        speaker.pause();
        speaker.currentTime = 0;
        speaker.muted = false;
      })
      .catch(() => {
        speaker.muted = false;
      });
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function stopPlayback() {
    stopSpeakPump();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    recRef.current?.abort();
    recRef.current = null;
    const source = ttsSourceRef.current;
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      ttsSourceRef.current = null;
    }
    const speaker = speakerRef.current;
    if (speaker) {
      speaker.onended = null;
      speaker.onerror = null;
      speaker.pause();
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function stopTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopVad() {
    if (vadRef.current) {
      window.cancelAnimationFrame(vadRef.current);
      vadRef.current = null;
    }
    const ctx = vadCtxRef.current;
    if (ctx) {
      void ctx.close();
      vadCtxRef.current = null;
    }
  }

  function stopListenDelay() {
    if (listenDelayRef.current) {
      window.clearTimeout(listenDelayRef.current);
      listenDelayRef.current = null;
    }
  }

  function resumeListening(delay = 280) {
    stopListenDelay();
    if (!liveRef.current || busyRef.current) return;
    listenDelayRef.current = window.setTimeout(() => {
      listenDelayRef.current = null;
      if (liveRef.current && !busyRef.current && statusRef.current !== "listening") {
        void startListening();
      }
    }, delay);
  }

  function ensureSpeakerGraph() {
    const ctx = outCtxRef.current;
    const speaker = speakerRef.current;
    if (!ctx || !speaker || speakerGraphRef.current) return;
    const source = ctx.createMediaElementSource(speaker);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    speakAnalyserRef.current = analyser;
    speakerGraphRef.current = true;
  }

  function setSpeakLevel(level: number) {
    const node = document.querySelector(".mascot") as HTMLElement | null;
    node?.style.setProperty("--speak", String(Math.max(0, Math.min(1, level))));
  }

  function stopSpeakPump() {
    if (speakRafRef.current) {
      window.cancelAnimationFrame(speakRafRef.current);
      speakRafRef.current = null;
    }
    setSpeakLevel(0);
  }

  function startSpeakPump(analyser: AnalyserNode) {
    stopSpeakPump();
    const buffer = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;
    const tick = () => {
      const level = Math.min(1, rmsLevel(analyser, buffer) * 7);
      setSpeakLevel(level);
      speakRafRef.current = window.requestAnimationFrame(tick);
    };
    speakRafRef.current = window.requestAnimationFrame(tick);
  }

  async function ensureMic() {
    const current = streamRef.current;
    if (current && current.active) return current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    streamRef.current = stream;
    return stream;
  }

  async function sendTurn(input: {
    mode: "voice" | "text" | "greet";
    text?: string;
    audioBase64?: string;
    mimeType?: string;
  }) {
    if (busyRef.current) return;
    busyRef.current = true;
    stopPlayback();
    setAgentStatus("thinking");

    try {
      const result = await converse({
        data: {
          mode: input.mode,
          text: input.text,
          audioBase64: input.audioBase64,
          mimeType: input.mimeType,
          history: historyRef.current,
          speak: !mutedRef.current,
          origen,
          empresa,
          sessionId: sessionIdRef.current,
          memoryKey: visitorMemoryKey(),
          memory: window.localStorage.getItem(MEMORY_NOTE) || undefined,
        },
      });

      if (!result.ok) {
        setAgentStatus("error");
        busyRef.current = false;
        if (liveRef.current) {
          window.setTimeout(() => {
            if (liveRef.current && statusRef.current === "error") {
              void startListening();
            }
          }, 900);
        }
        return;
      }

      const nextHistory: ChatTurn[] = [...historyRef.current];
      if (result.userText) {
        nextHistory.push({ role: "user", content: result.userText });
      }
      nextHistory.push({ role: "assistant", content: result.assistantText });
      historyRef.current = nextHistory.slice(-16);

      if (result.next === "incorporar") {
        pendingNextRef.current = "incorporar";
      }
      if (result.faena) {
        setFaena((prev) => mergeFaena(prev, result.faena));
      }
      if (result.speech) speechRef.current = result.speech;
      if (result.memory) {
        window.localStorage.setItem(MEMORY_NOTE, result.memory);
      }

      if (result.audioBase64 && !mutedRef.current) {
        busyRef.current = false;
        await playAudio(result.audioBase64, result.audioMime || "audio/mpeg");
        return;
      }

      if (!mutedRef.current && result.assistantText) {
        busyRef.current = false;
        await speakBrowser(result.assistantText);
        return;
      }

      if (pendingNextRef.current === "incorporar") {
        goToRegistro();
        return;
      }

      setAgentStatus("idle");
      busyRef.current = false;
      if (liveRef.current) resumeListening(200);
    } catch {
      setAgentStatus("error");
      busyRef.current = false;
      if (liveRef.current) {
        window.setTimeout(() => {
          if (liveRef.current && statusRef.current === "error") {
            void startListening();
          }
        }, 900);
      }
    }
  }

  async function playThroughContext(bytes: Uint8Array) {
    const ctx = outCtxRef.current ?? createAudioContext();
    if (!ctx) return false;
    outCtxRef.current = ctx;
    await ctx.resume();
    const copy = new Uint8Array(bytes);
    const decoded = await ctx.decodeAudioData(copy.buffer as ArrayBuffer);
    const source = ctx.createBufferSource();
    source.buffer = decoded;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    ttsSourceRef.current = source;
    speakAnalyserRef.current = analyser;
    startSpeakPump(analyser);
    await new Promise<void>((resolve) => {
      source.onended = () => resolve();
      source.start();
    });
    stopSpeakPump();
    ttsSourceRef.current = null;
    return true;
  }

  async function playThroughElement(url: string) {
    const speaker = speakerRef.current ?? new Audio();
    speaker.setAttribute("playsinline", "true");
    speaker.muted = false;
    speaker.volume = 1;
    speakerRef.current = speaker;
    const ended = new Promise<void>((resolve, reject) => {
      speaker.onended = () => resolve();
      speaker.onerror = () => reject(new Error("audio"));
    });
    speaker.src = url;
    await outCtxRef.current?.resume();
    ensureSpeakerGraph();
    if (speakAnalyserRef.current) startSpeakPump(speakAnalyserRef.current);
    await speaker.play();
    await ended;
    stopSpeakPump();
  }

  async function playAudio(base64: string, mime: string) {
    stopPlayback();
    setAgentStatus("speaking");
    void outCtxRef.current?.resume();
    try {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: mime || "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      try {
        await playThroughElement(url);
      } catch {
        await playThroughContext(bytes);
      }
    } catch {
      /* still continue the call */
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (pendingNextRef.current === "incorporar") {
      setAgentStatus("idle");
      goToRegistro();
      return;
    }
    if (statusRef.current === "speaking") {
      setAgentStatus("idle");
      if (liveRef.current && !busyRef.current) resumeListening(200);
    }
  }

  function watchSilence(stream: MediaStream) {
    stopVad();
    const ctx = createAudioContext();
    if (!ctx) return;
    vadCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const buffer = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;
    const started = Date.now();
    let hadSpeech = false;
    let silentSince = 0;

    const tick = () => {
      const rms = rmsLevel(analyser, buffer);
      const now = Date.now();
      const elapsed = now - started;
      if (elapsed > 450) {
        if (rms > 0.038) {
          hadSpeech = true;
          silentSince = 0;
        } else if (hadSpeech) {
          if (!silentSince) silentSince = now;
          else if (now - silentSince > 1400) {
            void stopListening();
            return;
          }
        }
      }
      if (elapsed > 20000) {
        void stopListening();
        return;
      }
      vadRef.current = window.requestAnimationFrame(tick);
    };
    void ctx.resume();
    vadRef.current = window.requestAnimationFrame(tick);
  }

  async function speakBrowser(text: string) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAgentStatus("idle");
      busyRef.current = false;
      if (pendingNextRef.current === "incorporar") {
        goToRegistro();
        return;
      }
      if (liveRef.current) resumeListening(200);
      return;
    }
    setAgentStatus("speaking");
    await new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-CL";
      utter.rate = 1.02;
      const pick = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.toLowerCase().startsWith("es"));
      if (pick) utter.voice = pick;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      window.setTimeout(resolve, Math.min(24000, 900 + text.length * 70));
    });
    if (pendingNextRef.current === "incorporar") {
      goToRegistro();
      return;
    }
    setAgentStatus("idle");
    busyRef.current = false;
    if (liveRef.current) resumeListening(220);
  }

  function browserRecCtor() {
    const w = window as Window & {
      SpeechRecognition?: new () => BrowserSpeech;
      webkitSpeechRecognition?: new () => BrowserSpeech;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition;
  }

  type BrowserSpeech = {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
    onerror: ((ev: { error?: string }) => void) | null;
    onend: (() => void) | null;
  };

  async function startBrowserListening() {
    const Ctor = browserRecCtor();
    if (!Ctor) {
      setAgentStatus("error");
      return;
    }
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = "es-CL";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript?.trim();
      recRef.current = null;
      if (text) void sendTurn({ mode: "text", text });
      else if (liveRef.current) resumeListening(400);
    };
    rec.onerror = (ev) => {
      recRef.current = null;
      if (ev.error === "aborted") return;
      if (liveRef.current) resumeListening(700);
      else setAgentStatus("error");
    };
    rec.onend = () => {
      if (recRef.current && statusRef.current === "listening" && liveRef.current) {
        recRef.current = null;
        resumeListening(400);
      }
    };
    recRef.current = rec;
    setAgentStatus("listening");
    rec.start();
  }

  async function startListening() {
    if (busyRef.current || statusRef.current === "listening") return;
    stopPlayback();
    stopVad();
    stopListenDelay();

    if (speechRef.current === "browser" && browserRecCtor()) {
      await startBrowserListening();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setAgentStatus("error");
      return;
    }

    try {
      const stream = await ensureMic();
      const mime = pickRecorderMime();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        void finishRecording(recorder.mimeType);
      };
      recorder.start(250);
      setAgentStatus("listening");
      watchSilence(stream);
      stopTimer();
      timerRef.current = window.setTimeout(() => {
        if (statusRef.current === "listening") void stopListening();
      }, 20000);
    } catch {
      if (liveRef.current) resumeListening(800);
      else setAgentStatus("error");
    }
  }

  async function stopListening() {
    stopTimer();
    stopVad();
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    else if (statusRef.current === "listening") {
      setAgentStatus("idle");
      if (liveRef.current) resumeListening(400);
    }
  }

  async function finishRecording(mimeType: string) {
    const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
    chunksRef.current = [];
    recorderRef.current = null;
    if (blob.size < 1200) {
      if (liveRef.current) resumeListening(400);
      else setAgentStatus("idle");
      return;
    }
    await sendTurn({
      mode: "voice",
      audioBase64: await blobToBase64(blob),
      mimeType,
    });
  }

  async function beginConversation() {
    if (liveRef.current || busyRef.current) return;
    liveRef.current = true;
    sessionIdRef.current = crypto.randomUUID();
    historyRef.current = [];
    setFaena([false, false, false, false, false]);
    notifyParent("handsfree");
    unlockAudio();
    await sendTurn({ mode: "greet" });
  }

  function onMascot() {
    unlockAudio();
    if (!liveRef.current) {
      void beginConversation();
      return;
    }
    if (statusRef.current === "thinking" || statusRef.current === "listening") return;
    if (statusRef.current === "speaking") {
      stopPlayback();
      resumeListening(120);
    }
  }

  const thinking = status === "thinking";

  return (
    <div
      className={cn(
        "relative overflow-x-hidden bg-paper text-ink",
        embed ? "h-dvh overflow-hidden" : "min-h-dvh",
        className,
      )}
    >
      <div
        ref={sceneRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="scene-parallax">
          <img
            src="/culpeo/horizon.webp"
            alt=""
            className="scene-horizon absolute inset-x-0 bottom-0 h-[52%] w-full object-cover object-bottom sm:h-[62%]"
          />
          <div className="scene-heat" />
        </div>
        <div className="absolute inset-x-0 top-0 h-[54%] bg-linear-to-b from-paper via-paper/85 to-transparent" />
      </div>
      <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-4 sm:px-5">
        <LogoMark className="size-8" />
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            if (next) {
              stopPlayback();
              if (liveRef.current) resumeListening(120);
            }
          }}
          className="inline-flex size-11 items-center justify-center rounded-md text-navy transition-colors duration-150 hover:bg-sand"
          aria-pressed={muted}
          aria-label={muted ? "Activar voz" : "Silenciar voz"}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </header>

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 pb-24">
        <Mascot
          state={status === "error" ? "error" : status}
          onClick={onMascot}
          disabled={thinking}
        />
      </main>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
        <FaenaTrail faena={faena} />
      </div>
    </div>
  );
}
