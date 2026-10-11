import type { ReactNode } from "react";
import { SCENES, sceneNumber } from "../../modules/journey-engine/steps";
import type { SceneId } from "../../modules/journey-engine/types";

/** Contenedor común de cada estación: "4. TU MUNDO" + contenido + acciones. */
export function ScenePanel({
  scene,
  title,
  children,
  footer,
  wide,
}: {
  scene: SceneId;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const def = SCENES.find((s) => s.id === scene);
  const headingId = `jy-scene-${scene}`;
  return (
    <section className="jy-panel" data-wide={wide} aria-labelledby={headingId}>
      <StepKicker scene={scene} />
      {title ? (
        <h2 id={headingId} className="jy-panel-title">
          {title}
        </h2>
      ) : (
        <h2 id={headingId} className="jy-sr">
          {def?.title}
        </h2>
      )}
      {children}
      {footer ? <div className="jy-actions">{footer}</div> : null}
    </section>
  );
}

export function NextButton({
  onClick,
  disabled,
  children = "Siguiente",
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className="jy-btn jy-btn-primary" onClick={onClick} disabled={disabled}>
      {children}
      <span className="jy-btn-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="jy-btn jy-btn-ghost" onClick={onClick}>
      ← Atrás
    </button>
  );
}

/** "5. EL POS" + arco de progreso "5/11": dónde estoy y cuánto falta, de un vistazo. */
export function StepKicker({ scene }: { scene: SceneId }) {
  const n = sceneNumber(scene);
  const total = SCENES.length;
  const def = SCENES.find((s) => s.id === scene);
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="jy-kicker-row">
      <p className="jy-kicker">
        {n}. {def?.title}
      </p>
      <span className="jy-step" aria-label={`Paso ${n} de ${total}`}>
        <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
          <circle cx="18" cy="18" r={r} className="jy-step-track" />
          <circle
            cx="18"
            cy="18"
            r={r}
            className="jy-step-fill"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - n / total)}
          />
        </svg>
        <span>
          {n}/{total}
        </span>
      </span>
    </div>
  );
}
