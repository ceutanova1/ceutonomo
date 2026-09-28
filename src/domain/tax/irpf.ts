import type { CalculationLine } from "../calculation";
import { addMoney, euro, subtractMoney, type Money } from "../money";
import { calculateProgressiveQuota, type ProgressiveBracket } from "./progressive-scale";

export type IrpfGeneralRules = Readonly<{
  taxYear: number;
  stateScale: ProgressiveBracket[];
  ceutaComplementaryScale: ProgressiveBracket[];
  ceutaDeductionBasisPoints: number;
  taxpayerMinimumCents: number;
  over65IncreaseCents: number;
  over75AdditionalIncreaseCents: number;
  ruleRefs: string[];
  lastVerified: string;
}>;

export type IrpfGeneralInput = Readonly<{
  generalTaxableBase: Money;
  qualifyingCeutaGeneralBase: Money;
  taxpayerAge: number;
  additionalPersonalFamilyMinimum: Money;
  applyCeutaDeduction: boolean;
}>;

export type IrpfGeneralResult = Readonly<{
  personalFamilyMinimum: Money;
  stateGrossQuota: Money;
  complementaryGrossQuota: Money;
  stateMinimumQuota: Money;
  complementaryMinimumQuota: Money;
  stateGeneralQuota: Money;
  complementaryGeneralQuota: Money;
  normalGeneralIrpf: Money;
  ceutaGeneralDeduction: Money;
  estimatedGeneralIrpf: Money;
  effectiveRateBasisPoints: number;
  lines: CalculationLine[];
  assumptions: string[];
  warnings: string[];
  ruleRefs: string[];
}>;

export const calculateTaxpayerMinimum = (
  age: number,
  rules: IrpfGeneralRules,
): Money => {
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    throw new RangeError("Taxpayer age must be a whole number from 0 to 120.");
  }
  let minimum = rules.taxpayerMinimumCents;
  if (age > 65) minimum += rules.over65IncreaseCents;
  if (age > 75) minimum += rules.over75AdditionalIncreaseCents;
  return euro(minimum);
};

const proportionalDeduction = (
  quota: Money,
  taxableBase: Money,
  qualifyingBase: Money,
  deductionBasisPoints: number,
): Money => {
  if (taxableBase.cents === 0 || qualifyingBase.cents === 0) return euro(0);
  const limitedQualifyingBase = Math.min(qualifyingBase.cents, taxableBase.cents);
  // AEAT's published worked example truncates the proportional result to cents.
  const numerator = BigInt(quota.cents)
    * BigInt(limitedQualifyingBase)
    * BigInt(deductionBasisPoints);
  const denominator = BigInt(taxableBase.cents) * BigInt(10_000);
  return euro(Number(numerator / denominator));
};

export const calculateIrpfGeneral = (
  input: IrpfGeneralInput,
  rules: IrpfGeneralRules,
): IrpfGeneralResult => {
  if (input.generalTaxableBase.cents < 0 || input.qualifyingCeutaGeneralBase.cents < 0) {
    throw new RangeError("IRPF bases cannot be negative.");
  }

  const personalFamilyMinimum = addMoney(
    calculateTaxpayerMinimum(input.taxpayerAge, rules),
    input.additionalPersonalFamilyMinimum,
  );
  const minimumAppliedToGeneral = euro(
    Math.min(personalFamilyMinimum.cents, input.generalTaxableBase.cents),
  );
  const stateGrossQuota = calculateProgressiveQuota(input.generalTaxableBase, rules.stateScale);
  const complementaryGrossQuota = calculateProgressiveQuota(
    input.generalTaxableBase,
    rules.ceutaComplementaryScale,
  );
  const stateMinimumQuota = calculateProgressiveQuota(minimumAppliedToGeneral, rules.stateScale);
  const complementaryMinimumQuota = calculateProgressiveQuota(
    minimumAppliedToGeneral,
    rules.ceutaComplementaryScale,
  );
  const stateGeneralQuota = subtractMoney(stateGrossQuota, stateMinimumQuota);
  const complementaryGeneralQuota = subtractMoney(
    complementaryGrossQuota,
    complementaryMinimumQuota,
  );
  const normalGeneralIrpf = addMoney(stateGeneralQuota, complementaryGeneralQuota);
  const ceutaGeneralDeduction = input.applyCeutaDeduction
    ? proportionalDeduction(
      normalGeneralIrpf,
      input.generalTaxableBase,
      input.qualifyingCeutaGeneralBase,
      rules.ceutaDeductionBasisPoints,
    )
    : euro(0);
  const estimatedGeneralIrpf = subtractMoney(normalGeneralIrpf, ceutaGeneralDeduction);
  const effectiveRateBasisPoints = input.generalTaxableBase.cents === 0
    ? 0
    : Math.round((estimatedGeneralIrpf.cents * 10_000) / input.generalTaxableBase.cents);

  return {
    personalFamilyMinimum,
    stateGrossQuota,
    complementaryGrossQuota,
    stateMinimumQuota,
    complementaryMinimumQuota,
    stateGeneralQuota,
    complementaryGeneralQuota,
    normalGeneralIrpf,
    ceutaGeneralDeduction,
    estimatedGeneralIrpf,
    effectiveRateBasisPoints,
    lines: [
      {
        id: "irpf-general-base",
        label: "Base liquidable general estimada",
        amount: input.generalTaxableBase,
        operation: "RESULT",
        explanation: "Rendimiento neto usado en este escenario antes de aplicar las escalas.",
      },
      {
        id: "irpf-normal-quota",
        label: "IRPF general antes del beneficio Ceuta",
        amount: normalGeneralIrpf,
        operation: "SUBTRACT",
        explanation: "Suma de las cuotas estatal y complementaria después del mínimo personal y familiar.",
      },
      {
        id: "irpf-ceuta-deduction",
        label: "Deducción por rentas obtenidas en Ceuta",
        amount: ceutaGeneralDeduction,
        operation: "ADD",
        explanation: "60% de la cuota general proporcionalmente atribuible a la base calificada como obtenida en Ceuta.",
      },
      {
        id: "irpf-final-general",
        label: "IRPF general estimado",
        amount: estimatedGeneralIrpf,
        operation: "RESULT",
        explanation: "Cuota general ordinaria menos la deducción Ceuta estimada.",
      },
    ],
    assumptions: [
      `Contribuyente de ${input.taxpayerAge} años.`,
      `Mínimo personal y familiar total: ${personalFamilyMinimum.cents / 100} euros.`,
      "No se incluyen base del ahorro, otras reducciones, deducciones ni pagos a cuenta.",
    ],
    warnings: [
      "La calificación del porcentaje de renta obtenida en Ceuta debe poder acreditarse.",
      "El resultado es una estimación de la cuota general, no una declaración completa de IRPF.",
    ],
    ruleRefs: rules.ruleRefs,
  };
};
