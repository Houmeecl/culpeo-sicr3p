import type { JourneyPath, Question, SceneDef } from "../../engine/types";
import { ACTIVITY_OPTIONS } from "../../engine/steps";
import { GuideBubble } from "../GuideBubble";
import { PathTrail } from "../PathTrail";

const SHORT_LABEL: Record<string, string> = {
  fullName: "Nombre",
  email: "Correo",
  phone: "Teléfono",
  location: "Participas desde",
  consent: "Consentimiento",
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

export function NextStation({
  path,
  questions,
  answers,
  statusLabel,
  next,
  eventMode,
  onEdit,
  onRestart,
}: {
  path: JourneyPath;
  questions: Question[];
  answers: Record<string, string>;
  statusLabel: string;
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
        {eventMode ? <span className="jy-badge">Verificación simulada</span> : null}
      </div>

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
