import type { Calculation } from "../calculation";
import { addMoney, applyBasisPoints, multiplyMoney, type Money } from "../money";

export type ExpenseInput = Readonly<{
  id: string;
  label: string;
  amount: Money;
  frequency: "MONTHLY" | "ANNUAL";
  deductibleBasisPoints: number;
  taxTreatment: "DIRECT" | "PARTIALLY_AFFECTED" | "CAPITAL_ASSET" | "PAYROLL" | "REQUIRES_REVIEW";
  notes: string;
}>;

export const calculateDeductibleExpenses = (
  expenses: ExpenseInput[],
): Calculation<Money> => {
  const lines = expenses.map((expense) => {
    if (expense.amount.cents < 0) throw new RangeError("Expense amounts cannot be negative.");
    if (!Number.isInteger(expense.deductibleBasisPoints) || expense.deductibleBasisPoints < 0 || expense.deductibleBasisPoints > 10_000) {
      throw new RangeError("Deductible percentage must be between 0% and 100%.");
    }
    if (expense.taxTreatment === "CAPITAL_ASSET" && expense.deductibleBasisPoints > 0) {
      throw new RangeError("Los bienes de inversión requieren introducir la amortización anual fiscal, no deducir automáticamente el precio de compra.");
    }
    const annualAmount = expense.frequency === "MONTHLY"
      ? multiplyMoney(expense.amount, 12)
      : expense.amount;
    const deductible = applyBasisPoints(annualAmount, expense.deductibleBasisPoints);
    return {
      id: expense.id,
      label: expense.label,
      amount: deductible,
      operation: "SUBTRACT" as const,
      explanation: `${expense.deductibleBasisPoints / 100}% deducible según el supuesto editable. Tratamiento: ${expense.taxTreatment}. ${expense.notes}`.trim(),
    };
  });
  return {
    value: addMoney(...lines.map((line) => line.amount)),
    lines,
    assumptions: ["La deducibilidad indicada es un supuesto del usuario, no una validación fiscal."],
    ruleRefs: [],
  };
};
