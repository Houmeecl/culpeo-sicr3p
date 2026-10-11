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
      <p className="jy-kicker">
        {sceneNumber(scene)}. {def?.title}
      </p>
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
