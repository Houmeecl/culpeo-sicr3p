export const COMMUNES = [
  "Antofagasta",
  "Mejillones",
  "Tocopilla",
  "María Elena",
  "Calama",
  "San Pedro de Atacama",
  "Ollagüe",
  "Sierra Gorda",
  "Taltal",
] as const;

export type Commune = (typeof COMMUNES)[number];

export const SECTORS = [
  "Mantención industrial",
  "Transporte y logística",
  "Alimentación y campamentos",
  "Construcción y montaje",
  "Servicios ambientales",
  "Tecnología y automatización",
  "Seguridad y SSO",
  "Suministros e insumos",
  "Ingeniería y consultoría",
  "Otro",
] as const;

export const WORKFORCE = ["1 a 9", "10 a 49", "50 a 199", "200 o más"] as const;

export const ROLES = [
  "Representante legal",
  "Gerente general",
  "Socio",
  "Encargado de desarrollo",
  "Otro",
] as const;

export const MEMBERSHIP_CLP = 120_000;

export function formatClp(amount: number) {
  return `$${amount.toLocaleString("es-CL")}`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  });
}
