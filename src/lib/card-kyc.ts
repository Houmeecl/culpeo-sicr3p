// Emisión de tarjeta soportada sicr3p/ con KYC — MODO DEMOSTRACIÓN.
// Sin proveedor KYC ni procesador de tarjetas conectado: la verificación,
// el puntaje de riesgo y la tokenización de wallet se simulan en el navegador.

export const FUND_SOURCES = [
  { value: "ventas", label: "Ventas de mi negocio", points: 0 },
  { value: "sueldo", label: "Sueldo o honorarios", points: 0 },
  { value: "ahorros", label: "Ahorros", points: 10 },
  { value: "herencia", label: "Herencia o donación", points: 20 },
  { value: "otro", label: "Otro origen", points: 30 },
] as const;

export const ACTIVITIES = [
  { value: "comercio", label: "Comercio y servicios", points: 0, esg: false },
  { value: "agro", label: "Agrícola y pesca", points: 5, esg: false },
  { value: "construccion", label: "Construcción y transporte", points: 5, esg: false },
  { value: "mineria", label: "Minería y energía", points: 15, esg: true },
  { value: "cambio", label: "Casas de cambio / criptoactivos", points: 25, esg: false },
] as const;

export const MONTHLY_VOLUME = [
  { value: "bajo", label: "Hasta $500.000", points: 0 },
  { value: "medio", label: "$500.000 a $3.000.000", points: 10 },
  { value: "alto", label: "Más de $3.000.000", points: 25 },
] as const;

export type KycForm = {
  fullName: string;
  rut: string;
  email: string;
  birthDate: string;
  fundSource: string;
  activity: string;
  volume: string;
  pep: boolean;
};

export const EMPTY_KYC: KycForm = {
  fullName: "",
  rut: "",
  email: "",
  birthDate: "",
  fundSource: "",
  activity: "",
  volume: "",
  pep: false,
};

export type RiskLevel = "bajo" | "medio" | "alto";
export type DueDiligence = "simplificada" | "estándar" | "reforzada";

export type RiskAssessment = {
  score: number;
  level: RiskLevel;
  diligence: DueDiligence;
  esgReview: boolean;
  reasons: string[];
  /** Alto riesgo exige revisión manual: no se emite automáticamente. */
  autoIssue: boolean;
};

export function assessRisk(form: KycForm): RiskAssessment {
  const reasons: string[] = [];
  let score = 0;

  const source = FUND_SOURCES.find((s) => s.value === form.fundSource);
  const activity = ACTIVITIES.find((a) => a.value === form.activity);
  const volume = MONTHLY_VOLUME.find((v) => v.value === form.volume);

  if (form.pep) {
    score += 50;
    reasons.push("Persona expuesta políticamente (PEP)");
  }
  if (source && source.points > 0) {
    score += source.points;
    reasons.push(`Origen de fondos: ${source.label.toLowerCase()}`);
  }
  if (activity && activity.points > 0) {
    score += activity.points;
    reasons.push(`Actividad: ${activity.label.toLowerCase()}`);
  }
  if (volume && volume.points > 0) {
    score += volume.points;
    reasons.push(`Volumen mensual: ${volume.label.toLowerCase()}`);
  }

  const esgReview = Boolean(activity?.esg);
  if (esgReview) reasons.push("Revisión ESG por sector sensible");

  const level: RiskLevel = score >= 50 ? "alto" : score >= 25 ? "medio" : "bajo";
  const diligence: DueDiligence =
    level === "alto" ? "reforzada" : level === "medio" ? "estándar" : "simplificada";

  return { score, level, diligence, esgReview, reasons, autoIssue: level !== "alto" };
}

export type KycErrors = Partial<Record<keyof KycForm, string>>;

export function validateIdentity(form: KycForm, isValidRut: (value: string) => boolean): KycErrors {
  const errors: KycErrors = {};
  if (form.fullName.trim().split(/\s+/).length < 2) {
    errors.fullName = "Ingresa nombre y apellido como figuran en tu cédula.";
  }
  if (!isValidRut(form.rut)) errors.rut = "RUT inválido. Revisa el dígito verificador.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Correo electrónico inválido.";
  }
  const born = new Date(form.birthDate);
  if (!form.birthDate || Number.isNaN(born.getTime())) {
    errors.birthDate = "Indica tu fecha de nacimiento.";
  } else {
    const adult = new Date(born);
    adult.setFullYear(adult.getFullYear() + 18);
    if (adult > new Date()) errors.birthDate = "Debes ser mayor de 18 años.";
  }
  return errors;
}

export function validateProfile(form: KycForm): KycErrors {
  const errors: KycErrors = {};
  if (!form.fundSource) errors.fundSource = "Selecciona el origen de tus fondos.";
  if (!form.activity) errors.activity = "Selecciona tu actividad.";
  if (!form.volume) errors.volume = "Selecciona el volumen estimado.";
  return errors;
}

function luhnCheckDigit(partial: string) {
  let sum = 0;
  for (let i = partial.length - 1, double = true; i >= 0; i -= 1, double = !double) {
    let d = Number(partial[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

function randomDigits(n: number) {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => String(b % 10)).join("");
}

export type IssuedCard = {
  pan: string;
  expiry: string;
  cvc: string;
  holder: string;
  issuedAt: string;
  wallets: WalletKind[];
  /** Accesorios pedidos junto con la tarjeta (opcional en estados guardados antiguos). */
  accessories?: AccessoryKind[];
};

export type WalletKind = "apple" | "google";

export type AccessoryKind = "tarjetero" | "llavero" | "charm" | "sticker";

export const ACCESSORIES: { kind: AccessoryKind; name: string; detail: string }[] = [
  {
    kind: "tarjetero",
    name: "Tarjetero rosa",
    detail: "Funda mate para llevar la tarjeta en la cartera.",
  },
  {
    kind: "llavero",
    name: "Llavero de pago",
    detail: "Paga acercando tu llavero, sin sacar la tarjeta.",
  },
  {
    kind: "charm",
    name: "Charm para cartera",
    detail: "Colgante con el isotipo 3/ y perlas de la marca.",
  },
  {
    kind: "sticker",
    name: "Sticker de pago",
    detail: "Adhesivo sin contacto para la funda del teléfono.",
  },
];

/** Número de demostración: prefijo 9900 (sin red de pago) + dígito Luhn. */
export function issueCard(holder: string): IssuedCard {
  const body = `9900${randomDigits(11)}`;
  const pan = body + luhnCheckDigit(body);
  const exp = new Date();
  exp.setFullYear(exp.getFullYear() + 3);
  const expiry = `${String(exp.getMonth() + 1).padStart(2, "0")}/${String(exp.getFullYear()).slice(-2)}`;
  return {
    pan,
    expiry,
    cvc: randomDigits(3),
    holder: holder.trim().replace(/\s+/g, " "),
    issuedAt: new Date().toISOString(),
    wallets: [],
  };
}

export function groupPan(pan: string) {
  return pan.replace(/(.{4})/g, "$1 ").trim();
}

const STORAGE_KEY = "pr.tarjeta.demo.v1";

export type StoredCardState = { card: IssuedCard; level: RiskLevel };

export function loadCardState(): StoredCardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCardState) : null;
  } catch {
    return null;
  }
}

export function saveCardState(state: StoredCardState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* almacenamiento no disponible: la demo sigue en memoria */
  }
}
