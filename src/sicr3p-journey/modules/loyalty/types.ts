/** Fidelización: personas y empresas participan sin niveles de membresía. */
export type LoyaltyAccount = {
  id: string;
  ownerType: "person" | "company";
  ownerId: string;
  publicId: string;
  points: number;
};

export type LoyaltyTransaction = {
  id: string;
  accountId: string;
  kind: "earn" | "redeem" | "grant";
  points: number;
  source: string;
  simulated: boolean;
};

export type Reward = { id: string; title: string; pointsCost?: number };

export type MerchandiseItem = {
  id: string;
  title: string;
  acquisition: ("purchase" | "points" | "action" | "event" | "milestone")[];
};
