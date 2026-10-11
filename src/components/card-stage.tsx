import { useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";

/**
 * Escena 3D en CSS detrás de la tarjeta: piso en perspectiva y las formas
 * gráficas de sicr3p/ (barra violeta, esfera verde, barra azul) flotando a
 * distintas profundidades, con parallax según el puntero.
 */
export function CardStage({ children }: { children: ReactNode }) {
  const [p, setP] = useState({ x: 0, y: 0 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    setP({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  }

  const vars = { "--px": p.x.toFixed(3), "--py": p.y.toFixed(3) } as CSSProperties;

  return (
    <div
      className="stage3d"
      style={vars}
      onPointerMove={onMove}
      onPointerLeave={() => setP({ x: 0, y: 0 })}
    >
      <div className="stage3d-world" aria-hidden="true">
        <div className="stage3d-floor" />
        <div className="stage3d-glow" />
        <div className="stage3d-shape stage3d-slash stage3d-slash--violet" data-depth="3">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="stage3d-shape stage3d-sphere" data-depth="2" />
        <div className="stage3d-shape stage3d-slash stage3d-slash--blue" data-depth="1">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="stage3d-shape stage3d-sphere stage3d-sphere--small" data-depth="4" />
        <div className="stage3d-shape stage3d-ring" data-depth="1" />
      </div>
      <div className="stage3d-content">
        {children}
        <div className="stage3d-shadow" aria-hidden="true" />
      </div>
    </div>
  );
}
