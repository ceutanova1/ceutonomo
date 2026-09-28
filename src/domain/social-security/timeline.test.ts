import { describe, expect, it } from "vitest";

import { parseEuro } from "@/domain/money";
import { reta2026Rules } from "@/rules/2026/reta";

import { calculateRetaContribution } from "./reta";
import { buildThreeYearRetaTimeline } from "./timeline";

describe("three-year RETA timeline", () => {
  it("calculates only the sourced year and marks future years unverified", () => {
    const contribution = calculateRetaContribution({ annualNetReturnBeforeGenericDeduction: parseEuro("70800"), activeMonths: 12, isSocietaryAutonomo: false, applyCeutaBonus: true }, reta2026Rules);
    const timeline = buildThreeYearRetaTimeline(2026, contribution);
    expect(timeline.map((year) => year.status)).toEqual(["CALCULATED", "NEEDS_VERIFICATION", "NEEDS_VERIFICATION"]);
    expect(timeline[0].appliedIncentive).toBe("50% × 9 meses · 75% × 3 meses");
    expect(timeline[1].standardContribution).toBeNull();
  });
});
