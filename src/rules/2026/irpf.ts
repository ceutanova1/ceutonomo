import type { IrpfGeneralRules } from "@/domain/tax/irpf";

export const irpf2026GeneralRules: IrpfGeneralRules = {
  taxYear: 2026,
  ceutaDeductionBasisPoints: 6_000,
  taxpayerMinimumCents: 555_000,
  over65IncreaseCents: 115_000,
  over75AdditionalIncreaseCents: 140_000,
  lastVerified: "2026-09-28",
  ruleRefs: [
    "BOE-LIRPF-35-2006-ART-56-57",
    "BOE-LIRPF-35-2006-ART-63-65",
    "BOE-LIRPF-35-2006-68-4",
    "AEAT-IRPF-2025-CEUTA-WORKED-EXAMPLE",
  ],
  stateScale: [
    { upToCents: 1_245_000, rateBasisPoints: 950 },
    { upToCents: 2_020_000, rateBasisPoints: 1_200 },
    { upToCents: 3_520_000, rateBasisPoints: 1_500 },
    { upToCents: 6_000_000, rateBasisPoints: 1_850 },
    { upToCents: 30_000_000, rateBasisPoints: 2_250 },
    { upToCents: null, rateBasisPoints: 2_450 },
  ],
  ceutaComplementaryScale: [
    { upToCents: 1_245_000, rateBasisPoints: 950 },
    { upToCents: 2_020_000, rateBasisPoints: 1_200 },
    { upToCents: 3_520_000, rateBasisPoints: 1_500 },
    { upToCents: 6_000_000, rateBasisPoints: 1_850 },
    { upToCents: null, rateBasisPoints: 2_250 },
  ],
};

