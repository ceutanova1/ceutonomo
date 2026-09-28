import { describe, expect, it } from "vitest";
import { parseEuro } from "../money";
import { calculateEconomicActivityNetIncome2026 } from "./economic-activity";

describe("2026 Ceuta difficult-to-justify expenses", () => {
  it("applies 10% with the 2,000 euro cap", () => {
    const result = calculateEconomicActivityNetIncome2026({ netIncomeBeforeDifficultExpenses: parseEuro("50000"), simplifiedDirectEstimation: true, qualifyingCeutaActivity: true, appliesIncompatibleDependentWorkerReduction: false });
    expect(result.value.difficultToJustifyExpenses.cents).toBe(200_000);
    expect(result.value.taxableNetIncome.cents).toBe(4_800_000);
  });
  it("does not combine with the incompatible dependent-worker reduction", () => {
    const result = calculateEconomicActivityNetIncome2026({ netIncomeBeforeDifficultExpenses: parseEuro("10000"), simplifiedDirectEstimation: true, qualifyingCeutaActivity: true, appliesIncompatibleDependentWorkerReduction: true });
    expect(result.value.difficultToJustifyExpenses.cents).toBe(0);
    expect(result.value.applied).toBe(false);
  });
});
