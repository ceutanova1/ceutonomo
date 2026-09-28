import type { CalculationLine } from "../calculation";
import {
  addMoney,
  applyBasisPoints,
  euro,
  multiplyMoney,
  type Money,
} from "../money";

export type RetaBracket = Readonly<{
  id: string;
  minimumMonthlyNetCents: number | null;
  maximumMonthlyNetCents: number | null;
  minimumBaseCents: number;
  maximumBaseCents: number;
}>;

export type RetaRates = Readonly<{
  commonContingencies: number;
  professionalContingencies: number;
  cessationOfActivity: number;
  professionalTraining: number;
  intergenerationalEquity: number;
}>;

export type RetaRules = Readonly<{
  taxYear: number;
  genericExpenseBasisPoints: number;
  societaryGenericExpenseBasisPoints: number;
  ceutaBonusPeriods: ReadonlyArray<{
    id: string;
    fromMonth: number;
    throughMonth: number;
    commonContingenciesBonusBasisPoints: number;
    ruleRef: string;
  }>;
  brackets: RetaBracket[];
  rates: RetaRates;
  ruleRefs: string[];
}>;

export type RetaContributionInput = Readonly<{
  annualNetReturnBeforeGenericDeduction: Money;
  activeMonths: number;
  activeFromMonth?: number;
  isSocietaryAutonomo: boolean;
  selectedMonthlyBase?: Money;
  applyCeutaBonus: boolean;
}>;

export type ContributionComponent = Readonly<{
  id: keyof RetaRates;
  label: string;
  basisPoints: number;
  standardMonthly: Money;
  finalMonthly: Money;
  savingMonthly: Money;
}>;

export type RetaContributionResult = Readonly<{
  computableAnnualReturn: Money;
  averageMonthlyReturn: Money;
  bracket: RetaBracket;
  selectedMonthlyBase: Money;
  components: ContributionComponent[];
  standardMonthlyContribution: Money;
  finalMonthlyContribution: Money;
  monthlySaving: Money;
  standardAnnualContribution: Money;
  finalAnnualContribution: Money;
  annualSaving: Money;
  bonusPeriods: ReadonlyArray<{
    id: string;
    monthCount: number;
    fromMonth: number;
    throughMonth: number;
    basisPoints: number;
    saving: Money;
  }>;
  lines: CalculationLine[];
  assumptions: string[];
  ruleRefs: string[];
}>;

const componentLabels: Record<keyof RetaRates, string> = {
  commonContingencies: "Contingencias comunes",
  professionalContingencies: "Contingencias profesionales",
  cessationOfActivity: "Cese de actividad",
  professionalTraining: "Formación profesional",
  intergenerationalEquity: "Mecanismo de equidad intergeneracional",
};

const findBracket = (monthlyReturn: Money, brackets: RetaBracket[]): RetaBracket => {
  const bracket = brackets.find((candidate) => {
    const aboveMinimum = candidate.minimumMonthlyNetCents === null
      || monthlyReturn.cents >= candidate.minimumMonthlyNetCents;
    const belowMaximum = candidate.maximumMonthlyNetCents === null
      || monthlyReturn.cents <= candidate.maximumMonthlyNetCents;
    return aboveMinimum && belowMaximum;
  });

  if (!bracket) throw new RangeError("No RETA bracket matches the monthly return.");
  return bracket;
};

