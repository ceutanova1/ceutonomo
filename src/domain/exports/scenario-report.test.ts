import { describe, expect, it } from "vitest";

import { finalizeScenarioReport, scenarioReportToCsv, scenarioReportToJson, scenarioReportToXml } from "./scenario-report";

const report = finalizeScenarioReport({
  locale: "es",
  profile: { age: 35, residentInCeuta: true },
  assumptions: { activity: "Consultoría, software" },
  results: { annualRevenueCents: 7_560_000, netAnnualIncomeCents: 6_100_200 },
  warnings: ["No incluye IPSI & otras deducciones."],
  sources: [{ id: "BOE-1", title: "Ley <oficial>", url: "https://example.test/?a=1&b=2", verifiedAt: "2026-09-28" }],
}, new Date("2026-10-03T12:00:00.000Z"));

describe("scenario report exports", () => {
  it("creates a stable, machine-readable JSON envelope", () => {
    const parsed = JSON.parse(scenarioReportToJson(report));
    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.generatedAt).toBe("2026-10-03T12:00:00.000Z");
    expect(parsed.results.netAnnualIncomeCents).toBe(6_100_200);
  });

  it("localizes the advisory notice", () => {
    expect(report.notice).toContain("Estimación informativa");
    expect(finalizeScenarioReport({ ...report, locale: "en" }).notice).toContain("Informational estimate");
  });

  it("escapes CSV values without losing cents", () => {
    const csv = scenarioReportToCsv(report);
    expect(csv).toContain('assumptions.activity,"Consultoría, software"');
    expect(csv).toContain("results.annualRevenueCents,7560000");
  });

  it("escapes XML content and includes source provenance", () => {
    const xml = scenarioReportToXml(report);
    expect(xml).toContain("No incluye IPSI &amp; otras deducciones.");
    expect(xml).toContain("Ley &lt;oficial&gt;");
    expect(xml).toContain("a=1&amp;b=2");
  });
});
