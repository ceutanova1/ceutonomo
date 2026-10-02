"use client";

import { AlertTriangle, ArrowRight, BadgeEuro, BookOpenText, CalendarClock, Check, CircleHelp, ExternalLink, FileCheck2, Landmark, MapPinned, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";

import { evaluateBenefitRules } from "@/domain/eligibility/benefit-engine";
import { evaluateReducedFee2026 } from "@/domain/eligibility/reduced-fee";
import { evaluateCeutaExtraordinaryAid2026 } from "@/domain/grants/ceuta-extraordinary-aid";
import { evaluateHiringGrant } from "@/domain/grants/grant-program";
import { euro, formatEuro } from "@/domain/money";
import type { BusinessProfileFacts } from "@/domain/profile";
import { localizeDomainText, pick, type AppLocale } from "@/lib/locale";
import { benefitRules2026 } from "@/rules/2026/benefits";
import { ceutaExtraordinaryAid2026Rules } from "@/rules/2026/direct-aid";
import { procesaIndefiniteHiring2026 } from "@/rules/2026/grant-programs";
import sources from "@/rules/2026/sources.json";

type ViewName = "Dashboard" | "Elegibilidad" | "Simulador" | "Autónomo vs SL" | "Beneficios" | "Ayudas" | "Hoja de ruta" | "Fuentes" | "Ebook";

type PhaseOneViewsProps = Readonly<{
  view: Extract<ViewName, "Simulador" | "Beneficios" | "Ayudas" | "Hoja de ruta" | "Fuentes">;
  locale: AppLocale;
  profile: BusinessProfileFacts;
  annualRevenueCents: number;
  annualNetCents: number;
  recurringSavingCents: number;
  onNavigate: (view: ViewName) => void;
}>;

const statusLabel = {
  es: { ELIGIBLE: "Elegible", POTENTIALLY_ELIGIBLE: "Potencial", NOT_ELIGIBLE: "No aplicable", NEEDS_VERIFICATION: "Faltan datos" },
  en: { ELIGIBLE: "Eligible", POTENTIALLY_ELIGIBLE: "Potential", NOT_ELIGIBLE: "Not applicable", NEEDS_VERIFICATION: "Missing facts" },
} as const;

export function PhaseOneViews({ view, locale, profile, annualRevenueCents, annualNetCents, recurringSavingCents, onNavigate }: PhaseOneViewsProps) {
  const benefits = useMemo(() => evaluateBenefitRules(benefitRules2026, profile), [profile]);
  const reducedFee = useMemo(() => evaluateReducedFee2026({ firstTimeAutonomo: profile.firstTimeAutonomo, previousAutonomoEndDate: profile.previousAutonomoEndDate, previouslyUsedReducedFee: profile.previouslyUsedReducedFee, plannedStartDate: profile.estimatedStartDate }), [profile]);
  const directAid = useMemo(() => evaluateCeutaExtraordinaryAid2026(profile, ceutaExtraordinaryAid2026Rules), [profile]);
  const hiringGrant = useMemo(() => evaluateHiringGrant(procesaIndefiniteHiring2026, profile, new Date()), [profile]);
  const allResults = [...benefits, reducedFee];
  const missingCount = allResults.reduce((total, result) => total + result.missingFacts.length, 0) + directAid.missingFacts.length + hiringGrant.missingFacts.length;
  const yesNo = (value: boolean | undefined) => value ? pick(locale, "sí", "yes") : pick(locale, "no", "no");

  if (view === "Simulador") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow={pick(locale, "SIMULADOR CONECTADO", "CONNECTED SIMULATOR")} title={pick(locale, "Un escenario. Un único resultado en toda la aplicación.", "One scenario. One result across the entire application.")} description={pick(locale, "Los datos económicos del dashboard y los hechos del diagnóstico se comparten. Al cambiar residencia, actividad o porcentaje de renta de Ceuta, las evaluaciones se actualizan en todas las vistas.", "The dashboard’s financial data and assessment facts are shared. Changing residence, activity or the Ceuta-income percentage updates every view.")} icon={<ShieldCheck />} />
      <div className="phase-summary-grid">
        <Metric label={pick(locale, "Ingresos anuales", "Annual revenue")} value={formatEuro(euro(annualRevenueCents))} detail={pick(locale, "Escenario económico actual", "Current financial scenario")} />
        <Metric label={pick(locale, "Neto anual estimado", "Estimated annual net")} value={formatEuro(euro(annualNetCents))} detail={pick(locale, "Después de gastos, RETA e IRPF general", "After expenses, RETA and general income tax")} featured />
        <Metric label={pick(locale, "Ahorro recurrente", "Recurring saving")} value={formatEuro(euro(recurringSavingCents))} detail={pick(locale, "IRPF Ceuta + bonificación RETA", "Ceuta income tax + RETA relief")} />
      </div>
      <div className="phase-action-panel">
        <div><p className="eyebrow">{pick(locale, "DATOS COMPARTIDOS", "SHARED DATA")}</p><h2>{pick(locale, "Perfil económico y diagnóstico sincronizados", "Synchronized financial profile and assessment")}</h2><p>{pick(locale, "Edad", "Age")}: {profile.age ?? pick(locale, "pendiente", "pending")} · {pick(locale, "Residencia en Ceuta", "Residence in Ceuta")}: {yesNo(profile.residentInCeuta)} · {pick(locale, "Actividad desde Ceuta", "Activity from Ceuta")}: {yesNo(profile.activityPerformedInCeuta)} · {pick(locale, "Renta calificable", "Qualifying income")}: {profile.qualifyingCeutaIncomePercentage ?? 0}%</p></div>
        <div className="phase-actions"><button type="button" className="secondary-button" onClick={() => onNavigate("Dashboard")}>{pick(locale, "Editar importes", "Edit amounts")}</button><button type="button" className="primary-button" onClick={() => onNavigate("Elegibilidad")}>{pick(locale, "Editar diagnóstico", "Edit assessment")} <ArrowRight size={15} /></button></div>
      </div>
    </section>
  );

  if (view === "Beneficios") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow={pick(locale, "BENEFICIOS 2026", "2026 BENEFITS")} title={pick(locale, "Solo ventajas que pueden explicarse y acreditarse.", "Only benefits that can be explained and evidenced.")} description={pick(locale, "Cada resultado responde al perfil compartido. Los datos incompletos permanecen como pendientes y nunca se convierten automáticamente en elegibilidad.", "Every result responds to the shared profile. Incomplete facts remain pending and never become eligibility automatically.")} icon={<BadgeEuro />} />
      <div className="result-summary phase-result-summary"><div><strong>{allResults.filter((item) => item.status === "ELIGIBLE" || item.status === "POTENTIALLY_ELIGIBLE").length}</strong><span>{pick(locale, "potenciales", "potential")}</span></div><div><strong>{allResults.filter((item) => item.status === "NEEDS_VERIFICATION").length}</strong><span>{pick(locale, "por completar", "to complete")}</span></div><div><strong>{allResults.filter((item) => item.status === "NOT_ELIGIBLE").length}</strong><span>{pick(locale, "no aplicables", "not applicable")}</span></div></div>
      <div className="phase-card-list">
        {benefits.map((item) => <ResultCard locale={locale} key={item.benefitId} title={item.name} category={item.category === "TAX" ? pick(locale, "Fiscal", "Tax") : pick(locale, "Seguridad Social", "Social Security")} status={item.status} reasons={item.reasons} missingFacts={item.missingFacts} sourceId={item.sourceIds[0]} />)}
        <ResultCard locale={locale} title={pick(locale, "Cuota reducida para nueva alta", "Reduced fee for a new registration")} category={pick(locale, "Seguridad Social", "Social Security")} status={reducedFee.status} reasons={reducedFee.reasons} missingFacts={reducedFee.missingFacts} sourceId="LETA-ART-38-TER" />
      </div>
    </section>
  );

  if (view === "Ayudas") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow={pick(locale, "AYUDAS VERIFICADAS", "VERIFIED GRANTS")} title={pick(locale, "Convocatorias, plazos y condiciones antes de actuar.", "Calls, deadlines and conditions before you act.")} description={pick(locale, "La disponibilidad de una ayuda no implica concesión. CEUTONOMO separa las convocatorias verificadas de los programas que todavía no publican una ventana aplicable.", "Availability does not mean an award. CEUTONOMO separates verified calls from programmes that have not yet published an applicable window.")} icon={<Landmark />} />
      <div className="grant-overview-grid">
        <article className="phase-card"><div className="phase-card-heading"><span>{pick(locale, "AEAT · AYUDA DIRECTA", "AEAT · DIRECT AID")}</span><b className={`status-chip status-${directAid.status.toLowerCase()}`}>{statusLabel[locale][directAid.status]}</b></div><h2>{pick(locale, "Apoyo directo a empresas y profesionales de Ceuta", "Direct support for Ceuta businesses and professionals")}</h2><strong className="phase-amount">{directAid.amountEuro ? `${directAid.amountEuro.toLocaleString(locale === "es" ? "es-ES" : "en-GB")} €` : pick(locale, "Según perfil", "Based on profile")}</strong><p>{pick(locale, "Solicitud hasta el 30 de noviembre de 2026. Exenta de IRPF o IS según corresponda.", "Applications close on 30 November 2026. Exempt from personal or corporate income tax, as applicable.")}</p><MissingFacts locale={locale} facts={directAid.missingFacts} /><SourceLink locale={locale} sourceId="AEAT-GC70-CEUTA-2026" /></article>
        <article className="phase-card"><div className="phase-card-heading"><span>{pick(locale, "PROCESA · CONTRATACIÓN", "PROCESA · HIRING")}</span><b className={`status-chip status-${hiringGrant.status.toLowerCase()}`}>{statusLabel[locale][hiringGrant.status]}</b></div><h2>{localizeDomainText(locale, hiringGrant.name)}</h2><strong className="phase-amount">7.350 €–10.265 €</strong><p>{pick(locale, "La contratación debe ser posterior a la solicitud y mantenerse durante 3 años.", "The hire must take place after the application and be maintained for three years.")}</p><MissingFacts locale={locale} facts={hiringGrant.missingFacts} /><SourceLink locale={locale} sourceId={hiringGrant.sourceIds[0]} /></article>
      </div>
      <div className="grant-hold"><AlertTriangle size={18} /><div><b>{pick(locale, "Autoempleo: sin convocatoria 2026 verificada", "Self-employment: no verified 2026 call")}</b><p>{pick(locale, "La página oficial consultada sigue mostrando convocatorias de 2022. Sus importes y fechas no se presentan como vigentes.", "The official page inspected still shows 2022 calls. Their amounts and dates are not presented as current.")}</p></div></div>
    </section>
  );

  if (view === "Fuentes") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow={pick(locale, "REGISTRO DE FUENTES", "SOURCE REGISTER")} title={pick(locale, "La trazabilidad forma parte del resultado.", "Traceability is part of the result.")} description={pick(locale, `${sources.length} documentos oficiales sostienen las reglas visibles del ejercicio 2026. Cada registro conserva emisor, localizador jurídico y fecha de revisión.`, `${sources.length} official documents support the visible 2026 rules. Each record preserves the issuer, legal reference and review date.`)} icon={<BookOpenText />} />
      <div className="source-register">
        {sources.map((source) => <article key={source.id}><div><span>{source.issuer}</span><h2>{source.title}</h2><p>{source.legalLocator}</p></div><div className="source-meta"><small>{pick(locale, "Revisada", "Reviewed")} {new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB").format(new Date(`${source.lastVerified}T00:00:00Z`))}</small><a href={source.url} target="_blank" rel="noreferrer">{pick(locale, "Abrir fuente", "Open source")} <ExternalLink size={14} /></a></div></article>)}
      </div>
    </section>
  );

  const roadmap = [
    { title: pick(locale, "Completar el diagnóstico", "Complete the assessment"), detail: missingCount ? pick(locale, `${missingCount} datos requieren confirmación`, `${missingCount} facts require confirmation`) : pick(locale, "Perfil completo para las reglas evaluadas", "Profile complete for the assessed rules"), done: missingCount === 0, action: "Elegibilidad" as const },
    { title: pick(locale, "Revisar el escenario económico", "Review the financial scenario"), detail: pick(locale, `${formatEuro(euro(annualNetCents))} de neto anual estimado`, `${formatEuro(euro(annualNetCents))} estimated annual net`), done: annualRevenueCents > 0, action: "Dashboard" as const },
    { title: pick(locale, "Confirmar ayudas antes de actuar", "Confirm grants before acting"), detail: pick(locale, "Revisar solicitud previa a alta, inversión o contratación", "Check whether application must precede registration, investment or hiring"), done: false, action: "Ayudas" as const },
    { title: pick(locale, "Validar con un gestor", "Validate with an adviser"), detail: pick(locale, "Contrastar hechos, compatibilidades y documentación", "Review facts, compatibility and documentation"), done: false, action: "Dashboard" as const },
  ];
  return (
    <section className="phase-workspace">
      <ViewHeader eyebrow={pick(locale, "HOJA DE RUTA PERSONAL", "PERSONAL ROADMAP")} title={pick(locale, "Del escenario a una decisión documentada.", "From a scenario to a documented decision.")} description={pick(locale, "Los pasos se construyen con los datos actuales del diagnóstico y la simulación. Las acciones pendientes permanecen visibles hasta su validación.", "The steps use the current assessment and simulation data. Pending actions remain visible until validated.")} icon={<MapPinned />} />
      <div className="roadmap-list">{roadmap.map((item, index) => <article key={item.title} className={item.done ? "complete" : "pending"}><span className="roadmap-number">{item.done ? <Check aria-hidden="true" size={18} /> : index + 1}</span><div><small>{item.done ? pick(locale, "COMPLETADO", "COMPLETED") : pick(locale, "SIGUIENTE PASO", "NEXT STEP")}</small><h2>{item.title}</h2><p>{item.detail}</p></div><button type="button" className="secondary-button" onClick={() => onNavigate(item.action)}>{pick(locale, "Abrir", "Open")} <ArrowRight aria-hidden="true" size={14} /></button></article>)}</div>
      <div className="roadmap-note"><CalendarClock size={19} /><p>{pick(locale, "Las fechas y reglas pertenecen al ejercicio 2026. Antes del lanzamiento público o de ejecutar una acción, revisa que la fuente siga vigente.", "Dates and rules belong to tax year 2026. Before public launch or taking action, confirm that each source remains current.")}</p></div>
    </section>
  );
}

function ViewHeader({ eyebrow, title, description, icon }: Readonly<{ eyebrow: string; title: string; description: string; icon: ReactNode }>) {
  return <header className="workspace-header phase-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></div><span className="phase-header-icon">{icon}</span></header>;
}

function Metric({ label, value, detail, featured = false }: Readonly<{ label: string; value: string; detail: string; featured?: boolean }>) {
  return <article className={featured ? "phase-metric featured" : "phase-metric"}><small>{label}</small><strong>{value}</strong><span>{detail}</span></article>;
}

function MissingFacts({ locale, facts }: Readonly<{ locale: AppLocale; facts: readonly string[] }>) {
  return facts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>{pick(locale, "Falta confirmar:", "Needs confirmation:")}</b> {facts.map((fact) => localizeDomainText(locale, fact)).join(", ")}</span></div> : null;
}

function SourceLink({ locale, sourceId }: Readonly<{ locale: AppLocale; sourceId?: string }>) {
  const source = sources.find((item) => item.id === sourceId);
  return source ? <a className="phase-source-link" href={source.url} target="_blank" rel="noreferrer"><FileCheck2 size={14} /> {pick(locale, "Fuente oficial", "Official source")} <ExternalLink size={13} /></a> : null;
}

function ResultCard({ locale, title, category, status, reasons, missingFacts, sourceId }: Readonly<{ locale: AppLocale; title: string; category: string; status: keyof typeof statusLabel.es; reasons: readonly string[]; missingFacts: readonly string[]; sourceId?: string }>) {
  return <article className="phase-card"><div className="phase-card-heading"><span>{category}</span><b className={`status-chip status-${status.toLowerCase()}`}>{statusLabel[locale][status]}</b></div><h2>{localizeDomainText(locale, title)}</h2>{reasons.map((reason) => <p key={reason}>{localizeDomainText(locale, reason)}</p>)}<MissingFacts locale={locale} facts={missingFacts} /><SourceLink locale={locale} sourceId={sourceId} /></article>;
}
