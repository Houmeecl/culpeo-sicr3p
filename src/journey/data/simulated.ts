import type { KycProvider, PaymentProvider, PosStation } from "./ports";

/* [SIMULADO] Ninguna de estas implementaciones procesa operaciones reales. */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const simulatedPayment: PaymentProvider = {
  simulated: true,
  async start() {
    await wait(900);
    return { status: "received", simulated: true };
  },
};

export const simulatedKyc: KycProvider = {
  simulated: true,
  async submit() {
    await wait(700);
    return { status: "submitted", simulated: true };
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
