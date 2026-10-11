import { z } from "zod";
import { isValidEmail, isValidPhone, isValidTaxId } from "../../modules/identity/validation";

/** Esquemas de respuestas de la entrevista (validación en cliente y servidor). */

const accepted = z.literal("yes");

export const personAnswersSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().refine(isValidEmail, "Correo inválido"),
  phone: z.string().refine(isValidPhone, "Teléfono inválido"),
  location: z.string().trim().min(2),
  consent: accepted,
});

export const companyAnswersSchema = z.object({
  companyName: z.string().trim().min(2),
  taxId: z.string().refine(isValidTaxId, "RUT inválido"),
  representative: z.string().trim().min(2),
  email: z.string().refine(isValidEmail, "Correo inválido"),
  phone: z.string().refine(isValidPhone, "Teléfono inválido"),
  complianceDeclaration: accepted,
  consent: accepted,
});

export type PersonAnswers = z.infer<typeof personAnswersSchema>;
export type CompanyAnswers = z.infer<typeof companyAnswersSchema>;
