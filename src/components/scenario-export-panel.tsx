"use client";

import { Download, FileJson2, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

import {
  finalizeScenarioReport,
  scenarioReportToCsv,
  scenarioReportToJson,
  scenarioReportToXml,
  type ScenarioReport,
  type ScenarioReportDraft,
} from "@/domain/exports/scenario-report";

type ScenarioExportPanelProps = Readonly<{
  draft: ScenarioReportDraft;
  locale: "es" | "en";
}>;

const downloadText = (content: string, mimeType: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const euroFromCents = (cents: number, locale: "es" | "en") => new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
}).format(cents / 100);

const reportLabels = {
  es: {
    age: "Edad",
    residentInCeuta: "Residencia efectiva en Ceuta",
    activityPerformedInCeuta: "Actividad realizada en Ceuta",
    legalStructure: "Estructura jurídica",
    revenueMethod: "Método de ingresos",
    qualifyingCeutaIncomePercentage: "Renta calificable en Ceuta",
    simplifiedDirectEstimation: "Estimación directa simplificada",
    dependentWorkerReduction: "Reducción incompatible",
    expenseLines: "Partidas de gasto",
    classifiedClientPercentage: "Clientes clasificados",
  },
  en: {
    age: "Age",
    residentInCeuta: "Effective residence in Ceuta",
    activityPerformedInCeuta: "Activity performed in Ceuta",
    legalStructure: "Legal structure",
    revenueMethod: "Revenue method",
    qualifyingCeutaIncomePercentage: "Ceuta-qualifying income",
    simplifiedDirectEstimation: "Simplified direct estimation",
    dependentWorkerReduction: "Incompatible reduction",
    expenseLines: "Expense lines",
    classifiedClientPercentage: "Classified clients",
  },
} as const;

const displayReportValue = (value: string | number | boolean, locale: "es" | "en") => {
  if (typeof value === "boolean") return value ? (locale === "es" ? "Sí" : "Yes") : "No";
  if (value === "DERIVED") return locale === "es" ? "Tarifa × actividad" : "Rate × activity";
  if (value === "MANUAL") return locale === "es" ? "Ingresos anuales" : "Annual revenue";
  return String(value);
};

