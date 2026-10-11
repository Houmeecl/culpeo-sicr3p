export type JourneyMode = "event" | "real";

export type JourneyPath = "company" | "person";

export type SceneId =
  | "cover"
  | "path"
  | "identity"
  | "business"
  | "pos"
  | "network"
  | "development"
  | "loyalty"
  | "merch"
  | "review"
  | "activation"
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
  autoComplete?: string;
  required: boolean;
};

export type SceneDef = {
  id: SceneId;
  title: string;
  /** Escenas implementadas en esta fase del prototipo. */
  available: boolean;
  /** Si sólo aplica a un camino. */
  onlyFor?: JourneyPath;
};

export type JourneyState = {
  mode: JourneyMode;
  path: JourneyPath | null;
  scene: SceneId;
  questionIndex: number;
  answers: Record<string, string>;
  completed: SceneId[];
  status: ApplicationStatus;
  startedAt: string | null;
  updatedAt: string | null;
};
