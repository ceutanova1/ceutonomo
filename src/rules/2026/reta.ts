import type { RetaRules } from "@/domain/social-security/reta";

export const reta2026Rules: RetaRules = {
  taxYear: 2026,
  genericExpenseBasisPoints: 700,
  societaryGenericExpenseBasisPoints: 300,
  ceutaBonusPeriods: [
    { id: "ceuta-50-jan-sep", fromMonth: 1, throughMonth: 9, commonContingenciesBonusBasisPoints: 5_000, ruleRef: "SS-CEUTA-AUTONOMO-2026-v1" },
    { id: "ceuta-75-oct-dec", fromMonth: 10, throughMonth: 12, commonContingenciesBonusBasisPoints: 7_500, ruleRef: "RDL-22-2026-ART-36" },
  ],
  ruleRefs: [
    "BOE-ORDER-PJC-297-2026-ART-18",
    "LGSS-ART-308-2026",
    "SS-CEUTA-AUTONOMO-2026-v1",
    "RDL-22-2026-ART-36",
  ],
  rates: {
    commonContingencies: 2_830,
    professionalContingencies: 130,
    cessationOfActivity: 90,
    professionalTraining: 10,
    intergenerationalEquity: 90,
  },
  brackets: [
    { id: "reduced-1", minimumMonthlyNetCents: null, maximumMonthlyNetCents: 67_000, minimumBaseCents: 65_359, maximumBaseCents: 71_894 },
    { id: "reduced-2", minimumMonthlyNetCents: 67_001, maximumMonthlyNetCents: 90_000, minimumBaseCents: 71_895, maximumBaseCents: 90_000 },
    { id: "reduced-3", minimumMonthlyNetCents: 90_001, maximumMonthlyNetCents: 116_669, minimumBaseCents: 84_967, maximumBaseCents: 116_670 },
    { id: "general-1", minimumMonthlyNetCents: 116_670, maximumMonthlyNetCents: 130_000, minimumBaseCents: 95_098, maximumBaseCents: 130_000 },
    { id: "general-2", minimumMonthlyNetCents: 130_001, maximumMonthlyNetCents: 150_000, minimumBaseCents: 96_078, maximumBaseCents: 150_000 },
    { id: "general-3", minimumMonthlyNetCents: 150_001, maximumMonthlyNetCents: 170_000, minimumBaseCents: 96_078, maximumBaseCents: 170_000 },
    { id: "general-4", minimumMonthlyNetCents: 170_001, maximumMonthlyNetCents: 185_000, minimumBaseCents: 114_379, maximumBaseCents: 185_000 },
    { id: "general-5", minimumMonthlyNetCents: 185_001, maximumMonthlyNetCents: 203_000, minimumBaseCents: 120_915, maximumBaseCents: 203_000 },
    { id: "general-6", minimumMonthlyNetCents: 203_001, maximumMonthlyNetCents: 233_000, minimumBaseCents: 127_451, maximumBaseCents: 233_000 },
    { id: "general-7", minimumMonthlyNetCents: 233_001, maximumMonthlyNetCents: 276_000, minimumBaseCents: 135_621, maximumBaseCents: 276_000 },
    { id: "general-8", minimumMonthlyNetCents: 276_001, maximumMonthlyNetCents: 319_000, minimumBaseCents: 143_791, maximumBaseCents: 319_000 },
    { id: "general-9", minimumMonthlyNetCents: 319_001, maximumMonthlyNetCents: 362_000, minimumBaseCents: 151_961, maximumBaseCents: 362_000 },
    { id: "general-10", minimumMonthlyNetCents: 362_001, maximumMonthlyNetCents: 405_000, minimumBaseCents: 160_131, maximumBaseCents: 405_000 },
    { id: "general-11", minimumMonthlyNetCents: 405_001, maximumMonthlyNetCents: 600_000, minimumBaseCents: 173_203, maximumBaseCents: 510_120 },
    { id: "general-12", minimumMonthlyNetCents: 600_001, maximumMonthlyNetCents: null, minimumBaseCents: 192_810, maximumBaseCents: 510_120 },
  ],
};
