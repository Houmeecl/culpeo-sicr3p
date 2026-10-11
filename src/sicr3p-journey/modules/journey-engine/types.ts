export type JourneyMode = "event" | "real";

export type JourneyPath = "company" | "person";

export type SceneId =
  | "cover"
  | "path"
  | "identity"
  | "world"
  | "pos"
  | "network"
  | "solutions"
  | "card"
  | "review"
  | "payment"
  | "result";

export type ApplicationStatus =
  | "draft"
  | "journey_started"
  | "identity_incomplete"
  | "kyc_pending"
  | "kyc_submitted"
  | "payment_pending"
  | "payment_received"
  | "in_review"
  | "needs_documents"
  | "approved"
  | "rejected"
  | "account_active";

export type QuestionKind = "text" | "email" | "phone" | "taxId" | "choice" | "consent";

export type QuestionOption = { value: string; label: string };

export type Question = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  placeholder?: string;
  hint?: string;
  options?: QuestionOption[];
  /** Texto de la casilla en preguntas de aceptación (consentimiento, declaraciones). */
  label?: string;
  /** Enlace de referencia para leer antes de aceptar. */
  link?: { href: string; text: string };
  autoComplete?: string;
  required: boolean;
};

export type SceneDef = {
  id: SceneId;
  title: string;
  /** Bajada corta (mapa del recorrido). */
  subtitle: string;
  /** Escenas implementadas en esta fase del prototipo. */
  available: boolean;
};

/** Lo que el usuario construye después de la entrevista ("Tu mundo", soluciones). */
export type JourneyProfile = {
  /** Empresa: actividad principal. */
  activity: string;
  /** Empresa: nombre de marca (puede tener varias; el prototipo registra la principal). */
  brand: string;
  /** Empresa: canales (local físico, web, móvil). */
  channels: string[];
  /** Empresa: número de sucursales además del local principal. */
  branches: number;
  /** Persona: intereses de fidelización. */
  interests: string[];
  /** Soluciones de interés (servicios solicitados). */
  solutions: string[];
};

export type PaymentSnapshot = {
  status: "received" | "failed";
  method: "card" | "transfer";
  amountClp: number;
  provider: string;
  simulated: boolean;
};

export type KycSnapshot = {
  status: "submitted" | "pending_data" | "not_configured" | "failed";
  provider: string;
  simulated: boolean;
  /** Datos que el proveedor aún necesita (se completan en estaciones siguientes). */
  missing: string[];
  reference?: string;
};

export type JourneyState = {
  mode: JourneyMode;
  path: JourneyPath | null;
  scene: SceneId;
  questionIndex: number;
  answers: Record<string, string>;
  completed: SceneId[];
  status: ApplicationStatus;
  /** Identificador de la sesión del recorrido (se crea al comenzar). */
  sessionId: string | null;
  kyc: KycSnapshot | null;
  profile: JourneyProfile;
  /** Puntos de fidelización (en modo evento provienen de la demo POS simulada). */
  points: number;
  reviewConfirmed: boolean;
  payment: PaymentSnapshot | null;
  /** Al editar desde Revisión, volver ahí al terminar el bloque. */
  returnTo: SceneId | null;
  startedAt: string | null;
  updatedAt: string | null;
};
