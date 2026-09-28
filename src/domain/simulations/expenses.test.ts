import { describe, expect, it } from "vitest";

import { parseEuro } from "../money";
import { calculateDeductibleExpenses } from "./expenses";

describe("calculateDeductibleExpenses", () => {
  it("annualizes each line and applies its own deduction percentage", () => {
    const result = calculateDeductibleExpenses([
      { id: "software", label: "Software", amount: parseEuro("100"), frequency: "MONTHLY", deductibleBasisPoints: 10_000, taxTreatment: "DIRECT", notes: "Suscripción profesional" },
      { id: "internet", label: "Internet", amount: parseEuro("60"), frequency: "MONTHLY", deductibleBasisPoints: 5_000, taxTreatment: "PARTIALLY_AFFECTED", notes: "Uso mixto" },
      { id: "computer", label: "Equipo", amount: parseEuro("1200"), frequency: "ANNUAL", deductibleBasisPoints: 0, taxTreatment: "CAPITAL_ASSET", notes: "La amortización requiere revisión" },
    ]);
    expect(result.value.cents).toBe(156_000);
    expect(result.lines).toHaveLength(3);
    expect(result.lines[1].explanation).toContain("50% deducible");
  });
  it("does not accept a purchase price as direct capital-asset deduction", () => {
    expect(() => calculateDeductibleExpenses([
      { id: "computer", label: "Equipo", amount: parseEuro("1200"), frequency: "ANNUAL", deductibleBasisPoints: 10_000, taxTreatment: "CAPITAL_ASSET", notes: "" },
    ])).toThrow("amortización anual fiscal");
  });

  it("rejects impossible percentages", () => {
    expect(() => calculateDeductibleExpenses([
      { id: "bad", label: "Bad", amount: parseEuro("1"), frequency: "ANNUAL", deductibleBasisPoints: 10_001, taxTreatment: "REQUIRES_REVIEW", notes: "" },
    ])).toThrow("between 0% and 100%");
  });
  it("rejects negative expense amounts", () => {
    expect(() => calculateDeductibleExpenses([
      { id: "bad", label: "Bad", amount: parseEuro("-1"), frequency: "ANNUAL", deductibleBasisPoints: 0, taxTreatment: "REQUIRES_REVIEW", notes: "" },
    ])).toThrow("cannot be negative");
  });
});
