import {
  Cpu,
  Ellipsis,
  HardHat,
  Package,
  Store,
  Truck,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  ACTIVITY_OPTIONS,
  CHANNEL_OPTIONS,
  INTEREST_OPTIONS,
} from "../../modules/identity/questions";
import type { JourneyPath, JourneyProfile } from "../../modules/journey-engine/types";
import { GuideBubble } from "../experience/GuideBubble";
import { BackButton, NextButton, ScenePanel } from "../experience/ScenePanel";

const ACTIVITY_ICON: Record<string, LucideIcon> = {
  restaurante: Utensils,
  comercio: Store,
  servicios: Wrench,
  proveedor: Package,
  tecnologia: Cpu,
  construccion: HardHat,
  transporte: Truck,
  otra: Ellipsis,
};

type Props = {
  path: JourneyPath;
  profile: JourneyProfile;
  ready: boolean;
  onChange: (profile: Partial<JourneyProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  onFillFictional?: () => void;
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Escena 4 — "Tu mundo": la empresa construye su negocio; la persona elige intereses. */
export function WorldBuilder({
  path,
  profile,
  ready,
  onChange,
  onNext,
  onBack,
  onFillFictional,
}: Props) {
  const footer = (
    <>
      <BackButton onClick={onBack} />
      <NextButton onClick={onNext} disabled={!ready} />
    </>
  );

  if (path === "person") {
    return (
      <ScenePanel scene="world" title="¿Qué te interesa?" footer={footer}>
        <div className="jy-tiles" role="group" aria-label="Intereses">
          {INTEREST_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className="jy-tile"
              aria-pressed={profile.interests.includes(o.value)}
              onClick={() => onChange({ interests: toggle(profile.interests, o.value) })}
            >
              {o.label}
            </button>
          ))}
        </div>
        <GuideBubble path="person">
          {profile.interests.length
            ? "¡Genial! Así te mostraremos beneficios que te importan."
            : "Elige uno o más. Puedes cambiarlos cuando quieras."}
        </GuideBubble>
        {onFillFictional ? <FictionalLink onClick={onFillFictional} /> : null}
      </ScenePanel>
    );
  }

  return (
    <ScenePanel scene="world" title="¿A qué te dedicas?" footer={footer}>
      <div className="jy-tiles jy-tiles-icons" role="radiogroup" aria-label="Actividad principal">
        {ACTIVITY_OPTIONS.map((o) => {
          const Icon = ACTIVITY_ICON[o.value] ?? Ellipsis;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              className="jy-tile"
              aria-checked={profile.activity === o.value}
              onClick={() => onChange({ activity: o.value })}
            >
              <Icon className="jy-tile-icon" aria-hidden="true" />
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="jy-field">
        <label htmlFor="jy-brand" className="jy-label">
          Nombre de tu marca
        </label>
        <input
          id="jy-brand"
          className="jy-input"
          placeholder="Ej. El Faro"
          value={profile.brand}
          onChange={(e) => onChange({ brand: e.target.value })}
        />
        <small className="jy-help">
          Una empresa tiene una sola cuenta, aunque tenga varias marcas.
        </small>
      </div>

      <div className="jy-field">
        <span className="jy-label">Canales</span>
        <div className="jy-chips" role="group" aria-label="Canales">
          {CHANNEL_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              className="jy-chip-toggle"
              aria-pressed={profile.channels.includes(c.value)}
              onClick={() => onChange({ channels: toggle(profile.channels, c.value) })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="jy-field jy-field-row">
        <span className="jy-label" id="jy-branches-label">
          Sucursales adicionales
        </span>
        <div className="jy-stepper" role="group" aria-labelledby="jy-branches-label">
          <button
            type="button"
            aria-label="Quitar sucursal"
            disabled={profile.branches <= 0}
            onClick={() => onChange({ branches: profile.branches - 1 })}
          >
            −
          </button>
          <output aria-live="polite">{profile.branches}</output>
          <button
            type="button"
            aria-label="Agregar sucursal"
            disabled={profile.branches >= 50}
            onClick={() => onChange({ branches: profile.branches + 1 })}
          >
            +
          </button>
        </div>
      </div>

      <GuideBubble path="company">
        {profile.activity
          ? "¡Perfecto! Sigamos construyendo tu negocio."
          : "Elige tu actividad principal."}
      </GuideBubble>
      {onFillFictional ? <FictionalLink onClick={onFillFictional} /> : null}
    </ScenePanel>
  );
}

function FictionalLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="jy-link" onClick={onClick}>
      Completar con datos ficticios <span className="jy-badge">Simulado</span>
    </button>
  );
}
