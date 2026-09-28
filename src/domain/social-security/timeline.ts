import type { Money } from "@/domain/money";

import type { RetaContributionResult } from "./reta";

export type SocialSecurityTimelineYear = Readonly<{
  year: number;
  status: "CALCULATED" | "NEEDS_VERIFICATION";
  standardContribution: Money | null;
  appliedIncentive: string;
  finalContribution: Money | null;
  annualSaving: Money | null;
  explanation: string;
}>;

export const buildThreeYearRetaTimeline = (
  startYear: number,
  firstYear: RetaContributionResult,
): SocialSecurityTimelineYear[] => [
  {
    year: startYear,
    status: "CALCULATED",
    standardContribution: firstYear.standardAnnualContribution,
    appliedIncentive: firstYear.bonusPeriods.map((period) => `${period.basisPoints / 100}% × ${period.monthCount} meses`).join(" · ") || "Sin incentivo",
    finalContribution: firstYear.finalAnnualContribution,
    annualSaving: firstYear.annualSaving,
    explanation: "Cálculo con bases, tipos y períodos oficiales configurados para 2026.",
  },
  ...[startYear + 1, startYear + 2].map((year) => ({
    year,
    status: "NEEDS_VERIFICATION" as const,
    standardContribution: null,
    appliedIncentive: "Pendiente de normativa anual",
    finalContribution: null,
    annualSaving: null,
    explanation: "No se proyectan importes usando reglas de otro ejercicio.",
  })),
];

