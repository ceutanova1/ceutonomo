import { euro } from "@/domain/money";
import type { CorporateTaxRules } from "@/domain/tax/corporate-tax";

export const corporateTax2026Rules: CorporateTaxRules = {
  microFirstThreshold: euro(5_000_000),
  microFirstRateBasisPoints: 1_900,
  microExcessRateBasisPoints: 2_100,
  newCompanyRateBasisPoints: 1_500,
  ceutaBonusBasisPoints: 6_000,
  ruleRefs: ["LIS-ART-29-DT44-2026", "LIS-ART-33-RDL22-2026"],
};
