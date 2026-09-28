import type { Calculation } from "../calculation";
import { multiplyMoney, type Money } from "../money";

export type DerivedRevenueInput = Readonly<{
  mode?: "DERIVED";
  dailyRate: Money;
  billableDaysPerMonth: number;
  workingMonths: number;
}>;

export type ManualRevenueInput = Readonly<{
  mode: "MANUAL";
  annualRevenue: Money;
}>;

export type RevenueInput = DerivedRevenueInput | ManualRevenueInput;

const ensureCount = (value: number, label: string, maximum: number) => {
  if (!Number.isInteger(value) || value < 0 || value > maximum) {
    throw new RangeError(`${label} must be a whole number from 0 to ${maximum}.`);
  }
};

export const calculateRevenue = (input: RevenueInput): Calculation<Money> => {
  if (input.mode === "MANUAL") {
    if (input.annualRevenue.cents < 0) throw new RangeError("Annual revenue cannot be negative.");
    return {
      value: input.annualRevenue,
      lines: [{
        id: "gross-revenue",
        label: "Ingresos anuales",
        amount: input.annualRevenue,
        operation: "RESULT",
        explanation: "Importe anual introducido manualmente por el usuario.",
      }],
      assumptions: ["Ingresos anuales introducidos manualmente"],
      ruleRefs: [],
    };
  }
  if (input.dailyRate.cents < 0) throw new RangeError("Daily rate cannot be negative.");
  ensureCount(input.billableDaysPerMonth, "Billable days", 31);
  ensureCount(input.workingMonths, "Working months", 12);
  const annual = multiplyMoney(
    multiplyMoney(input.dailyRate, input.billableDaysPerMonth),
    input.workingMonths,
  );
  return {
    value: annual,
    lines: [{
      id: "gross-revenue",
      label: "Ingresos anuales",
      amount: annual,
      operation: "RESULT",
      explanation: "Tarifa diaria × días facturables al mes × meses trabajados.",
    }],
    assumptions: [
      `${input.billableDaysPerMonth} días facturables al mes`,
      `${input.workingMonths} meses trabajados`,
    ],
    ruleRefs: [],
  };
};
