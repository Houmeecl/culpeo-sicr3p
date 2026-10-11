import { z } from "zod";

/**
 * Payload de "Onboard a merchant" (Klarna Management API), según la guía
 * "Build the onboarding payload" de Klarna Network Distribution.
 *
 * La guía nombra los bloques de primer nivel pero no publica todos los campos
 * internos. Los nombres anidados marcados "VALIDAR" deben confirmarse contra la
 * referencia del Management API antes de habilitar producción.
 */

const contactSchema = z.object({
  name: z.string().min(1), // VALIDAR
  email: z.string().email(), // VALIDAR
  phone: z.string().min(6), // VALIDAR
});

const legalRegistrationSchema = z.object({
  registration_number: z.string().min(1),
  authority: z.string().min(1),
  entity_type: z.string().min(1),
  tax_identifiers: z.array(z.string().min(1)).min(1),
  registration_address: z.string().min(1), // VALIDAR: probablemente objeto estructurado
});

const stakeholderSchema = z.object({
  name: z.string().min(1), // VALIDAR
  role: z.string().min(1), // VALIDAR
});

const storeGroupSchema = z.object({
  store_group_reference: z.string().min(1),
  brand_reference: z.string().min(1),
  stores: z.array(z.object({ store_reference: z.string().min(1) })).min(1),
});

export const klarnaOnboardingSchema = z.object({
  partner_account_reference: z.string().min(1),
  partner_account_name: z.string().min(1),
  partner_account_contact: contactSchema,
  partner_business_entities: z
    .array(z.object({ legal_name: z.string().min(1), country: z.string().length(2) })) // VALIDAR
    .min(1),
  supplementary_business_data: z.object({
    legal_registration: legalRegistrationSchema,
    stakeholders: z.array(stakeholderSchema).min(1),
  }),
  store_groups: z.array(storeGroupSchema).min(1),
});

export type KlarnaOnboardingPayload = z.infer<typeof klarnaOnboardingSchema>;

/** Respuesta: Klarna devuelve el id de cuenta; tras el alta queda PARTIALLY_OPERATIONAL. */
export type KlarnaOnboardingResponse = {
  partner_account_id: string;
  state?: string;
};
