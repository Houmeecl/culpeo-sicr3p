import { useState } from "react";
import type { JourneyPath } from "../../modules/journey-engine/types";
import { GuideBubble } from "./GuideBubble";
import { BackButton, NextButton, ScenePanel } from "./ScenePanel";

/** Nodos de la red y lo que se puede hacer con cada uno (sin párrafos largos). */
const NODES = [
  {
    id: "proveedores",
    label: "Proveedores",
    x: 18,
    y: 26,
    verb: "Comprar",
    line: "Compra a proveedores de la red.",
  },
  {
    id: "mandantes",
    label: "Empresas mandantes",
    x: 82,
    y: 22,
    verb: "Vender",
    line: "Vende a empresas que contratan en el territorio.",
  },
  {
    id: "clientes",
    label: "Clientes",
    x: 88,
    y: 62,
    verb: "Entregar beneficios",
    line: "Premia a tus clientes con la tarjeta SICR3P/.",
  },
  {
    id: "oportunidades",
    label: "Oportunidades B2B",
    x: 70,
    y: 88,
    verb: "Acceder a oportunidades",
    line: "Encuentra licitaciones y encadenamientos.",
  },
  {
    id: "servicios",
    label: "Servicios",
    x: 22,
    y: 82,
    verb: "Encontrar soluciones",
    line: "Conecta con aliados que resuelven lo operativo.",
  },
  {
    id: "colaborar",
    label: "Otras empresas",
    x: 8,
    y: 54,
    verb: "Colaborar",
    line: "Colabora con empresas cercanas.",
  },
];

/** Ejemplo de encadenamiento: restaurante → proveedor → transporte → mandante → programa. */
const CHAIN = [
  "Restaurante",
  "Proveedor de alimentos",
  "Transporte",
  "Empresa mandante",
  "Programa de desarrollo",
];

export function Network({
  path,
  onNext,
  onBack,
}: {
  path: JourneyPath;
  onNext: () => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const node = NODES.find((n) => n.id === selected);
  return (
    <ScenePanel
      scene="network"
      title={
        path === "company" ? "Una red que impulsa tu negocio" : "Una red que te acerca beneficios"
      }
      footer={
        <>
          <BackButton onClick={onBack} />
          <NextButton onClick={onNext} />
        </>
      }
    >
      <div className="jy-net">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {NODES.map((n) => (
            <line
              key={n.id}
              x1="50"
              y1="54"
              x2={n.x}
              y2={n.y}
              className="jy-net-line"
              data-active={selected === n.id}
            />
          ))}
        </svg>
        <span className="jy-net-hub">
          sicr<span className="jy-accent">3</span>p/
        </span>
        {NODES.map((n) => (
          <button
            key={n.id}
            type="button"
            className="jy-net-node"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            aria-pressed={selected === n.id}
            onClick={() => setSelected(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>

      <div className="jy-net-detail" aria-live="polite">
        {node ? (
          <>
            <strong>{node.verb}</strong>
            <span>{node.line}</span>
          </>
        ) : (
          <span>Toca un punto de la red para acercarte.</span>
        )}
      </div>

      <ol className="jy-chain" aria-label="Ejemplo de encadenamiento">
        {CHAIN.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>

      <GuideBubble path={path}>
        SICR3P/ articula y conecta: cada empresa aporta y recibe.
      </GuideBubble>
    </ScenePanel>
  );
}
