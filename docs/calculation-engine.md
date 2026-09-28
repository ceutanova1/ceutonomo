# Calculation Engine Design

## Pipeline

```text
raw form data
 -> Zod parsing and normalization
 -> eligibility fact derivation
 -> ruleset resolution
 -> revenue and deductible-expense calculation
 -> contribution baseline and incentive calculation
 -> taxable-profit calculation
 -> ordinary tax calculation
 -> Ceuta-attributable quota calculation
 -> Ceuta benefit calculation
 -> grants evaluation (not cash unless award assumptions say so)
 -> cash-flow/net-income aggregation
 -> transparent trace and warnings
```

## Pure functions

- `calculateRevenue(input): Calculation<Money>`
- `calculateDeductibleExpenses(expenses): Calculation<Money>`
- `calculateAutonomoContribution(input, rules): ContributionResult`
- `calculateIrpf(input, rules): TaxResult`
- `calculateCeutaIrpfDeduction(input, ordinaryTax, rules): BenefitResult`
- `calculateCorporateTax(input, rules): TaxResult`
- `calculateCeutaCorporateTaxBenefit(input, tax, rules): BenefitResult`
- `calculateDividendTax(input, rules): TaxResult`
- `calculateNetIncome(input): NetIncomeResult`
- `compareStructures(autonomo, company): StructureComparison`

## Money and rounding

- Inputs are parsed from decimal strings into integer cents.
- Multiplication by rates uses integer basis points and a named rounding policy.
- Intermediate values retain sufficient precision; legally required rounding is applied at the documented stage.
- No calculation accepts JavaScript floating-point money values.

## IRPF sequence

1. Determine net taxable income from verified inputs.
2. Apply the complete ordinary 2026 IRPF calculation.
3. Determine qualifying Ceuta income separately from residence.
4. Attribute the relevant gross quota using the official proportional method.
5. Apply the configured deduction to that attributable quota.
6. Return ordinary estimate, deduction, final estimate, effective rate, and saving as separate values.

If required personal/family facts or verified scales are absent, the engine returns an incomplete calculation with missing facts; it never substitutes a flat rate.

## Contribution sequence

1. Determine the provisional income bracket and allowed contribution-base range.
2. Calculate contribution components.
3. Evaluate each incentive independently.
4. Resolve compatibility and precedence explicitly.
5. Apply only the legally compatible incentive set.
6. Emit a month/year timeline with baseline, incentive, final contribution, and saving.

## Testing strategy

- Unit tests for every pure formula and rule predicate.
- Table tests for €0, €20k, €50k, €75.6k, €100k, €150k, and €250k.
- Eligibility tests for resident/non-resident, activity location, sector, partial Ceuta income, new/existing autónomo, and missing facts.
- Golden regression fixtures tied to exact ruleset checksums.
- Property tests for invariants: non-negative liabilities, benefit never exceeding attributable quota, and totals reconciling to line items.
- Integration tests validate rule loading and persistence; Playwright covers the wizard-to-explanation journey.

