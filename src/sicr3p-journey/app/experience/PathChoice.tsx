import type { JourneyPath } from "../../modules/journey-engine/types";
import { GuideAvatar } from "../../world/scenes/World2D";

const OPTIONS: { path: JourneyPath; title: string; guide: string; line: string }[] = [
  {
    path: "person",
    title: "Soy persona",
    guide: "Te guía la chancha rosa",
    line: "Conecta, participa y accede a beneficios.",
  },
  {
    path: "company",
    title: "Soy empresa",
    guide: "Te guía Culpeo",
    line: "Desarrolla tu negocio y accede a oportunidades.",
  },
];

export function PathChoice({
  selected,
  onChoose,
  onBack,
}: {
  selected: JourneyPath | null;
  onChoose: (path: JourneyPath) => void;
  onBack: () => void;
}) {
  return (
    <section className="jy-panel" aria-labelledby="jy-path-title">
      <p className="jy-kicker">2. Elige tu camino</p>
      <h2 id="jy-path-title" className="jy-panel-title">
        ¿Cómo quieres entrar a SICR3P/?
      </h2>
      <div className="jy-choice-grid">
        {OPTIONS.map((o, i) => (
          <button
            key={o.path}
            type="button"
            className="jy-choice"
            data-selected={selected === o.path}
            onClick={() => onChoose(o.path)}
            autoFocus={i === 0}
          >
            <span className="jy-choice-avatar" data-path={o.path}>
              <GuideAvatar path={o.path} size={56} />
            </span>
            <span className="jy-choice-title">{o.title}</span>
            <span className="jy-choice-line">{o.line}</span>
            <span className="jy-choice-sub">{o.guide}</span>
          </button>
        ))}
      </div>
      <p className="jy-note">Misma red. Diferentes caminos. Sin niveles.</p>
      <div className="jy-actions">
        <button type="button" className="jy-btn jy-btn-ghost" onClick={onBack}>
          ← Atrás
        </button>
      </div>
    </section>
  );
}
