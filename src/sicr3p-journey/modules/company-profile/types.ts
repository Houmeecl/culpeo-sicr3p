/** Una empresa tiene una sola cuenta, aunque tenga varias marcas, locales o canales. */
export type LegalEntity = { taxId: string; legalName: string; country: "CL" };
export type Representative = { fullName: string; email: string; phone: string };
export type Brand = { id: string; name: string };
export type Store = {
  id: string;
  brandId?: string;
  name: string;
  commune?: string;
  isBranch: boolean;
};
export type Channel = { id: string; kind: "physical" | "web" | "mobile"; url?: string };

export type CompanyProfile = {
  legalEntity: LegalEntity;
  displayName: string;
  activity: string;
  representative: Representative;
  brands: Brand[];
  stores: Store[];
  channels: Channel[];
  /** Dirección legal (se captura en la estación "Construye tu negocio"). */
  registrationAddress?: string;
};

/** Construye el perfil a partir de las respuestas de la entrevista. */
export function companyFromAnswers(a: Record<string, string>): CompanyProfile {
  return {
    legalEntity: { taxId: a.taxId ?? "", legalName: a.companyName ?? "", country: "CL" },
    displayName: a.companyName ?? "",
    activity: a.activity ?? "",
    representative: {
      fullName: a.representative ?? "",
      email: a.email ?? "",
      phone: a.phone ?? "",
    },
    brands: [],
    stores: [],
    channels: [],
    registrationAddress: a.registrationAddress,
  };
}
