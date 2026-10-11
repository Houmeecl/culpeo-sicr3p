export const WORLD = {
  background: "#F6ECF4",
  island: "#FFFFFF",
  islandSide: "#EADCEB",
  tray: "#D9D3CA",
  ink: "#111114",
  stone: "#D9CCDB",
  tileOff: "#EEE2EE",
  pink: "#FF8FB3",
  pinkSoft: "#FFC2D4",
  pinkDeep: "#E9628E",
  tree: "#BFD8C4",
  trunk: "#B79C82",
  culpeo: "#E07A3F",
  cream: "#F6E7D3",
  dark: "#26262B",
} as const;

/** Posiciones de cámara por escena: [posición, objetivo]. */
export type CameraShot = { pos: [number, number, number]; look: [number, number, number] };

export const PEDESTAL_X = 2.1;
export const PEDESTAL_Z = 1.2;
