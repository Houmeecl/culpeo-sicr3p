import { SCENES } from "../../modules/journey-engine/steps";
import type { JourneyPath, JourneyState, SceneId } from "../../modules/journey-engine/types";

/** Geometría del recorrido: cada escena es un punto del anillo. */
export const RING_RADIUS = 4.3;
export const STATION_COUNT = SCENES.length;

/** Ángulo (radianes) de una posición continua `s` sobre el anillo (0 = portada, al frente). */
export function stationAngle(s: number) {
  return Math.PI / 2 + (s / STATION_COUNT) * Math.PI * 2;
}

export function ringPoint(s: number, radius = RING_RADIUS): [number, number] {
  const a = stationAngle(s);
  return [Math.cos(a) * radius, Math.sin(a) * radius];
}

export function stationIndex(scene: SceneId) {
  return SCENES.findIndex((s) => s.id === scene);
}

/**
 * Dónde debe estar el personaje del usuario:
 * - portada: aún no hay personaje;
 * - elección: ambos guías esperan en la estación "Elección de camino";
 * - identidad: el elegido avanza una baldosa por respuesta hacia la siguiente estación.
 */
export function walkerTarget(state: Pick<JourneyState, "scene" | "questionIndex">, total: number) {
  if (state.scene === "cover") return null;
  if (state.scene === "path") return stationIndex("path");
  if (state.scene === "identity") {
    const base = stationIndex("identity");
    return base + (total ? Math.min(state.questionIndex, total) / total : 0);
  }
  return stationIndex(state.scene);
}

export type WalkerInfo = { path: JourneyPath | null; target: number | null };
