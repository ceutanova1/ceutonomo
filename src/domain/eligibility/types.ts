export type EligibilityStatus =
  | "ELIGIBLE"
  | "POTENTIALLY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "NEEDS_VERIFICATION";

export type EligibilityResult = Readonly<{
  benefitId: string;
  status: EligibilityStatus;
  reasons: string[];
  missingFacts: string[];
  warnings: string[];
  ruleRefs: string[];
}>;

