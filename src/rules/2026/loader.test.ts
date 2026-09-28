import { describe, expect, it } from "vitest";
import { load2026RuleCatalog } from "./loader";

describe("2026 rule catalog", () => {
  it("validates every source and rule", () => {
    const catalog = load2026RuleCatalog();
    expect(catalog.sources).toHaveLength(19);
    expect(catalog.rules).toHaveLength(8);
  });
  it("versions the October 2026 increase in the Ceuta autónomo bonus", () => {
    const rules = load2026RuleCatalog().rules.filter((rule) => rule.id.startsWith("SS-CEUTA-AUTONOMO-2026"));
    expect(rules.map((rule) => rule.parameters.bonusBasisPoints)).toEqual([5000, 7500]);
    expect(rules[1].effectiveFrom).toBe("2026-10-01");
  });
  it("publishes the verified 2026 indefinite-hiring windows", () => {
    const grant = load2026RuleCatalog().rules.find((rule) => rule.id === "PROCESA-CONTRATACION-INDEFINIDA-2026");
    expect(grant?.status).toBe("PUBLISHED");
    expect(grant?.parameters.hireMustFollowApplication).toBe(true);
    expect(grant?.parameters.fifthWindowClosesAt).toBe("2026-09-30T13:00:00+02:00");
  });
  it("keeps an unverified grant disabled", () => {
    const grant = load2026RuleCatalog().rules.find((rule) => rule.id === "PROCESA-AUTOEMPLEO-2026-CALL");
    expect(grant?.status).toBe("NEEDS_VERIFICATION");
    expect(grant?.parameters.calculationEnabled).toBe(false);
  });
});
