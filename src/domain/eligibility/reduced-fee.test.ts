import { describe, expect, it } from "vitest";

import { evaluateReducedFee2026 } from "./reduced-fee";

describe("2026 reduced fee eligibility", () => {
  it("never invents a 2026 amount", () => {
    const result = evaluateReducedFee2026({ firstTimeAutonomo: true });
    expect(result.status).toBe("NEEDS_VERIFICATION");
    expect(result.missingFacts).toContain("Importe oficial de la cuota reducida para 2026");
  });

  it("requires prior-registration facts for a returning worker", () => {
    const result = evaluateReducedFee2026({ firstTimeAutonomo: false });
    expect(result.missingFacts).toContain("Fecha de la última baja en RETA");
    expect(result.missingFacts).toContain("Si disfrutó antes de una cuota reducida");
  });

  it("rejects a return before the three-year wait when previously used", () => {
    const result = evaluateReducedFee2026({
      firstTimeAutonomo: false,
      previousAutonomoEndDate: "2024-01-01",
      previouslyUsedReducedFee: true,
      plannedStartDate: "2026-01-01",
    });
    expect(result.status).toBe("NOT_ELIGIBLE");
    expect(result.reasons[0]).toContain("3 años");
  });
});

