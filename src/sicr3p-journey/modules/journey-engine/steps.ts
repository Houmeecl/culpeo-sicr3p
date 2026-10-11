import type { JourneyPath, SceneDef } from "./types";

export const SCENES: SceneDef[] = [
  { id: "cover", title: "Portada", available: true },
  { id: "path", title: "Elección de camino", available: true },
  { id: "identity", title: "Identidad", available: true },
  { id: "business", title: "Construye tu negocio", available: false, onlyFor: "company" },
  { id: "pos", title: "Estación POS", available: false },
  { id: "network", title: "Red empresarial", available: false },
  { id: "development", title: "Desarrollo", available: false },
  { id: "loyalty", title: "Fidelización", available: false },
  { id: "merch", title: "Merchandising", available: false },
  { id: "review", title: "Revisión", available: false },
  { id: "activation", title: "Activación", available: false },
  { id: "result", title: "Resultado", available: false },
];

export const GUIDES: Record<JourneyPath, { name: string; role: string }> = {
  company: { name: "Culpeo", role: "Guía del mundo empresarial" },
  person: { name: "Chancha rosa", role: "Guía de fidelización y comunidad" },
};
