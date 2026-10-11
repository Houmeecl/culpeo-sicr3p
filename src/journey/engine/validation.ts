import type { Question } from "./types";

export function cleanTaxId(value: string) {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** RUT chileno con dígito verificador (módulo 11). */
export function isValidTaxId(value: string) {
  const clean = cleanTaxId(value);
  if (clean.length < 8 || clean.length > 9) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^[0-9]+$/.test(body)) return false;
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);
  return dv === expected;
}

export function formatTaxId(value: string) {
  const clean = cleanTaxId(value);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${body}-${clean.slice(-1)}`;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Teléfono chileno: 9 dígitos, con o sin +56. */
export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^56/, "");
  return /^[2-9]\d{8}$/.test(digits);
}

/** Devuelve un mensaje de error, o null si la respuesta es válida. */
export function validateAnswer(question: Question, raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (question.kind === "consent") {
    return value === "yes" ? null : "Para continuar necesitamos tu autorización.";
  }
  if (!value) return question.required ? "Necesito esta respuesta para seguir." : null;
  switch (question.kind) {
    case "email":
      return isValidEmail(value) ? null : "Ese correo no parece válido.";
    case "phone":
      return isValidPhone(value) ? null : "Usa un teléfono de 9 dígitos, ej. +56 9 1234 5678.";
    case "taxId":
      return isValidTaxId(value) ? null : "El RUT no es válido. Revisa el dígito verificador.";
    case "choice":
      return question.options?.some((o) => o.value === value) ? null : "Elige una opción.";
    case "text":
      return value.length >= 2 ? null : "Es muy corto.";
    default:
      return null;
  }
}
