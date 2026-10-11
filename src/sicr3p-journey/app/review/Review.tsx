import { CheckCircle2, Circle } from "lucide-react";
import {
  ACTIVITY_OPTIONS,
  CHANNEL_OPTIONS,
  INTEREST_OPTIONS,
} from "../../modules/identity/questions";
import type {
  JourneyPath,
  JourneyProfile,
  KycSnapshot,
  SceneId,
} from "../../modules/journey-engine/types";
import { BackButton, NextButton, ScenePanel } from "../experience/ScenePanel";
import { SOLUTIONS } from "../experience/solutions-data";

const label = (list: { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

type Block = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
  edit?: SceneId;
  tag?: string;
};

/** Escena 9 — Revisión: identidad construida, editable por bloques antes de continuar. */
export function Review({
  path,
  answers,
  profile,
  kyc,
  pending,
  confirmed,
  onConfirm,
  onEdit,
  onNext,
  onBack,
}: {
  path: JourneyPath;
  answers: Record<string, string>;
  profile: JourneyProfile;
  kyc: KycSnapshot | null;
  pending: string[];
  confirmed: boolean;
  onConfirm: (value: boolean) => void;
  onEdit: (scene: SceneId) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const solutions = profile.solutions
    .map((id) => SOLUTIONS.find((s) => s.id === id)?.title ?? id)
    .join(", ");

  const blocks: Block[] =
    path === "company"
      ? [
          {
            id: "empresa",
            title: "Empresa y representante",
            detail: [answers.companyName, answers.taxId, answers.representative]
              .filter(Boolean)
              .join(" · "),
            done: Boolean(answers.companyName),
            edit: "identity",
          },
          {
            id: "contacto",
            title: "Contacto",
            detail: [answers.email, answers.phone].filter(Boolean).join(" · ") || "—",
            done: Boolean(answers.email),
            edit: "identity",
          },
          {
            id: "mundo",
            title: "Actividad, marca, locales y canales",
            detail: [
              profile.activity ? label(ACTIVITY_OPTIONS, profile.activity) : "Sin actividad",
              profile.brand || "Sin marca",
              `${1 + profile.branches} local(es)`,
              profile.channels.map((c) => label(CHANNEL_OPTIONS, c)).join(", ") || "Sin canales",
            ].join(" · "),
            done: Boolean(profile.activity && profile.brand),
            edit: "world",
          },
          {
            id: "servicios",
            title: "Servicios solicitados",
            detail: solutions || "Ninguno por ahora",
            done: true,
            edit: "solutions",
          },
        ]
      : [
          {
            id: "identidad",
            title: "Datos personales",
            detail: [answers.fullName, answers.location].filter(Boolean).join(" · ") || "—",
            done: Boolean(answers.fullName),
            edit: "identity",
          },
          {
            id: "contacto",
            title: "Contacto",
            detail: [answers.email, answers.phone].filter(Boolean).join(" · ") || "—",
            done: Boolean(answers.email),
            edit: "identity",
          },
          {
            id: "intereses",
            title: "Intereses",
            detail: profile.interests.map((i) => label(INTEREST_OPTIONS, i)).join(", ") || "—",
            done: profile.interests.length > 0,
            edit: "world",
          },
        ];

  blocks.push(
    {
      id: "kyc",
      title: "Identidad (verificación)",
      detail: kycText(kyc),
      done: kyc?.status === "submitted",
      tag: kyc?.simulated ? "Simulado" : undefined,
    },
    {
      id: "consent",
      title: "Consentimientos",
      detail: answers.consent === "yes" ? "Aceptado" : "Pendiente",
      done: answers.consent === "yes",
      edit: "identity",
    },
  );

  return (
    <ScenePanel
      scene="review"
      title="Revisa tu información"
      footer={
        <>
          <BackButton onClick={onBack} />
          <NextButton onClick={onNext} disabled={!confirmed}>
            Continuar
          </NextButton>
        </>
      }
    >
      <ul className="jy-review">
        {blocks.map((b) => (
          <li key={b.id}>
            {b.done ? (
              <CheckCircle2 className="jy-review-ok" aria-label="Completo" />
            ) : (
              <Circle className="jy-review-todo" aria-label="Pendiente" />
            )}
            <span className="jy-review-text">
              <strong>
                {b.title} {b.tag ? <span className="jy-badge">{b.tag}</span> : null}
              </strong>
              <small>{b.detail}</small>
            </span>
            {b.edit ? (
              <button type="button" className="jy-review-edit" onClick={() => onEdit(b.edit!)}>
                Editar
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {pending.length ? (
        <p className="jy-kyc" data-state="pending" role="status">
          Datos pendientes: {pending.join(", ")}. Puedes continuar y completarlos después.
        </p>
      ) : null}

      <label className="jy-consent jy-consent-compact">
        <input type="checkbox" checked={confirmed} onChange={(e) => onConfirm(e.target.checked)} />
        <span>Confirmo que toda la información es correcta.</span>
      </label>
    </ScenePanel>
  );
}

function kycText(kyc: KycSnapshot | null) {
  if (!kyc) return "Enviando a verificación…";
  switch (kyc.status) {
    case "submitted":
      return kyc.simulated
        ? "Enviada"
        : `Enviada a ${kyc.provider}${kyc.reference ? ` · ref. ${kyc.reference}` : ""}`;
    case "pending_data":
      return `${kyc.provider} necesita: ${kyc.missing.join(", ")}`;
    case "not_configured":
      return "Proveedor de verificación aún no conectado";
    default:
      return `No disponible ahora (${kyc.missing.join(", ")})`;
  }
}
