import { describe, expect, it } from "vitest";
import { demoBusinessProfile } from "../profile";
import { evaluateCeutaExtraordinaryAid2026 } from "./ceuta-extraordinary-aid";
import { ceutaExtraordinaryAid2026Rules } from "@/rules/2026/direct-aid";

describe("Ceuta extraordinary direct aid 2026", () => {
  it("returns the fixed 5,000 euro amount for a qualifying individual", () => {
    const result = evaluateCeutaExtraordinaryAid2026({ ...demoBusinessProfile, negativelyAffectedBy2026MigrationCrisis: true, registeredInTaxCensusBefore2026Measure: true }, ceutaExtraordinaryAid2026Rules);
    expect(result.status).toBe("POTENTIALLY_ELIGIBLE");
    expect(result.amountEuro).toBe(5_000);
  });
  it("never infers crisis impact", () => {
    const result = evaluateCeutaExtraordinaryAid2026(demoBusinessProfile, ceutaExtraordinaryAid2026Rules);
    expect(result.status).toBe("NEEDS_VERIFICATION");
    expect(result.missingFacts).toContain("Afectación negativa por la crisis migratoria declarada");
  });
  it.each([
    [900_000, 10_000],
    [1_500_000, 20_000],
    [4_000_000, 40_000],
    [8_000_000, 80_000],
    [12_000_000, 150_000],
  ])("selects the legal-entity amount for %s euro turnover", (turnover, amount) => {
    const result = evaluateCeutaExtraordinaryAid2026({
      ...demoBusinessProfile,
      legalStructure: "SL",
      newBusiness: false,
      company2025TurnoverEuro: turnover,
      negativelyAffectedBy2026MigrationCrisis: true,
      required2025TaxReturnFiled: true,
    }, ceutaExtraordinaryAid2026Rules);
    expect(result.amountEuro).toBe(amount);
    expect(result.status).toBe("POTENTIALLY_ELIGIBLE");
  });
});
