export type ScenarioReport = Readonly<{
  schemaVersion: "1.0";
  generatedAt: string;
  product: "CEUTONOMO";
  taxYear: 2026;
  locale: "es" | "en";
  notice: string;
  profile: Readonly<Record<string, string | number | boolean>>;
  assumptions: Readonly<Record<string, string | number | boolean>>;
  results: Readonly<Record<string, number>>;
  warnings: readonly string[];
  sources: readonly Readonly<{ id: string; title: string; url: string; verifiedAt: string }>[];
}>;

export type ScenarioReportDraft = Omit<ScenarioReport, "schemaVersion" | "generatedAt" | "product" | "taxYear" | "notice">;

const NOTICE = {
  es: "Estimación informativa. No sustituye asesoramiento fiscal, laboral, mercantil o jurídico cualificado.",
  en: "Informational estimate. It does not replace qualified tax, employment, commercial or legal advice.",
} as const;

export const finalizeScenarioReport = (draft: ScenarioReportDraft, generatedAt = new Date()): ScenarioReport => ({
  ...draft,
  schemaVersion: "1.0",
  generatedAt: generatedAt.toISOString(),
  product: "CEUTONOMO",
  taxYear: 2026,
  notice: NOTICE[draft.locale],
});

const escapeCsv = (value: string | number | boolean): string => {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const flatRows = (report: ScenarioReport): Array<[string, string | number | boolean]> => [
  ["meta.schemaVersion", report.schemaVersion],
  ["meta.generatedAt", report.generatedAt],
  ["meta.product", report.product],
  ["meta.taxYear", report.taxYear],
  ["meta.locale", report.locale],
  ["meta.notice", report.notice],
  ...Object.entries(report.profile).map(([key, value]) => [`profile.${key}`, value] as [string, string | number | boolean]),
  ...Object.entries(report.assumptions).map(([key, value]) => [`assumptions.${key}`, value] as [string, string | number | boolean]),
  ...Object.entries(report.results).map(([key, value]) => [`results.${key}`, value] as [string, string | number | boolean]),
  ...report.warnings.map((warning, index) => [`warnings.${index + 1}`, warning] as [string, string | number | boolean]),
  ...report.sources.flatMap((source, index) => Object.entries(source).map(([key, value]) => [`sources.${index + 1}.${key}`, value] as [string, string | number | boolean])),
];

export const scenarioReportToCsv = (report: ScenarioReport): string =>
  ["field,value", ...flatRows(report).map(([field, value]) => `${escapeCsv(field)},${escapeCsv(value)}`)].join("\r\n");

const escapeXml = (value: string | number | boolean): string => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const xmlRecord = (name: string, values: Readonly<Record<string, string | number | boolean>>, indent = "  ") => {
  const children = Object.entries(values).map(([key, value]) => `${indent}  <field name="${escapeXml(key)}">${escapeXml(value)}</field>`).join("\n");
  return `${indent}<${name}>\n${children}\n${indent}</${name}>`;
};

export const scenarioReportToXml = (report: ScenarioReport): string => `<?xml version="1.0" encoding="UTF-8"?>
<ceutonomoScenario schemaVersion="${report.schemaVersion}" generatedAt="${report.generatedAt}">
  <product>${report.product}</product>
  <taxYear>${report.taxYear}</taxYear>
  <locale>${report.locale}</locale>
  <notice>${escapeXml(report.notice)}</notice>
${xmlRecord("profile", report.profile)}
${xmlRecord("assumptions", report.assumptions)}
${xmlRecord("results", report.results)}
  <warnings>
${report.warnings.map((warning) => `    <warning>${escapeXml(warning)}</warning>`).join("\n")}
  </warnings>
  <sources>
${report.sources.map((source) => `    <source id="${escapeXml(source.id)}" verifiedAt="${escapeXml(source.verifiedAt)}"><title>${escapeXml(source.title)}</title><url>${escapeXml(source.url)}</url></source>`).join("\n")}
  </sources>
</ceutonomoScenario>\n`;

export const scenarioReportToJson = (report: ScenarioReport): string => `${JSON.stringify(report, null, 2)}\n`;