export const calculateRetaContribution = (
  input: RetaContributionInput,
  rules: RetaRules,
): RetaContributionResult => {
  if (!Number.isInteger(input.activeMonths) || input.activeMonths < 1 || input.activeMonths > 12) {
    throw new RangeError("Active months must be a whole number from 1 to 12.");
  }
  const activeFromMonth = input.activeFromMonth ?? 1;
  if (!Number.isInteger(activeFromMonth) || activeFromMonth < 1 || activeFromMonth > 12) {
    throw new RangeError("Activity start month must be a whole number from 1 to 12.");
  }
  if (activeFromMonth + input.activeMonths - 1 > 12) {
    throw new RangeError("Active months must fit inside the configured contribution year.");
  }
  if (input.annualNetReturnBeforeGenericDeduction.cents < 0) {
    throw new RangeError("The RETA bracket calculation does not accept a negative return.");
  }

  const genericExpenseBasisPoints = input.isSocietaryAutonomo
    ? rules.societaryGenericExpenseBasisPoints
    : rules.genericExpenseBasisPoints;
  const computableShare = 10_000 - genericExpenseBasisPoints;
  const computableAnnualReturn = applyBasisPoints(
    input.annualNetReturnBeforeGenericDeduction,
    computableShare,
  );
  const averageMonthlyReturn = euro(
    Math.round(computableAnnualReturn.cents / input.activeMonths),
  );
  const bracket = findBracket(averageMonthlyReturn, rules.brackets);
  const selectedMonthlyBase = input.selectedMonthlyBase ?? euro(bracket.minimumBaseCents);

  if (
    selectedMonthlyBase.cents < bracket.minimumBaseCents
    || selectedMonthlyBase.cents > bracket.maximumBaseCents
  ) {
    throw new RangeError("The selected contribution base is outside the permitted bracket range.");
  }

  const components = (Object.entries(rules.rates) as [keyof RetaRates, number][]).map(
    ([id, basisPoints]): ContributionComponent => {
      const standardMonthly = applyBasisPoints(selectedMonthlyBase, basisPoints);
      return {
        id,
        label: componentLabels[id],
        basisPoints,
        standardMonthly,
        finalMonthly: standardMonthly,
        savingMonthly: euro(0),
      };
    },
  );

  const standardMonthlyContribution = addMoney(...components.map((item) => item.standardMonthly));
  const standardAnnualContribution = multiplyMoney(standardMonthlyContribution, input.activeMonths);
  const commonContingenciesMonthly = components.find((component) => component.id === "commonContingencies")!.standardMonthly;
  const activeMonthNumbers = Array.from({ length: input.activeMonths }, (_, index) => activeFromMonth + index);
  const bonusPeriods = input.applyCeutaBonus ? rules.ceutaBonusPeriods.map((period) => {
    const monthCount = activeMonthNumbers.filter((month) => month >= period.fromMonth && month <= period.throughMonth).length;
    return {
      id: period.id,
      monthCount,
      fromMonth: period.fromMonth,
      throughMonth: period.throughMonth,
      basisPoints: period.commonContingenciesBonusBasisPoints,
      saving: multiplyMoney(applyBasisPoints(commonContingenciesMonthly, period.commonContingenciesBonusBasisPoints), monthCount),
    };
  }).filter((period) => period.monthCount > 0) : [];
  const annualSaving = addMoney(...bonusPeriods.map((period) => period.saving));
  const finalAnnualContribution = euro(standardAnnualContribution.cents - annualSaving.cents);
  const monthlySaving = euro(Math.round(annualSaving.cents / input.activeMonths));
  const finalMonthlyContribution = euro(Math.round(finalAnnualContribution.cents / input.activeMonths));
  const averagedComponents = components.map((component) => component.id === "commonContingencies" ? {
    ...component,
    savingMonthly: monthlySaving,
    finalMonthly: euro(component.standardMonthly.cents - monthlySaving.cents),
  } : component);

  return {
    computableAnnualReturn,
    averageMonthlyReturn,
    bracket,
    selectedMonthlyBase,
    components: averagedComponents,
    standardMonthlyContribution,
    finalMonthlyContribution,
    monthlySaving,
    standardAnnualContribution,
    finalAnnualContribution,
    annualSaving,
    bonusPeriods,
    lines: [
      {
        id: "reta-computable-return",
        label: "Rendimiento computable RETA",
        amount: computableAnnualReturn,
        operation: "RESULT",
        explanation: `Rendimiento neto anual menos ${genericExpenseBasisPoints / 100}% de gastos genéricos.`,
      },
      {
        id: "reta-standard-contribution",
        label: "Cuota RETA anual sin bonificación Ceuta",
        amount: standardAnnualContribution,
        operation: "SUBTRACT",
        explanation: "Suma de los componentes oficiales aplicada a la base mínima del tramo seleccionado.",
      },
      {
        id: "reta-ceuta-saving",
        label: "Ahorro anual por bonificación Ceuta",
        amount: annualSaving,
        operation: "ADD",
        explanation: bonusPeriods.map((period) => `${period.basisPoints / 100}% durante ${period.monthCount} meses`).join("; ") + ", únicamente sobre contingencias comunes.",
      },
    ],
    assumptions: [
      "Se selecciona por defecto la base mínima permitida dentro del tramo.",
      `Alta durante ${input.activeMonths} meses completos.`,
      input.applyCeutaBonus
        ? "La elegibilidad Ceuta se suministra como supuesto separado y no se deduce del importe."
        : "No se aplica la bonificación Ceuta.",
    ],
    ruleRefs: rules.ruleRefs,
  };
};
