import { describe, expect, it } from "vitest";

import { demoBusinessProfile } from "@/domain/profile";
import { benefitRules2026 } from "@/rules/2026/benefits";
import sources from "@/rules/2026/sources.json";

import { evaluateBenefitRules } from "./benefit-engine";

describe("benefit eligibility engine", () => {
  it("keeps administratively interpreted benefits potential for the demo profile", () => {
    const results = evaluateBenefitRules(benefitRules2026, demoBusinessProfile);
    const sourceIds = new Set(sources.map((source) => source.id));

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.status === "POTENTIALLY_ELIGIBLE")).toBe(true);
    expect(results.every((result) => result.ruleRefs.length >= 1)).toBe(true);
    expect(results.find((result) => result.category === "SOCIAL_SECURITY")?.ruleRefs).toHaveLength(2);
    expect(results.every((result) => result.sourceIds.length > 0)).toBe(true);
    expect(results.flatMap((result) => result.sourceIds).every((sourceId) => sourceIds.has(sourceId))).toBe(true);
  });

  it("does not infer an unanswered fact", () => {
    const results = evaluateBenefitRules(benefitRules2026, {
      ...demoBusinessProfile,
      coveredCeutaSocialSecuritySector: undefined,
    });
    const reta = results.find((result) => result.category === "SOCIAL_SECURITY");

    expect(reta?.status).toBe("NEEDS_VERIFICATION");
    expect(reta?.missingFacts).toContain("Sector incluido en la bonificación");
  });

  it("explains failed conditions instead of returning a false positive", () => {
    const results = evaluateBenefitRules(benefitRules2026, {
      ...demoBusinessProfile,
      residentInCeuta: false,
    });

    expect(results.every((result) => result.status === "NOT_ELIGIBLE")).toBe(true);
    expect(results.every((result) => result.reasons.length > 0)).toBe(true);
  });
});
