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

type WorldInput = { activity: string; brand: string; channels: string[]; branches: number };

/** Construye el perfil a partir de la entrevista y de "Tu mundo". */
export function companyFromAnswers(a: Record<string, string>, world?: WorldInput): CompanyProfile {
  const brandName = world?.brand.trim() ?? "";
  const brands: Brand[] = brandName ? [{ id: "b1", name: brandName }] : [];
  const stores: Store[] = brandName
    ? Array.from({ length: 1 + (world?.branches ?? 0) }, (_, i) => ({
        id: `s${i + 1}`,
        brandId: "b1",
        name: i === 0 ? brandName : `${brandName} sucursal ${i}`,
        isBranch: i > 0,
      }))
    : [];
  const channels: Channel[] = (world?.channels ?? []).map((kind, i) => ({
    id: `c${i + 1}`,
    kind: kind as Channel["kind"],
  }));
  return {
    legalEntity: { taxId: a.taxId ?? "", legalName: a.companyName ?? "", country: "CL" },
    displayName: a.companyName ?? "",
    activity: world?.activity ?? "",
    representative: {
      fullName: a.representative ?? "",
      email: a.email ?? "",
      phone: a.phone ?? "",
    },
    brands,
    stores,
    channels,
    registrationAddress: a.registrationAddress,
  };
}
