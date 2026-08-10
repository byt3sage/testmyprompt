import { PlanTier } from "@prisma/client";

export type PlanConfig = {
  name: string;
  monthlyTests: number;
  seats: number;
};

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  FREE: {
    name: "Trial",
    monthlyTests: 2,
    seats: 2,
  },
  PRO: {
    name: "Pro",
    monthlyTests: 20,
    seats: 10,
  },
  BUSINESS: {
    name: "Business",
    monthlyTests: 200,
    seats: 25,
  },
};

export function getPlanConfig(plan: PlanTier): PlanConfig {
  return PLAN_CONFIG[plan];
}
