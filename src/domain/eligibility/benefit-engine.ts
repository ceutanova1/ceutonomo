import type { BusinessProfileFacts } from "@/domain/profile";

import type { EligibilityResult, EligibilityStatus } from "./types";

export type ProfileFact = keyof BusinessProfileFacts;

export type BenefitCondition = Readonly<{
  fact: ProfileFact;
  label: string;
  test: (value: BusinessProfileFacts[ProfileFact], profile: BusinessProfileFacts) => boolean;
  failureReason: string;
}>;

export type ConfiguredBenefitRule = Readonly<{
  id: string;
  name: string;
  category: "TAX" | "SOCIAL_SECURITY" | "GRANT";
  jurisdiction: "SPAIN" | "CEUTA";
  ruleRefs: string[];
  sourceIds: string[];
  conditions: BenefitCondition[];
  positiveStatus: Extract<EligibilityStatus, "ELIGIBLE" | "POTENTIALLY_ELIGIBLE">;
  successReason: string;
  warnings: string[];
}>;

export type EvaluatedBenefit = EligibilityResult & Readonly<{
  name: string;
  category: ConfiguredBenefitRule["category"];
  sourceIds: string[];
}>;

export const evaluateBenefitRule = (
  rule: ConfiguredBenefitRule,
  profile: BusinessProfileFacts,
): EvaluatedBenefit => {
  const missingFacts = rule.conditions
    .filter(({ fact }) => profile[fact] === undefined || profile[fact] === "")
    .map(({ label }) => label);

  if (missingFacts.length > 0) {
    return {
      benefitId: rule.id,
      name: rule.name,
      category: rule.category,
      status: "NEEDS_VERIFICATION",
      reasons: [],
      missingFacts,
      warnings: rule.warnings,
      ruleRefs: rule.ruleRefs,
      sourceIds: rule.sourceIds,
    };
  }

  const failed = rule.conditions.filter(({ fact, test }) => !test(profile[fact], profile));
  if (failed.length > 0) {
    return {
      benefitId: rule.id,
      name: rule.name,
      category: rule.category,
      status: "NOT_ELIGIBLE",
      reasons: failed.map(({ failureReason }) => failureReason),
      missingFacts: [],
      warnings: [],
      ruleRefs: rule.ruleRefs,
      sourceIds: rule.sourceIds,
    };
  }

  return {
    benefitId: rule.id,
    name: rule.name,
    category: rule.category,
    status: rule.positiveStatus,
    reasons: [rule.successReason],
    missingFacts: [],
    warnings: rule.warnings,
    ruleRefs: rule.ruleRefs,
    sourceIds: rule.sourceIds,
  };
};

export const evaluateBenefitRules = (
  rules: ConfiguredBenefitRule[],
  profile: BusinessProfileFacts,
): EvaluatedBenefit[] => rules.map((rule) => evaluateBenefitRule(rule, profile));
