import type { CeutaExtraordinaryAidRules } from "@/domain/grants/ceuta-extraordinary-aid";

export const ceutaExtraordinaryAid2026Rules: CeutaExtraordinaryAidRules = {
  individualAmountEuro: 5_000,
  companyAmountBrackets: [
    { upToTurnoverEuro: 1_000_000, amountEuro: 10_000 },
    { upToTurnoverEuro: 2_000_000, amountEuro: 20_000 },
    { upToTurnoverEuro: 6_000_000, amountEuro: 40_000 },
    { upToTurnoverEuro: 10_000_000, amountEuro: 80_000 },
    { upToTurnoverEuro: null, amountEuro: 150_000 },
  ],
  applicationDeadline: "2026-11-30",
  measureEffectiveDate: "2026-09-03",
  ruleRef: "RDL-22-2026-ART-1",
};
