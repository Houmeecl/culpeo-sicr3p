import type { JourneyState } from "../engine/types";
import type { JourneyRepository } from "./ports";

/**
 * Modo demostración / evento: guarda en el navegador.
 * - evento: sessionStorage (se pierde al cerrar la pestaña y al reiniciar).
 * - real sin API configurada: localStorage, para poder continuar después.
 */
export function createLocalRepository(storage: "session" | "local"): JourneyRepository {
  const KEY = "sicr3p.journey.v1";
  const store = () => {
    try {
      return storage === "session" ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  };

  return {
    kind: "local",
    async load() {
      try {
        const raw = store()?.getItem(KEY);
        return raw ? (JSON.parse(raw) as JourneyState) : null;
      } catch {
        return null;
      }
    },
    async save(state) {
      try {
        store()?.setItem(KEY, JSON.stringify(state));
      } catch {
        /* almacenamiento no disponible: el recorrido sigue en memoria */
      }
    },
    async clear() {
      try {
        store()?.removeItem(KEY);
      } catch {
        /* nada que limpiar */
      }
    },
  };
}
