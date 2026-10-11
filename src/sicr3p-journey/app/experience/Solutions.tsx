import type { JourneyPath } from "../../modules/journey-engine/types";
import { BackButton, NextButton, ScenePanel } from "./ScenePanel";
import { SOLUTIONS } from "./solutions-data";

/** Escena 7 — Soluciones: el usuario marca lo que le interesa (servicios solicitados). */
export function Solutions({
  path,
  selected,
  onChange,
  onNext,
  onBack,
}: {
  path: JourneyPath;
  selected: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <ScenePanel
      scene="solutions"
      title="Un ecosistema para seguir creciendo"
      footer={
        <>
          <BackButton onClick={onBack} />
          <NextButton onClick={onNext} />
        </>
      }
    >
      <ul className="jy-solutions">
        {SOLUTIONS.map(({ id, title, line, icon: Icon }) => {
          const on = selected.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                className="jy-solution"
                aria-pressed={on}
                onClick={() => onChange(on ? selected.filter((s) => s !== id) : [...selected, id])}
              >
                <span className="jy-solution-icon" data-id={id}>
                  <Icon aria-hidden="true" />
                </span>
                <span className="jy-solution-text">
                  <strong>{title}</strong>
                  <small>{line}</small>
                </span>
                <span className="jy-solution-check">{on ? "Me interesa ✓" : "Me interesa"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="jy-note">
        SICR3P/ articula y conecta. Las soluciones las entregan aliados especializados
        {path === "person" ? "; algunas aplican sólo a empresas." : "."}
      </p>
    </ScenePanel>
  );
}
