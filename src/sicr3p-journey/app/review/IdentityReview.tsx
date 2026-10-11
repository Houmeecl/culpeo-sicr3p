import { ACTIVITY_OPTIONS } from "../../modules/identity/questions";
import type {
  JourneyPath,
  KycSnapshot,
  Question,
  SceneDef,
} from "../../modules/journey-engine/types";
import { GuideBubble } from "../experience/GuideBubble";
import { PathTrail } from "../experience/PathTrail";

const SHORT_LABEL: Record<string, string> = {
  fullName: "Nombre",
  email: "Correo",
  phone: "Teléfono",
  location: "Participas desde",
  consent: "Consentimiento",
  complianceDeclaration: "Actividad permitida",
  companyName: "Empresa",
  taxId: "RUT",
  representative: "Representante",
  activity: "Actividad",
};

function display(q: Question, value: string | undefined) {
  if (q.kind === "consent") return value === "yes" ? "Aceptado" : "Pendiente";
  if (q.id === "activity") return ACTIVITY_OPTIONS.find((o) => o.value === value)?.label ?? "—";
  return value || "—";
}

/** Revisión de la identidad construida + resultado de la verificación. */
export function IdentityReview({
  path,
  questions,
  answers,
  statusLabel,
  kyc,
  next,
  eventMode,
  onEdit,
  onRestart,
}: {
  path: JourneyPath;
  questions: Question[];
  answers: Record<string, string>;
  statusLabel: string;
  kyc: KycSnapshot | null;
  next: SceneDef | null;
  eventMode: boolean;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const firstName = (answers.fullName ?? answers.representative ?? "").split(" ")[0];
  return (
    <section className="jy-panel" aria-labelledby="jy-done-title">
      <PathTrail done={questions.length} total={questions.length} label="Identidad" />
      <GuideBubble path={path}>
        {path === "company"
          ? `¡Listo${firstName ? `, ${firstName}` : ""}! Ya conozco a tu empresa.`
          : `¡Gracias${firstName ? `, ${firstName}` : ""}! Ya te conozco un poco más.`}
      </GuideBubble>

      <h2 id="jy-done-title" className="jy-sr">
        Identidad completa
      </h2>
      <dl className="jy-summary">
        {questions.map((q) => (
          <div key={q.id}>
            <dt>{SHORT_LABEL[q.id] ?? q.id}</dt>
            <dd>{display(q, answers[q.id])}</dd>
          </div>
        ))}
      </dl>

      <div className="jy-status-row">
        <span className="jy-chip">Estado: {statusLabel}</span>
      </div>
      <KycNotice kyc={kyc} />

      {next ? (
        <div className="jy-next">
          <span className="jy-next-kicker">Próxima estación</span>
          <span className="jy-next-title">{next.title}</span>
          <span className="jy-next-soon">Próximamente en este prototipo</span>
        </div>
      ) : null}

      <div className="jy-actions">
        <button type="button" className="jy-btn jy-btn-ghost" onClick={onEdit}>
          Editar respuestas
        </button>
        {eventMode ? (
          <button type="button" className="jy-btn jy-btn-primary" onClick={onRestart}>
            Terminar y reiniciar
          </button>
        ) : null}
      </div>
    </section>
  );
}

function KycNotice({ kyc }: { kyc: KycSnapshot | null }) {
  if (!kyc) {
    return (
      <p className="jy-kyc" data-state="loading" role="status">
        Enviando a verificación…
      </p>
    );
  }
  const tag = kyc.simulated ? <span className="jy-badge">Simulado</span> : null;
  if (kyc.status === "submitted") {
    return (
      <p className="jy-kyc" data-state="ok" role="status">
        {kyc.simulated ? "Verificación enviada" : `Verificación enviada a ${kyc.provider}`}
        {kyc.reference ? ` · ref. ${kyc.reference}` : ""} {tag}
      </p>
    );
  }
  if (kyc.status === "pending_data") {
    return (
      <div className="jy-kyc" data-state="pending" role="status">
        <span>{kyc.provider} necesita más datos. Los completarás en las próximas estaciones:</span>
        <ul>
          {kyc.missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (kyc.status === "not_configured") {
    return (
      <p className="jy-kyc" data-state="pending" role="status">
        {kyc.provider}: proveedor de verificación aún no conectado. Tu avance queda guardado.
      </p>
    );
  }
  return (
    <p className="jy-kyc" data-state="error" role="status">
      No pudimos verificar ahora ({kyc.missing.join(", ")}). Lo reintentaremos.
    </p>
  );
}
