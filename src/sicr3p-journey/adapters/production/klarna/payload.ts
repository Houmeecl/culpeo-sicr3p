import {
  klarnaOnboardingSchema,
  type KlarnaOnboardingPayload,
} from "../../../contracts/schemas/klarna-onboarding";
import type { CompanyProfile } from "../../../modules/company-profile/types";
import { cleanTaxId } from "../../../modules/identity/validation";

/** Etiquetas legibles para los datos que aún faltan. */
const MISSING_LABEL: Record<string, string> = {
  "supplementary_business_data.legal_registration.entity_type": "Tipo de entidad legal",
  "supplementary_business_data.legal_registration.registration_address": "Dirección legal",
  store_groups: "Marcas y locales",
};

export type PayloadResult =
  { ok: true; payload: KlarnaOnboardingPayload } | { ok: false; missing: string[] };

/**
 * Traduce el perfil de empresa SICR3P/ al payload de onboarding de Klarna.
 * Marca → store_group, local → store. Una empresa = una cuenta de partner.
 */
export function buildKlarnaOnboardingPayload(
  company: CompanyProfile,
  reference: string,
  entityType?: string,
): PayloadResult {
  const taxId = cleanTaxId(company.legalEntity.taxId);
  const candidate = {
    partner_account_reference: reference,
    partner_account_name: company.displayName,
    partner_account_contact: {
      name: company.representative.fullName,
      email: company.representative.email,
      phone: company.representative.phone,
    },
    partner_business_entities: [
      { legal_name: company.legalEntity.legalName, country: company.legalEntity.country },
    ],
    supplementary_business_data: {
      legal_registration: {
        registration_number: taxId,
        authority: "Servicio de Impuestos Internos (SII)",
        entity_type: entityType ?? "",
        tax_identifiers: taxId ? [taxId] : [],
        registration_address: company.registrationAddress ?? "",
      },
      stakeholders: [{ name: company.representative.fullName, role: "legal_representative" }],
    },
    store_groups: company.brands.map((brand) => ({
      store_group_reference: `${reference}-${brand.id}`,
      brand_reference: brand.name,
      stores: company.stores
        .filter((st) => !st.brandId || st.brandId === brand.id)
        .map((st) => ({ store_reference: `${reference}-${st.id}` })),
    })),
  };

  const parsed = klarnaOnboardingSchema.safeParse(candidate);
  if (parsed.success) return { ok: true, payload: parsed.data };
  const missing = new Set<string>();
  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".");
    const key = Object.keys(MISSING_LABEL).find((k) => path.startsWith(k));
    missing.add(key ? MISSING_LABEL[key] : path);
  }
  return { ok: false, missing: [...missing] };
}
