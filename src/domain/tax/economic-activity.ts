import type { Calculation } from "../calculation";
import { applyBasisPoints, euro, subtractMoney, type Money } from "../money";

export type EconomicActivityNetIncomeInput = Readonly<{
  netIncomeBeforeDifficultExpenses: Money;
  simplifiedDirectEstimation: boolean;
  qualifyingCeutaActivity: boolean;
  appliesIncompatibleDependentWorkerReduction: boolean;
}>;

export type EconomicActivityNetIncome = Readonly<{
  taxableNetIncome: Money;
  difficultToJustifyExpenses: Money;
  applied: boolean;
}>;

export const calculateEconomicActivityNetIncome2026 = (
  input: EconomicActivityNetIncomeInput,
): Calculation<EconomicActivityNetIncome> => {
  if (input.netIncomeBeforeDifficultExpenses.cents < 0) {
    throw new RangeError("El rendimiento previo a los gastos de difícil justificación no puede ser negativo en esta simulación.");
  }
  const applied = input.simplifiedDirectEstimation
    && input.qualifyingCeutaActivity
    && !input.appliesIncompatibleDependentWorkerReduction;
  const proportional = applied ? applyBasisPoints(input.netIncomeBeforeDifficultExpenses, 1_000) : euro(0);
  const allowance = euro(Math.min(proportional.cents, 200_000));
  return {
    value: {
      taxableNetIncome: subtractMoney(input.netIncomeBeforeDifficultExpenses, allowance),
      difficultToJustifyExpenses: allowance,
      applied,
    },
    lines: [{
      id: "irpf-2026-ceuta-difficult-expenses",
      label: "Gastos de difícil justificación 2026",
      amount: allowance,
      operation: "SUBTRACT",
      explanation: applied
        ? "10% del rendimiento positivo previo, con máximo anual de 2.000 €."
        : "No aplicado por régimen, localización o incompatibilidad declarada.",
    }],
    assumptions: ["Medida extraordinaria aplicable al período impositivo 2026 para actividades calificadas en Ceuta."],
    ruleRefs: ["RDL-22-2026-DA-64"],
  };
};