const savePdf = async (report: ScenarioReport) => {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const newPage = () => {
    pdf.addPage();
    y = 20;
  };
  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 20) newPage();
  };
  const sectionTitle = (title: string) => {
    ensureSpace(14);
    pdf.setTextColor(8, 40, 63);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(title, margin, y);
    y += 8;
  };
  const line = (label: string, value: string) => {
    const lines = pdf.setFont("helvetica", "normal").setFontSize(9).splitTextToSize(`${label}: ${value}`, contentWidth);
    ensureSpace(lines.length * 5 + 2);
    pdf.setTextColor(50, 66, 79);
    pdf.text(lines, margin, y);
    y += lines.length * 5 + 2;
  };

  pdf.setFillColor(8, 40, 63);
  pdf.rect(0, 0, pageWidth, 48, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("CEUTONOMO", margin, 20);
  pdf.setFontSize(12);
  pdf.text(report.locale === "es" ? "Resumen de simulación 2026" : "2026 simulation summary", margin, 31);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(new Intl.DateTimeFormat(report.locale === "es" ? "es-ES" : "en-GB", { dateStyle: "long", timeStyle: "short" }).format(new Date(report.generatedAt)), margin, 40);
  y = 62;

  sectionTitle(report.locale === "es" ? "Resultado económico" : "Financial result");
  line(report.locale === "es" ? "Ingresos anuales" : "Annual revenue", euroFromCents(report.results.annualRevenueCents, report.locale));
  line(report.locale === "es" ? "Gastos deducibles" : "Deductible expenses", euroFromCents(report.results.deductibleExpensesCents, report.locale));
  line(report.locale === "es" ? "Cuota RETA final" : "Final RETA contribution", euroFromCents(report.results.retaContributionCents, report.locale));
  line(report.locale === "es" ? "IRPF general estimado" : "Estimated general income tax", euroFromCents(report.results.estimatedIrpfCents, report.locale));
  line(report.locale === "es" ? "Neto anual estimado" : "Estimated annual net", euroFromCents(report.results.netAnnualIncomeCents, report.locale));
  line(report.locale === "es" ? "Ahorro recurrente" : "Recurring saving", euroFromCents(report.results.recurringSavingCents, report.locale));

  y += 5;
  sectionTitle(report.locale === "es" ? "Perfil e hipótesis" : "Profile and assumptions");
  Object.entries(report.profile).forEach(([key, value]) => line(reportLabels[report.locale][key as keyof typeof reportLabels.es] ?? key, displayReportValue(value, report.locale)));
  Object.entries(report.assumptions).forEach(([key, value]) => line(reportLabels[report.locale][key as keyof typeof reportLabels.es] ?? key, displayReportValue(value, report.locale)));

  y += 5;
  sectionTitle(report.locale === "es" ? "Límites y advertencias" : "Limits and warnings");
  report.warnings.forEach((warning, index) => line(`${index + 1}`, warning));

  newPage();
  sectionTitle(report.locale === "es" ? "Fuentes oficiales" : "Official sources");
  line(
    report.locale === "es" ? "Trazabilidad" : "Traceability",
    report.locale === "es" ? "Registro de fuentes utilizado para esta simulación." : "Source register used for this simulation.",
  );
  report.sources.forEach((source) => {
    line(source.title, `${source.url} (${report.locale === "es" ? "verificada" : "verified"} ${source.verifiedAt})`);
  });

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(220, 228, 233);
    pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    pdf.setTextColor(91, 108, 125);
    pdf.setFontSize(7);
    pdf.text(report.notice, margin, pageHeight - 9, { maxWidth: contentWidth - 20 });
    pdf.text(`${page}/${pages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
  }

  pdf.save("ceutonomo-simulacion-2026.pdf");
};

export function ScenarioExportPanel({ draft, locale }: ScenarioExportPanelProps) {
  const [status, setStatus] = useState<string | null>(null);
  const build = () => finalizeScenarioReport(draft);
  const done = (format: string) => {
    setStatus(locale === "es" ? `${format} preparado en este dispositivo.` : `${format} prepared on this device.`);
    window.setTimeout(() => setStatus(null), 3000);
  };

  const exportPdf = async () => {
    await savePdf(build());
    done("PDF");
  };
  const exportText = (format: "JSON" | "CSV" | "XML") => {
    const report = build();
    if (format === "JSON") downloadText(scenarioReportToJson(report), "application/json", "ceutonomo-simulacion-2026.json");
    if (format === "CSV") downloadText(scenarioReportToCsv(report), "text/csv", "ceutonomo-simulacion-2026.csv");
    if (format === "XML") downloadText(scenarioReportToXml(report), "application/xml", "ceutonomo-simulacion-2026.xml");
    done(format);
  };

  return (
    <section className="export-panel" aria-labelledby="export-title">
      <div><p className="eyebrow">{locale === "es" ? "INFORME PORTABLE" : "PORTABLE REPORT"}</p><h2 id="export-title">{locale === "es" ? "Conserva tu escenario con sus límites y fuentes." : "Keep your scenario with its limits and sources."}</h2><p>{locale === "es" ? "La exportación se crea en este dispositivo. No enviamos tu escenario al servidor." : "The export is created on this device. Your scenario is not sent to the server."}</p></div>
      <div className="export-actions" aria-label={locale === "es" ? "Formatos de exportación" : "Export formats"}>
        <button type="button" className="primary-button" onClick={exportPdf}><FileText aria-hidden="true" size={16} /> PDF</button>
        <button type="button" className="secondary-button" onClick={() => exportText("CSV")}><FileSpreadsheet aria-hidden="true" size={16} /> CSV</button>
        <button type="button" className="secondary-button" onClick={() => exportText("JSON")}><FileJson2 aria-hidden="true" size={16} /> JSON</button>
        <button type="button" className="secondary-button" onClick={() => exportText("XML")}><Download aria-hidden="true" size={16} /> XML</button>
      </div>
      <p className="export-status" aria-live="polite">{status}</p>
    </section>
  );
}
