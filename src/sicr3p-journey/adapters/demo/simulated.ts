import type { PosStation } from "../../contracts/api/ports";
import type { KycProvider } from "../../modules/kyc/kyc";
import type { PaymentProvider } from "../../modules/payment-adapter/payment";

/* [SIMULADO] Ninguna de estas implementaciones procesa operaciones reales. */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const simulatedPayment: PaymentProvider = {
  name: "Pago simulado",
  simulated: true,
  async start() {
    await wait(900);
    return { status: "received", simulated: true };
  },
};

export const simulatedKyc: KycProvider = {
  name: "Verificación simulada",
  simulated: true,
  async submit() {
    await wait(900);
    return { status: "submitted", provider: "Verificación simulada", simulated: true, missing: [] };
  },
};
export const simulatedPos: PosStation = {
  async isAvailable() {
    return true;
  },
  async demoPurchase({ amountClp }) {
    await wait(800);
    return {
      approved: true,
      pointsEarned: Math.max(1, Math.round(amountClp / 100)),
      simulated: true,
    };
  },
};
