import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { PosStation as PosPort } from "../../contracts/api/ports";
import type { JourneyPath } from "../../modules/journey-engine/types";
import { GuideBubble } from "./GuideBubble";
import { BackButton, NextButton, ScenePanel } from "./ScenePanel";

const PRODUCTS = [
  { id: "cafe", name: "Café de grano", amountClp: 2500 },
  { id: "almuerzo", name: "Almuerzo del día", amountClp: 12500 },
  { id: "llavero", name: "Llavero Culpeo", amountClp: 4990 },
];

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

type Phase = "pick" | "tap" | "processing" | "approved";

/**
 * Escena 5 — Estación POS [SIMULADO]. Explica el rol del POS (aliados
 * especializados) y permite una compra demostrativa con la tarjeta rosa.
 * Si el POS no está disponible, el recorrido continúa igual.
 */
export function PosStation({
  path,
  pos,
  onPoints,
  onNext,
  onBack,
}: {
  path: JourneyPath;
  pos: PosPort;
  onPoints: (points: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [points, setPoints] = useState(0);
  const product = PRODUCTS.find((p) => p.id === productId) ?? null;

  useEffect(() => {
    let alive = true;
    pos
      .isAvailable()
      .then((ok) => alive && setAvailable(ok))
      .catch(() => alive && setAvailable(false));
    return () => {
      alive = false;
    };
  }, [pos]);

  async function tap() {
    if (!product) return;
    setPhase("processing");
    try {
      const result = await pos.demoPurchase({
        productId: product.id,
        amountClp: product.amountClp,
      });
      setPoints(result.pointsEarned);
      onPoints(result.pointsEarned);
      setPhase("approved");
    } catch {
      setPhase("pick");
    }
  }

  const footer = (
    <>
      <BackButton onClick={onBack} />
      <NextButton onClick={onNext} />
    </>
  );

  return (
    <ScenePanel scene="pos" title="Un canal, muchas posibilidades" footer={footer}>
      <GuideBubble path={path}>
        El POS conecta tu actividad comercial con pagos, ventas y herramientas operativas
        proporcionadas por aliados especializados.
      </GuideBubble>

      {available === false ? (
        <p className="jy-note">
          La demostración del POS no está disponible ahora. Puedes seguir con el recorrido.
        </p>
      ) : (
        <>
          <div className="jy-pos">
            <div className="jy-pos-terminal" data-phase={phase}>
              <span className="jy-pos-brand">
                sicr<span className="jy-accent">3</span>p/
              </span>
              <div className="jy-pos-screen" aria-live="polite">
                {phase === "approved" && product ? (
                  <>
                    <span className="jy-pos-ok">
                      <Check aria-hidden="true" />
                    </span>
                    <span>Venta aprobada</span>
                    <strong>{clp(product.amountClp)}</strong>
                  </>
                ) : phase === "processing" ? (
                  <span>Procesando…</span>
                ) : product ? (
                  <>
                    <span>{product.name}</span>
                    <strong>{clp(product.amountClp)}</strong>
                    <span className="jy-pos-hint">Acerca la tarjeta</span>
                  </>
                ) : (
                  <span>Elige un producto</span>
                )}
              </div>
              <div className="jy-pos-keys" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            </div>
            <div
              className="jy-pos-card"
              data-tapped={phase === "processing" || phase === "approved"}
              aria-hidden="true"
            >
              sicr<span>3</span>p/
            </div>
          </div>

          {phase === "approved" ? (
            <p className="jy-points" role="status">
              +{points} puntos acumulados en tu tarjeta SICR3P/{" "}
              <span className="jy-badge">Simulado</span>
            </p>
          ) : (
            <>
              <div className="jy-chips" role="radiogroup" aria-label="Producto">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={productId === p.id}
                    className="jy-chip-toggle"
                    disabled={phase === "processing"}
                    onClick={() => setProductId(p.id)}
                  >
                    {p.name} · {clp(p.amountClp)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="jy-btn jy-btn-soft"
                disabled={!product || phase === "processing"}
                onClick={tap}
              >
                Acercar la tarjeta rosa
              </button>
              <p className="jy-note">Demostración simulada: no se procesa ningún pago real.</p>
            </>
          )}
        </>
      )}
    </ScenePanel>
  );
}
