import type { SceneDef, SceneId } from "../../modules/journey-engine/types";

export type A11yPrefs = { force2D: boolean; reduceMotion: boolean; largeText: boolean };

type MapItem = SceneDef & { done: boolean; current: boolean };

type Props = {
  started: boolean;
  statusLabel: string;
  eventMode: boolean;
  paused: boolean;
  panel: "map" | "a11y" | null;
  map: MapItem[];
  prefs: A11yPrefs;
  webgl: boolean | null;
  onPanel: (panel: "map" | "a11y" | null) => void;
  onPause: () => void;
  onRestart: () => void;
  onGoTo: (scene: SceneId) => void;
  onPrefs: (prefs: A11yPrefs) => void;
};

export function Hud(props: Props) {
  const { started, statusLabel, eventMode, paused, panel, map, prefs, webgl } = props;
  return (
    <>
      <header className="jy-hud">
        <div className="jy-hud-brand">
          <span className="jy-hud-mark">
            sicr<span className="jy-accent">3</span>p<span className="jy-accent">/</span>
          </span>
          <span className="jy-hud-name">Journey</span>
          {eventMode ? <span className="jy-badge">Modo evento</span> : null}
        </div>
        {started ? <span className="jy-chip jy-hud-status">{statusLabel}</span> : null}
        <nav className="jy-hud-actions" aria-label="Controles del recorrido">
          <button
            type="button"
            className="jy-icon-btn"
            aria-expanded={panel === "map"}
            onClick={() => props.onPanel(panel === "map" ? null : "map")}
          >
            <span aria-hidden="true">◎</span>
            <span className="jy-icon-label">Mapa</span>
          </button>
          <button
            type="button"
            className="jy-icon-btn"
            aria-expanded={panel === "a11y"}
            onClick={() => props.onPanel(panel === "a11y" ? null : "a11y")}
          >
            <span aria-hidden="true">Aa</span>
            <span className="jy-icon-label">Accesibilidad</span>
          </button>
          <button
            type="button"
            className="jy-icon-btn"
            aria-pressed={paused}
            onClick={props.onPause}
          >
            <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
            <span className="jy-icon-label">{paused ? "Seguir" : "Pausa"}</span>
          </button>
          {eventMode && started ? (
            <button type="button" className="jy-icon-btn" onClick={props.onRestart}>
              <span aria-hidden="true">↺</span>
              <span className="jy-icon-label">Reiniciar</span>
            </button>
          ) : null}
        </nav>
      </header>

      {panel === "map" ? (
        <aside className="jy-drawer" aria-label="Mapa del recorrido">
          <h2 className="jy-drawer-title">Mapa del recorrido</h2>
          <ol className="jy-map">
            {map.map((s) => {
              const reachable = s.available && (s.done || s.current || s.id === "cover");
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className="jy-map-item"
                    data-state={s.current ? "current" : s.done ? "done" : "todo"}
                    disabled={!reachable}
                    onClick={() => props.onGoTo(s.id)}
                  >
                    <span className="jy-map-dot" aria-hidden="true" />
                    <span>{s.title}</span>
                    {!s.available ? <span className="jy-soon">Próximamente</span> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      ) : null}

      {panel === "a11y" ? (
        <aside className="jy-drawer" aria-label="Accesibilidad">
          <h2 className="jy-drawer-title">Accesibilidad</h2>
          <Toggle
            label="Vista 2D"
            hint={webgl === false ? "Tu dispositivo usa la vista 2D." : "Más liviana, sin 3D."}
            checked={prefs.force2D || webgl === false}
            disabled={webgl === false}
            onChange={(v) => props.onPrefs({ ...prefs, force2D: v })}
          />
          <Toggle
            label="Reducir movimiento"
            hint="Sin desplazamientos de cámara ni rebotes."
            checked={prefs.reduceMotion}
            onChange={(v) => props.onPrefs({ ...prefs, reduceMotion: v })}
          />
          <Toggle
            label="Texto grande"
            hint="Aumenta el tamaño de los textos."
            checked={prefs.largeText}
            onChange={(v) => props.onPrefs({ ...prefs, largeText: v })}
          />
          <p className="jy-note">
            Teclado: Enter continúa · Esc retrocede o cierra · Tab recorre los controles.
          </p>
        </aside>
      ) : null}
    </>
  );
}

function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="jy-toggle" data-disabled={disabled}>
      <span>
        <span className="jy-toggle-label">{label}</span>
        <small>{hint}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
