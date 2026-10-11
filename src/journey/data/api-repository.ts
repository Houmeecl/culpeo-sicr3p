import type { JourneyState } from "../engine/types";
import type { JourneyRepository, StatusSnapshot } from "./ports";

/**
 * Modo conectado: implementa los contratos de docs/journey (sección 9).
 * Aún no hay backend: se activa sólo si `config.apiBase` está definido.
 */
export function createApiRepository(apiBase: string): JourneyRepository {
  const base = `${apiBase.replace(/\/$/, "")}/journey/v1`;
  const SESSION_KEY = "sicr3p.journey.session";

  type Session = { sessionId: string; sessionToken: string };

  function readSession(): Session | null {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  async function request<T>(path: string, init: RequestInit = {}, session?: Session | null) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.sessionToken}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) throw new Error(`Journey API ${res.status}`);
    return (await res.json()) as T;
  }

  async function ensureSession(state: JourneyState): Promise<Session> {
    const existing = readSession();
    if (existing) return existing;
    const created = await request<Session>("/sessions", {
      method: "POST",
      body: JSON.stringify({ mode: state.mode, path: state.path, locale: "es-CL" }),
    });
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(created));
    return created;
  }

  return {
    kind: "api",
    async load() {
      const session = readSession();
      if (!session) return null;
      return request<JourneyState>(`/sessions/${session.sessionId}`, {}, session);
    },
    async save(state) {
      const session = await ensureSession(state);
      await request(
        `/sessions/${session.sessionId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            path: state.path,
            currentStepId: state.scene,
            answers: state.answers,
          }),
        },
        session,
      );
    },
    async clear() {
      window.localStorage.removeItem(SESSION_KEY);
    },
    async status() {
      const session = readSession();
      if (!session) return null;
      return request<StatusSnapshot>(`/sessions/${session.sessionId}/status`, {}, session);
    },
  };
}
