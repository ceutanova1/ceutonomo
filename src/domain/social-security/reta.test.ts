import { describe, expect, it } from "vitest";

import { parseEuro } from "../money";
import { reta2026Rules } from "@/rules/2026/reta";
import { calculateRetaContribution } from "./reta";

describe("calculateRetaContribution", () => {
  it("uses the 2026 bracket and applies the dated 50%/75% Ceuta periods only to common contingencies", () => {
    const result = calculateRetaContribution({
      annualNetReturnBeforeGenericDeduction: parseEuro("70800"),
      activeMonths: 12,
      isSocietaryAutonomo: false,
      applyCeutaBonus: true,
    }, reta2026Rules);

    expect(result.averageMonthlyReturn.cents).toBe(548_700);
    expect(result.bracket.id).toBe("general-11");
    expect(result.selectedMonthlyBase.cents).toBe(173_203);
    expect(result.standardMonthlyContribution.cents).toBe(54_559);
    expect(result.monthlySaving.cents).toBe(27_572);
    expect(result.finalMonthlyContribution.cents).toBe(26_988);
    expect(result.annualSaving.cents).toBe(330_858);
    expect(result.finalAnnualContribution.cents).toBe(323_850);
    expect(result.bonusPeriods.map((period) => [period.monthCount, period.basisPoints])).toEqual([[9, 5_000], [3, 7_500]]);
    expect(
      result.components.filter((component) => component.savingMonthly.cents > 0).map((component) => component.id),
    ).toEqual(["commonContingencies"]);
  });

  it("uses 75% for an activity starting in October 2026", () => {
    const result = calculateRetaContribution({
      annualNetReturnBeforeGenericDeduction: parseEuro("17700"),
      activeMonths: 3,
      activeFromMonth: 10,
      isSocietaryAutonomo: false,
      applyCeutaBonus: true,
    }, reta2026Rules);
    expect(result.bonusPeriods).toHaveLength(1);
    expect(result.bonusPeriods[0].basisPoints).toBe(7_500);
    expect(result.bonusPeriods[0].monthCount).toBe(3);
  });

  it.each([
    ["0", "reduced-1"],
    ["20000", "general-3"],
    ["50000", "general-10"],
    ["75600", "general-11"],
    ["100000", "general-12"],
    ["150000", "general-12"],
    ["250000", "general-12"],
  ])("selects a bracket for %s annual net return", (returnValue, expectedBracket) => {
    const result = calculateRetaContribution({
      annualNetReturnBeforeGenericDeduction: parseEuro(returnValue),
      activeMonths: 12,
      isSocietaryAutonomo: false,
      applyCeutaBonus: false,
    }, reta2026Rules);
    expect(result.bracket.id).toBe(expectedBracket);
  });

  it("rejects a selected base outside the official bracket", () => {
    expect(() => calculateRetaContribution({
      annualNetReturnBeforeGenericDeduction: parseEuro("70800"),
      activeMonths: 12,
      isSocietaryAutonomo: false,
      selectedMonthlyBase: parseEuro("1000"),
      applyCeutaBonus: true,
    }, reta2026Rules)).toThrow("outside the permitted bracket range");
  });
});
