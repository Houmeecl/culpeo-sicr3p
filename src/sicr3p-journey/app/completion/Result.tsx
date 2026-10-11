import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import QRCode from "qrcode";
import type { ApplicationStatus, JourneyPath } from "../../modules/journey-engine/types";
import { GuideAvatar } from "../../world/scenes/World2D";
import { NextButton, ScenePanel } from "../experience/ScenePanel";

/** Capacidades aún no habilitadas: se muestran como "Próximamente", sin inventar alcances. */
const COMING: Record<JourneyPath, string[]> = {
  company: ["POS con aliados", "Oportunidades B2B", "Beneficios para tus clientes"],
  person: ["Beneficios en comercios", "Canje de merchandising", "Experiencias y eventos"],
};

/** Escena 11 — Resultado. En modo evento ofrece continuar en el teléfono y reiniciar. */
export function Result({
  path,
  name,
  status,
  eventMode,
  onRestart,
}: {
  path: JourneyPath;
  name: string;
  status: ApplicationStatus;
  eventMode: boolean;
  onRestart: () => void;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const active = status === "account_active";

  useEffect(() => {
    if (!eventMode) return;
    // Enlace para continuar en el teléfono: no incluye datos personales.
    const url = `${window.location.origin}/journey?modo=real`;
    QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: "#111114", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [eventMode]);

  const firstName = name.split(" ")[0];
  const [title, subtitle] =
    path === "person"
      ? [
          "Tu tarjeta SICR3P/ está preparada.",
          `${firstName ? `${firstName}, p` : "P"}repárate: pronto tendrás más funcionalidades.`,
        ]
      : active
        ? [
            "¡Bienvenido a SICR3P/!",
            `${name || "Tu empresa"} ya forma parte de la red. Tu cuenta está activa.`,
          ]
        : [
            "Terminaste tu recorrido.",
            `${name || "Tu empresa"} está en revisión. Te avisaremos el resultado.`,
          ];

  return (
    <ScenePanel
      scene="result"
      footer={
        eventMode ? (
          <NextButton onClick={onRestart}>Terminar y reiniciar</NextButton>
        ) : (
          <NextButton disabled>
            {path === "person" ? "Explorar beneficios" : "Ir a mi cuenta"}
          </NextButton>
        )
      }
    >
      <div className="jy-result">
        <span className="jy-result-avatar" data-path={path}>
          <GuideAvatar path={path} size={84} />
          <span className="jy-result-check">
            <Check aria-hidden="true" />
          </span>
        </span>
        <h2 className="jy-panel-title">{title}</h2>
        <p className="jy-result-sub">{subtitle}</p>
        {eventMode && path === "company" ? (
          <span className="jy-badge">Aprobación simulada</span>
        ) : null}
      </div>

      <ul className="jy-coming">
        {COMING[path].map((c) => (
          <li key={c}>
            {c} <span className="jy-soon">Próximamente</span>
          </li>
        ))}
      </ul>

      {eventMode ? (
        <div className="jy-handoff">
          {qr ? (
            <img src={qr} alt="Código QR para continuar en tu teléfono" width={132} height={132} />
          ) : null}
          <span>
            <strong>Continúa desde tu teléfono.</strong>
            <small>Escanea el código. Este equipo borrará tus datos al reiniciar.</small>
          </span>
        </div>
      ) : null}

      <p className="jy-signoff">Misma comunidad. Más oportunidades.</p>
    </ScenePanel>
  );
}
