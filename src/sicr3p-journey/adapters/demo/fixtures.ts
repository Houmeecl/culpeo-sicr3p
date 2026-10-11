import type { JourneyPath, JourneyProfile } from "../../modules/journey-engine/types";

/**
 * Identidades ficticias para el modo evento. Los RUT son válidos en formato
 * (dígito verificador) pero no corresponden a contribuyentes reales conocidos;
 * correos con dominio reservado .example.
 */
const PEOPLE = [
  { fullName: "Valentina Rojas", location: "Antofagasta" },
  { fullName: "Matías Fuentes", location: "Calama" },
  { fullName: "Camila Araya", location: "Mejillones" },
];

const COMPANIES = [
  { companyName: "Cocinería El Faro", representative: "Paula Díaz" },
  { companyName: "Transportes Pampa", representative: "Jorge Tapia" },
  { companyName: "Ferretería La Portada", representative: "Rosa Castillo" },
];

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

export function fictionalAnswers(path: JourneyPath): Record<string, string> {
  if (path === "person") {
    const p = pick(PEOPLE);
    return {
      ...p,
      email: "visita@evento.example",
      phone: "+56 9 1111 1111",
      consent: "yes",
    };
  }
  const c = pick(COMPANIES);
  return {
    ...c,
    taxId: "11.111.111-1",
    email: "empresa@evento.example",
    phone: "+56 9 2222 2222",
    complianceDeclaration: "yes",
    consent: "yes",
  };
}

/** "Tu mundo" ficticio para completar la demo rápidamente. */
export function fictionalProfile(path: JourneyPath): Partial<JourneyProfile> {
  return path === "company"
    ? { activity: "restaurante", brand: "El Faro", channels: ["physical", "mobile"], branches: 1 }
    : { interests: ["gastronomia", "eventos"] };
}
