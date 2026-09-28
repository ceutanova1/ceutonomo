import { describe, expect, it } from "vitest";

import { demoBusinessProfile } from "@/domain/profile";
import { procesaIndefiniteHiring2026 } from "@/rules/2026/grant-programs";

import { evaluateHiringGrant, getGrantWindowState } from "./grant-program";

describe("PROCESA grant windows", () => {
  it("keeps the fifth window open until the published hour", () => {
    expect(getGrantWindowState(procesaIndefiniteHiring2026.windows, new Date("2026-09-30T12:59:59+02:00")).windowStatus).toBe("OPEN");
    expect(getGrantWindowState(procesaIndefiniteHiring2026.windows, new Date("2026-09-30T13:00:01+02:00")).windowStatus).toBe("UPCOMING");
  });

  it("opens the sixth window on 1 October", () => {
    const state = getGrantWindowState(procesaIndefiniteHiring2026.windows, new Date("2026-10-01T00:00:00+02:00"));
    expect(state.windowStatus).toBe("OPEN");
    expect(state.activeWindow?.id).toBe("sixth-2026");
  });

  it("does not suggest a hiring grant when no hiring is planned", () => {
    const result = evaluateHiringGrant(procesaIndefiniteHiring2026, demoBusinessProfile, new Date("2026-09-28T12:00:00+02:00"));
    expect(result.windowStatus).toBe("OPEN");
    expect(result.status).toBe("NOT_ELIGIBLE");
  });

  it("requires candidate and workforce facts before showing potential eligibility", () => {
    const result = evaluateHiringGrant(
      procesaIndefiniteHiring2026,
      { ...demoBusinessProfile, employeesPlanned: 1 },
      new Date("2026-09-28T12:00:00+02:00"),
    );
    expect(result.status).toBe("NEEDS_VERIFICATION");
    expect(result.missingFacts).toHaveLength(3);
    expect(result.warnings.join(" ")).toContain("antes de formalizar");
  });
});
