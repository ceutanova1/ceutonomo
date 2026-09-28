import { addMoney, applyBasisPoints, euro, subtractMoney, type Money } from "../money";

export type CorporateTaxRules = Readonly<{
  microFirstThreshold: Money;
  microFirstRateBasisPoints: number;
  microExcessRateBasisPoints: number;
  newCompanyRateBasisPoints: number;
  ceutaBonusBasisPoints: number;
  ruleRefs: string[];
}>;

export type CorporateTaxInput = Readonly<{
  taxableProfit: Money;
  qualifyingCeutaProfitBasisPoints: number;
  newCompanyReducedRateApplies: boolean;
}>;

export type CorporateTaxResult = Readonly<{
  normalCorporateTax: Money;
  ceutaBonus: Money;
  finalCorporateTax: Money;
  profitAfterTax: Money;
  effectiveRateBasisPoints: number;
  ruleRefs: string[];
}>;

export const calculateCorporateTax2026 = (input: CorporateTaxInput, rules: CorporateTaxRules): CorporateTaxResult => {
  if (input.taxableProfit.cents < 0) throw new RangeError("El beneficio imponible no puede ser negativo en esta simulación.");
  if (!Number.isInteger(input.qualifyingCeutaProfitBasisPoints) || input.qualifyingCeutaProfitBasisPoints < 0 || input.qualifyingCeutaProfitBasisPoints > 10_000) {
    throw new RangeError("El porcentaje de beneficio calificable debe estar entre 0% y 100%.");
  }

  const normalCorporateTax = input.newCompanyReducedRateApplies
    ? applyBasisPoints(input.taxableProfit, rules.newCompanyRateBasisPoints)
    : addMoney(
      applyBasisPoints(euro(Math.min(input.taxableProfit.cents, rules.microFirstThreshold.cents)), rules.microFirstRateBasisPoints),
      applyBasisPoints(euro(Math.max(0, input.taxableProfit.cents - rules.microFirstThreshold.cents)), rules.microExcessRateBasisPoints),
    );
  const attributableQuota = applyBasisPoints(normalCorporateTax, input.qualifyingCeutaProfitBasisPoints);
  const ceutaBonus = applyBasisPoints(attributableQuota, rules.ceutaBonusBasisPoints);
  const finalCorporateTax = subtractMoney(normalCorporateTax, ceutaBonus);
  const profitAfterTax = subtractMoney(input.taxableProfit, finalCorporateTax);

  return {
    normalCorporateTax,
    ceutaBonus,
    finalCorporateTax,
    profitAfterTax,
    effectiveRateBasisPoints: input.taxableProfit.cents === 0 ? 0 : Math.round(finalCorporateTax.cents * 10_000 / input.taxableProfit.cents),
    ruleRefs: rules.ruleRefs,
  };
};
