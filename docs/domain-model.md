# Tax and Benefit Domain Model

## Core value objects

- `Money`: ISO currency plus integer minor units; checked arithmetic and explicit rounding.
- `Rate`: integer basis points; cannot exceed configured bounds.
- `TaxYear`: supported year with a published ruleset.
- `DateRange`: inclusive effective/application periods.
- `RuleRef`: stable rule ID, version, and source references.
- `QualifyingShare`: independently supplied or rules-derived percentage of income attributable to Ceuta.

## Eligibility

```ts
type EligibilityStatus =
  | "ELIGIBLE"
  | "POTENTIALLY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "NEEDS_VERIFICATION";

interface EligibilityResult {
  benefitId: string;
  ruleRef: RuleRef;
  status: EligibilityStatus;
  reasons: Reason[];
  missingFacts: FactRequest[];
  warnings: Warning[];
}
```

Rules use typed predicates over normalized facts. Unknown facts propagate to `NEEDS_VERIFICATION`; they never silently become `false` or `true`.

## Benefit rule

```ts
interface BenefitRule {
  id: string;
  version: string;
  name: string;
  category: "TAX" | "SOCIAL_SECURITY" | "GRANT";
  jurisdiction: string;
  legalBasis: string[];
  sourceRefs: string[];
  effectivePeriod: DateRange;
  eligibility: EligibilityExpression;
  incompatibleBenefits: string[];
  compatibleBenefits: string[];
  calculation: CalculationDefinition;
  applicationWindow?: DateRange;
  applyBeforeStartingActivity: TriState;
  investmentMayStartBeforeApplication: TriState;
  requiredDocuments: DocumentRequirement[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  lastVerified: string;
}
```

## Separate economic concepts

- `TaxLiability`: compulsory tax under the selected rules.
- `TaxSaving`: difference attributable to a named tax rule against a defined baseline.
- `Contribution`: Social Security payment.
- `ContributionSaving`: reduction against the configured non-incentivized contribution.
- `Grant`: conditional one-time or staged public funding; excluded from totals unless at least potentially eligible.
- `CashFlow`: money movement by period, including timing.
- `NetIncome`: revenue less eligible costs, contributions, and taxes under a stated definition.

No type is interchangeable with another, preventing a grant from appearing as a recurring tax reduction.

## Traceable output

Every calculator returns:

- semantic totals;
- ordered calculation line items;
- assumptions and input facts;
- eligibility results;
- warnings and professional-verification flags;
- exact rule/source references;
- selected tax year and verification date;
- deterministic fingerprint.

