import { useState, type PointerEvent } from "react";
import { Gift, Heart, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import type { JourneyPath } from "../../modules/journey-engine/types";
import { GuideAvatar } from "../../world/scenes/World2D";
import { BackButton, NextButton, ScenePanel } from "./ScenePanel";

/** Vitrina de merchandising: se obtiene de varias formas, nunca es un "nivel". */
const MERCH = [
  { title: "Figura coleccionable de Culpeo", how: "Compra o canje" },
  { title: "Figura de la chancha rosa", how: "Compra o canje" },
  { title: "Llavero SICR3P/", how: "Canje con puntos" },
  { title: "Tarjeta física", how: "Por hito" },
  { title: "Stickers", how: "Se otorgan en eventos" },
  { title: "Edición Antofagasta", how: "Edición de evento" },
];

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "beneficios", label: "Beneficios", icon: Gift },
  { id: "merch", label: "Merchandising", icon: ShoppingBag },
  { id: "experiencias", label: "Experiencias", icon: Heart },
  { id: "comunidad", label: "Comunidad", icon: Users },
];

export function LoyaltyCard({
  path,
  name,
  publicId,
  points,
  validation,
  onNext,
  onBack,
}: {
  path: JourneyPath;
  name: string;
  publicId: string;
  points: number;
  validation: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState<string | null>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -14,
      y: ((e.clientX - r.left) / r.width - 0.5) * 18,
    });
  }

  return (
    <ScenePanel
      scene="card"
      title="Tu tarjeta SICR3P/"
      footer={
        <>
          <BackButton onClick={onBack} />
          <NextButton onClick={onNext} />
        </>
      }
    >
      <div
        className="jy-card-stage"
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div
          className="jy-loyalty"
          style={{ transform: `rotateX(${tilt.x.toFixed(1)}deg) rotateY(${tilt.y.toFixed(1)}deg)` }}
        >
          <div className="jy-loyalty-top">
            <span className="jy-loyalty-avatar">
              <GuideAvatar path={path} size={44} />
            </span>
            <span className="jy-loyalty-mark">sicr3p/</span>
          </div>
          <div className="jy-loyalty-name">{name || "Tu nombre"}</div>
          <div className="jy-loyalty-sub">
            {path === "company" ? "Cuenta Empresa" : "Cuenta Persona"} · Miembro de la red SICR3P/
          </div>
          <div className="jy-loyalty-bottom">
            <span className="jy-loyalty-points">
              {points.toLocaleString("es-CL")} <small>puntos</small>
            </span>
            <span className="jy-loyalty-id">{publicId}</span>
          </div>
        </div>
      </div>
      <p className="jy-note">
        Tarjeta de fidelización y pertenencia: no es una tarjeta bancaria. Validación: {validation}.
      </p>

      <div className="jy-card-tabs" role="tablist" aria-label="Tu tarjeta">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className="jy-card-tab"
            onClick={() => setTab(tab === id ? null : id)}
          >
            <span className="jy-card-tab-icon">
              <Icon aria-hidden="true" />
            </span>
            {label}
          </button>
        ))}
      </div>

      {tab === "merch" ? (
        <ul className="jy-merch" role="tabpanel">
          {MERCH.map((m) => (
            <li key={m.title}>
              <strong>{m.title}</strong>
              <small>{m.how}</small>
            </li>
          ))}
        </ul>
      ) : tab ? (
        <p className="jy-note" role="tabpanel">
          Próximamente: {TABS.find((t) => t.id === tab)?.label.toLowerCase()} con comercios y
          aliados de la red.
        </p>
      ) : null}
    </ScenePanel>
  );
}
