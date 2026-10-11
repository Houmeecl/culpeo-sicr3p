import { useState } from "react";
import { Check } from "lucide-react";
import type { PaymentSnapshot } from "../../modules/journey-engine/types";
import type { PaymentProvider } from "../../modules/payment-adapter/payment";
import { ACTIVATION } from "../../modules/subscription/activation";
import { BackButton, NextButton, ScenePanel } from "../experience/ScenePanel";

const INCLUDED = [
  "Acceso a la red SICR3P/",
  "Tarjeta de fidelización",
  "Participación en beneficios",
  "Soporte y comunidad",
];

/** Escena 10 — Activación única, sin niveles. El cobro lo procesa un proveedor externo. */
export function Payment({
  sessionId,
  provider,
  onResult,
  onBack,
}: {
  sessionId: string;
  provider: PaymentProvider;
  onResult: (payment: PaymentSnapshot) => void;
  onBack: () => void;
}) {
  const [method, setMethod] = useState<PaymentSnapshot["method"]>("card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const result = await provider.start({ sessionId, amountClp: ACTIVATION.amountClp });
      const snapshot: PaymentSnapshot = {
        status: result.status === "received" ? "received" : "failed",
        method,
        amountClp: ACTIVATION.amountClp,
        provider: provider.name,
        simulated: result.simulated,
      };
      if (snapshot.status === "failed") setError("No se pudo completar el pago. Intenta de nuevo.");
      onResult(snapshot);
    } catch {
      setError("No se pudo conectar con el medio de pago.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScenePanel
      scene="payment"
      title={ACTIVATION.title}
      footer={
        <>
          <BackButton onClick={onBack} />
          <NextButton onClick={pay} disabled={busy}>
            {busy ? "Procesando…" : "Pagar y activar"}
          </NextButton>
        </>
      }
    >
      <div className="jy-price">
        <span className="jy-price-amount">
          ${ACTIVATION.amountClp.toLocaleString("es-CL")} <small>CLP</small>
        </span>
        <span className="jy-price-desc">{ACTIVATION.description}</span>
        <ul className="jy-included">
          {INCLUDED.map((i) => (
            <li key={i}>
              <Check aria-hidden="true" /> {i}
            </li>
          ))}
        </ul>
      </div>

      <div className="jy-methods" role="radiogroup" aria-label="Medio de pago">
        {(
          [
            ["card", "Tarjeta de crédito o débito"],
            ["transfer", "Transferencia"],
          ] as const
        ).map(([value, text]) => (
          <label key={value} className="jy-method">
            <input
              type="radio"
              name="jy-method"
              value={value}
              checked={method === value}
              onChange={() => setMethod(value)}
            />
            {text}
          </label>
        ))}
      </div>

      {provider.simulated ? (
        <p className="jy-note">
          <span className="jy-badge">Simulado</span> Pago de demostración: no se realiza ningún
          cobro. El pago real lo procesará un proveedor externo.
        </p>
      ) : null}
      {error ? (
        <p className="jy-error" role="alert">
          {error}
        </p>
      ) : null}
    </ScenePanel>
  );
}
