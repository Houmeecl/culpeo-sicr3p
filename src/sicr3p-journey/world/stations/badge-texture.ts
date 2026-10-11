import { useEffect } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { WORLD } from "../assets/palette";

export type BadgeState = "done" | "current" | "todo";

const textures = new Map<string, CanvasTexture>();

export function badgeTexture(n: number, state: BadgeState) {
  const key = `${n}-${state}`;
  const cached = textures.get(key);
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const bg = state === "done" ? WORLD.accent : state === "current" ? WORLD.ink : "#FFFFFF";
    const fg = state === "todo" ? "#7A869E" : "#FFFFFF";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = state === "todo" ? "#D5DCE8" : "rgba(255,255,255,0.9)";
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.font = "800 62px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), size / 2, size / 2 + 3);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  textures.set(key, tex);
  return tex;
}

/** Libera las texturas de los números al desmontar el mundo. */
export function useBadgeCleanup() {
  useEffect(
    () => () => {
      textures.forEach((t) => t.dispose());
      textures.clear();
    },
    [],
  );
}
