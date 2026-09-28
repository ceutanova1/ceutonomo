import { describe, expect, it } from "vitest";
import { evaluateCeutaAutonomoBonus } from "./ceuta-autonomo-bonus";

describe("evaluateCeutaAutonomoBonus", () => {
  it("requires verification when facts are missing", () => {
    expect(evaluateCeutaAutonomoBonus({}).status).toBe("NEEDS_VERIFICATION");
  });
  it("does not treat residence alone as sufficient", () => {
    expect(evaluateCeutaAutonomoBonus({ residentInCeuta: true, activityPerformedInCeuta: false, coveredSector: true }).status).toBe("NOT_ELIGIBLE");
  });
  it("returns potential rather than definitive eligibility", () => {
    expect(evaluateCeutaAutonomoBonus({ residentInCeuta: true, activityPerformedInCeuta: true, coveredSector: true }).status).toBe("POTENTIALLY_ELIGIBLE");
  });
});

