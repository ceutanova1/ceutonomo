import { describe, expect, it } from "vitest";
import { parseEuro } from "../money";
import { calculateRevenue } from "./revenue";

describe("calculateRevenue", () => {
  it.each([
    ["0", 0], ["20000", 2_000_000], ["50000", 5_000_000],
    ["75600", 7_560_000], ["100000", 10_000_000],
    ["150000", 15_000_000], ["250000", 25_000_000],
  ])("supports annual revenue case %s", (annual, expectedCents) => {
    const result = calculateRevenue({ dailyRate: parseEuro(annual), billableDaysPerMonth: 1, workingMonths: 1 });
    expect(result.value.cents).toBe(expectedCents);
  });
  it("calculates the seeded €300 × 21 × 12 scenario", () => {
    const result = calculateRevenue({ dailyRate: parseEuro("300"), billableDaysPerMonth: 21, workingMonths: 12 });
    expect(result.value.cents).toBe(7_560_000);
  });
  it("supports a manual annual revenue override", () => {
    const result = calculateRevenue({ mode: "MANUAL", annualRevenue: parseEuro("84000") });
    expect(result.value.cents).toBe(8_400_000);
    expect(result.assumptions).toContain("Ingresos anuales introducidos manualmente");
  });
  it("rejects negative business revenue", () => {
    expect(() => calculateRevenue({ mode: "MANUAL", annualRevenue: parseEuro("-1") })).toThrow("cannot be negative");
    expect(() => calculateRevenue({ dailyRate: parseEuro("-1"), billableDaysPerMonth: 1, workingMonths: 1 })).toThrow("cannot be negative");
  });
});
