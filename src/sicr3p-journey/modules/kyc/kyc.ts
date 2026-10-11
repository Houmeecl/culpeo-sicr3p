import type { JourneyPath, JourneyProfile, KycSnapshot } from "../journey-engine/types";

export type KycRequest = {
  sessionId: string;
  path: JourneyPath;
  answers: Record<string, string>;
  profile: JourneyProfile;
};

/** Puerto de verificación (KYC/KYB). Implementaciones en adapters/. */
export interface KycProvider {
  readonly name: string;
  readonly simulated: boolean;
  submit(req: KycRequest): Promise<KycSnapshot>;
}
