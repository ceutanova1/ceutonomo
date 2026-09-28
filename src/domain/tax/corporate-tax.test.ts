import { describe, expect, it } from "vitest";
import { parseEuro } from "../money";
import { calculateCorporateTax2026 } from "./corporate-tax";
import { corporateTax2026Rules } from "@/rules/2026/corporate-tax";

describe("calculateCorporateTax2026", () => {
  it("applies the 2026 microcompany scale and 60% Ceuta bonus proportionally", () => {
    const result = calculateCorporateTax2026({ taxableProfit: parseEuro("60000"), qualifyingCeutaProfitBasisPoints: 7_000, newCompanyReducedRateApplies: false }, corporateTax2026Rules);
    expect(result.normalCorporateTax.cents).toBe(1_160_000);
    expect(result.ceutaBonus.cents).toBe(487_200);
    expect(result.finalCorporateTax.cents).toBe(672_800);
    expect(result.profitAfterTax.cents).toBe(5_327_200);
  });

  it("uses the 15% rate only when the new-company condition is declared", () => {
    const result = calculateCorporateTax2026({ taxableProfit: parseEuro("40000"), qualifyingCeutaProfitBasisPoints: 10_000, newCompanyReducedRateApplies: true }, corporateTax2026Rules);
    expect(result.normalCorporateTax.cents).toBe(600_000);
    expect(result.ceutaBonus.cents).toBe(360_000);
    expect(result.finalCorporateTax.cents).toBe(240_000);
  });
});
