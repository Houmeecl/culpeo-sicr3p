/** Colores del manual de marca SICR3P/. El rosado es sólo de la tarjeta y de la chancha. */
export const WORLD = {
  background: "#EEF3FA",
  island: "#FFFFFF",
  islandSide: "#DCE4EF",
  tray: "#D9D3CA",
  ink: "#0F1B3D",
  stone: "#CBD3E0",
  tileOff: "#E6ECF5",
  /** Camino entre estaciones (sin recorrer). */
  road: "#E4EAF4",
  /** Violeta SICR3P/: estaciones, ruta y anillo de conexión. */
  accent: "#6B5CF6",
  accentSoft: "#CFC9FF",
  /** Verde Sostenible. */
  green: "#00B67A",
  lightBlue: "#E6F0FF",
  mountain: "#DCE4F2",
  mountainAlt: "#E6ECF7",
  /** Personaje chancha rosa (no se usa en la interfaz). */
  pink: "#FF8FB3",
  pinkSoft: "#FFC2D4",
  pinkDeep: "#E9628E",
  tree: "#B9DCC9",
  trunk: "#B79C82",
  culpeo: "#E07A3F",
  cream: "#F6E7D3",
  dark: "#26262B",
} as const;

/** Posiciones de cámara por escena: [posición, objetivo]. */
export type CameraShot = { pos: [number, number, number]; look: [number, number, number] };

export const PEDESTAL_X = 2.1;
export const PEDESTAL_Z = 1.2;
