/** Activación única de la Cuenta SICR3P/. No existen niveles. */
export const ACTIVATION = {
  title: "Activa tu Cuenta SICR3P/",
  amountClp: 19990,
  description: "Incorporación y operación básica de la cuenta.",
} as const;

export type Subscription = {
  id: string;
  accountType: "person" | "company";
  amountClp: number;
  status: "pending" | "active" | "cancelled";
};
