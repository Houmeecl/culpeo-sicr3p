import type { JourneyPath, SceneDef } from "./types";

/** Los 11 pasos del flujo visual de inscripción (uno por estación del anillo). */
export const SCENES: SceneDef[] = [
  { id: "cover", title: "Inicio", subtitle: "Bienvenida", available: true },
  { id: "path", title: "Elige tu camino", subtitle: "Persona o empresa", available: true },
  { id: "identity", title: "Identidad", subtitle: "Conozcámonos", available: true },
  { id: "world", title: "Tu mundo", subtitle: "Cuéntanos más", available: true },
  { id: "pos", title: "El POS", subtitle: "Un canal, muchas posibilidades", available: true },
  { id: "network", title: "La red", subtitle: "Conectamos", available: true },
  { id: "solutions", title: "Soluciones", subtitle: "Tu próximo paso", available: true },
  { id: "card", title: "Tu tarjeta", subtitle: "Fidelización para todos", available: true },
  { id: "review", title: "Revisión", subtitle: "Confirma tus datos", available: true },
  { id: "payment", title: "Pago", subtitle: "Activa tu cuenta", available: true },
  { id: "result", title: "¡Listo!", subtitle: "Bienvenido", available: true },
];

export const GUIDES: Record<JourneyPath, { name: string; role: string }> = {
  company: { name: "Culpeo", role: "Guía del mundo empresarial" },
  person: { name: "Chancha rosa", role: "Guía de fidelización y comunidad" },
};

export function sceneNumber(id: SceneDef["id"]) {
  return SCENES.findIndex((s) => s.id === id) + 1;
}
