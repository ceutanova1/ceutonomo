"use client";

import { AlertTriangle, Building2, ExternalLink, ShieldCheck, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { euro, formatEuro, parseEuro, subtractMoney } from "@/domain/money";
import { calculateCorporateTax2026 } from "@/domain/tax/corporate-tax";
import { corporateTax2026Rules } from "@/rules/2026/corporate-tax";

type StructureComparisonProps = Readonly<{
  locale: "es" | "en";
  annualRevenueCents: number;
  autonomoExpenseCents: number;
  autonomoNetCents: number;
}>;

const percentageToBasisPoints = (value: string) => Math.min(10_000, Math.max(0, Math.round(Number(value || 0) * 100)));

export function StructureComparison({ locale, annualRevenueCents, autonomoExpenseCents, autonomoNetCents }: StructureComparisonProps) {
  const en = locale === "en";
  const [directorSalary, setDirectorSalary] = useState("30000");
  const [companyAdminCosts, setCompanyAdminCosts] = useState("2400");
  const [qualifyingProfit, setQualifyingProfit] = useState("100");
  const [newCompanyRate, setNewCompanyRate] = useState(true);

  const company = useMemo(() => {
    try {
      const profit = subtractMoney(
        subtractMoney(subtractMoney(euro(annualRevenueCents), euro(autonomoExpenseCents)), parseEuro(directorSalary || "0")),
        parseEuro(companyAdminCosts || "0"),
      );
      return { profit, tax: calculateCorporateTax2026({ taxableProfit: profit, qualifyingCeutaProfitBasisPoints: percentageToBasisPoints(qualifyingProfit), newCompanyReducedRateApplies: newCompanyRate }, corporateTax2026Rules), error: null };
    } catch (error) {
      return { profit: null, tax: null, error: error instanceof Error ? error.message : "Revisa los importes." };
    }
  }, [annualRevenueCents, autonomoExpenseCents, directorSalary, companyAdminCosts, qualifyingProfit, newCompanyRate]);

  return (
    <section className="comparison-workspace">
      <header className="workspace-header compact-header"><div><p className="eyebrow">{en ? "2026 COMPARISON · FIRST ESTIMATE" : "COMPARADOR 2026 · PRIMERA APROXIMACIÓN"}</p><h1>{en ? "Self-employed income and company profit do not go into the same pocket." : "Autónomo y SL no guardan el dinero en el mismo bolsillo."}</h1><p className="lede">{en ? "We compare a self-employed person’s disposable income with profit retained by the company. Salary and dividends require their own personal taxation before a comparable total net can be calculated." : "Comparamos renta disponible del autónomo con beneficio retenido en la sociedad. El salario y los dividendos requieren su propia tributación personal antes de calcular un neto total comparable."}</p></div><span className="privacy-pill"><ShieldCheck size={15} /> {en ? "Official 2026 rules" : "Reglas oficiales 2026"}</span></header>

      <div className="comparison-controls">
        <label>{en ? "Director’s gross salary" : "Salario bruto del administrador"}<span className="money-input"><b>€</b><input value={directorSalary} inputMode="decimal" onChange={(event) => setDirectorSalary(event.target.value)} /></span></label>
        <label>{en ? "Annual administration costs" : "Costes administrativos anuales"}<span className="money-input"><b>€</b><input value={companyAdminCosts} inputMode="decimal" onChange={(event) => setCompanyAdminCosts(event.target.value)} /></span></label>
        <label>{en ? "Profit qualifying in Ceuta" : "Beneficio calificable en Ceuta"} <b>{qualifyingProfit}%</b><input type="range" min="0" max="100" step="5" value={qualifyingProfit} onChange={(event) => setQualifyingProfit(event.target.value)} /></label>
        <label className="comparison-check"><input type="checkbox" checked={newCompanyRate} onChange={(event) => setNewCompanyRate(event.target.checked)} /><span><b>{en ? "The company qualifies for the 15% new-company rate" : "La entidad cumple el tipo del 15% de nueva creación"}</b><small>{en ? "Only the first positive tax period and the next one, subject to legal conditions." : "Solo primer período positivo y siguiente, si cumple las condiciones legales."}</small></span></label>
      </div>

      {company.error ? <p className="error-message">{company.error}</p> : <div className="structure-grid">
        <article className="structure-card"><header><UserRound size={20} /><div><small>{en ? "INDIVIDUAL" : "PERSONA FÍSICA"}</small><h2>{en ? "Self-employed" : "Autónomo"}</h2></div></header><dl><div><dt>{en ? "Revenue" : "Ingresos"}</dt><dd>{formatEuro(euro(annualRevenueCents))}</dd></div><div><dt>{en ? "Modelled expenses" : "Gastos modelados"}</dt><dd>− {formatEuro(euro(autonomoExpenseCents))}</dd></div><div className="structure-total"><dt>{en ? "Estimated personal net" : "Neto personal estimado"}</dt><dd>{formatEuro(euro(autonomoNetCents))}</dd></div></dl><p>{en ? "Includes expenses, RETA and general income tax from the main scenario." : "Incluye gastos, RETA e IRPF general del escenario principal."}</p></article>
        <article className="structure-card company-card"><header><Building2 size={20} /><div><small>{en ? "LEGAL ENTITY" : "PERSONA JURÍDICA"}</small><h2>SL / SLU</h2></div></header><dl><div><dt>{en ? "Profit before corporate tax" : "Beneficio antes de IS"}</dt><dd>{formatEuro(company.profit!)}</dd></div><div><dt>{en ? "Corporate tax before Ceuta" : "IS antes de Ceuta"}</dt><dd>− {formatEuro(company.tax!.normalCorporateTax)}</dd></div><div><dt>{en ? "60% Ceuta relief" : "Bonificación Ceuta 60%"}</dt><dd className="positive">+ {formatEuro(company.tax!.ceutaBonus)}</dd></div><div><dt>{en ? "Estimated final corporate tax" : "IS final estimado"}</dt><dd>− {formatEuro(company.tax!.finalCorporateTax)}</dd></div><div className="structure-total"><dt>{en ? "Profit retained after tax" : "Beneficio retenido tras IS"}</dt><dd>{formatEuro(company.tax!.profitAfterTax)}</dd></div></dl><p>{en ? `The gross salary of ${formatEuro(parseEuro(directorSalary || "0"))} is already deducted as an expense, but personal income tax, company-director RETA and possible dividends are not yet included in the owner’s net income.` : `El salario bruto de ${formatEuro(parseEuro(directorSalary || "0"))} ya se resta como gasto, pero su IRPF personal, RETA societario y posibles dividendos aún no se suman al neto del propietario.`}</p></article>
      </div>}

      <div className="comparison-warning"><AlertTriangle size={18} /><div><b>{en ? "This is not yet a recommendation of legal structure." : "No es todavía una recomendación de estructura."}</b><p>{en ? "A final comparison still requires salary income tax, company-director social security, dividend taxation, corporate costs and validation that the company genuinely operates in Ceuta." : "Para una comparación final faltan IRPF del salario, cotización del autónomo societario, fiscalidad de dividendos, costes mercantiles y validación de que la entidad opera efectiva y materialmente en Ceuta."}</p></div></div>
      <footer className="comparison-sources"><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-sociedades-2025/principales-novedades-impuesto-sobre-sociedades-2025/tipos-gravamen.html" target="_blank" rel="noreferrer">{en ? "2026 corporate tax rates" : "Tipos de Sociedades 2026"} <ExternalLink size={13} /></a><a href="https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/novedades-impuesto-sobre-sociedades/novedades-normativa-2026.html" target="_blank" rel="noreferrer">{en ? "60% Ceuta relief" : "Bonificación Ceuta 60%"} <ExternalLink size={13} /></a></footer>
    </section>
  );
}
