/** Puerto de pago. SICR3P/ no procesa pagos: delega en un proveedor externo. */
export type PaymentResult = {
  status: "received" | "failed" | "redirect";
  redirectUrl?: string;
  simulated: boolean;
};

export interface PaymentProvider {
  readonly name: string;
  readonly simulated: boolean;
  start(req: { sessionId: string; amountClp: number }): Promise<PaymentResult>;
}
