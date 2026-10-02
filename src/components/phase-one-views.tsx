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
import { benefitRules2026 } from "@/rules/2026/benefits";
import { ceutaExtraordinaryAid2026Rules } from "@/rules/2026/direct-aid";
import { procesaIndefiniteHiring2026 } from "@/rules/2026/grant-programs";
import sources from "@/rules/2026/sources.json";

type ViewName = "Dashboard" | "Elegibilidad" | "Simulador" | "Autónomo vs SL" | "Beneficios" | "Ayudas" | "Hoja de ruta" | "Fuentes" | "Ebook";

type PhaseOneViewsProps = Readonly<{
  view: Extract<ViewName, "Simulador" | "Beneficios" | "Ayudas" | "Hoja de ruta" | "Fuentes">;
  profile: BusinessProfileFacts;
  annualRevenueCents: number;
  annualNetCents: number;
  recurringSavingCents: number;
  onNavigate: (view: ViewName) => void;
}>;

const statusLabel = {
  ELIGIBLE: "Elegible",
  POTENTIALLY_ELIGIBLE: "Potencial",
  NOT_ELIGIBLE: "No aplicable",
  NEEDS_VERIFICATION: "Faltan datos",
} as const;

export function PhaseOneViews({ view, profile, annualRevenueCents, annualNetCents, recurringSavingCents, onNavigate }: PhaseOneViewsProps) {
  const benefits = useMemo(() => evaluateBenefitRules(benefitRules2026, profile), [profile]);
  const reducedFee = useMemo(() => evaluateReducedFee2026({
    firstTimeAutonomo: profile.firstTimeAutonomo,
    previousAutonomoEndDate: profile.previousAutonomoEndDate,
    previouslyUsedReducedFee: profile.previouslyUsedReducedFee,
    plannedStartDate: profile.estimatedStartDate,
  }), [profile]);
  const directAid = useMemo(() => evaluateCeutaExtraordinaryAid2026(profile, ceutaExtraordinaryAid2026Rules), [profile]);
  const hiringGrant = useMemo(() => evaluateHiringGrant(procesaIndefiniteHiring2026, profile, new Date()), [profile]);

  const allResults = [...benefits, reducedFee];
  const missingCount = allResults.reduce((total, result) => total + result.missingFacts.length, 0) + directAid.missingFacts.length + hiringGrant.missingFacts.length;

  if (view === "Simulador") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow="SIMULADOR CONECTADO" title="Un escenario. Un único resultado en toda la aplicación." description="Los datos económicos del dashboard y los hechos del diagnóstico se comparten. Al cambiar residencia, actividad o porcentaje de renta de Ceuta, las evaluaciones se actualizan en todas las vistas." icon={<ShieldCheck />} />
      <div className="phase-summary-grid">
        <Metric label="Ingresos anuales" value={formatEuro(euro(annualRevenueCents))} detail="Escenario económico actual" />
        <Metric label="Neto anual estimado" value={formatEuro(euro(annualNetCents))} detail="Después de gastos, RETA e IRPF general" featured />
        <Metric label="Ahorro recurrente" value={formatEuro(euro(recurringSavingCents))} detail="IRPF Ceuta + bonificación RETA" />
      </div>
      <div className="phase-action-panel">
        <div><p className="eyebrow">DATOS COMPARTIDOS</p><h2>Perfil económico y diagnóstico sincronizados</h2><p>Edad: {profile.age ?? "pendiente"} · Residencia en Ceuta: {profile.residentInCeuta ? "sí" : "no"} · Actividad desde Ceuta: {profile.activityPerformedInCeuta ? "sí" : "no"} · Renta calificable: {profile.qualifyingCeutaIncomePercentage ?? 0}%</p></div>
        <div className="phase-actions"><button type="button" className="secondary-button" onClick={() => onNavigate("Dashboard")}>Editar importes</button><button type="button" className="primary-button" onClick={() => onNavigate("Elegibilidad")}>Editar diagnóstico <ArrowRight size={15} /></button></div>
      </div>
    </section>
  );

  if (view === "Beneficios") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow="BENEFICIOS 2026" title="Solo ventajas que pueden explicarse y acreditarse." description="Cada resultado responde al perfil compartido. Los datos incompletos permanecen como pendientes y nunca se convierten automáticamente en elegibilidad." icon={<BadgeEuro />} />
      <div className="result-summary phase-result-summary"><div><strong>{allResults.filter((item) => item.status === "ELIGIBLE" || item.status === "POTENTIALLY_ELIGIBLE").length}</strong><span>potenciales</span></div><div><strong>{allResults.filter((item) => item.status === "NEEDS_VERIFICATION").length}</strong><span>por completar</span></div><div><strong>{allResults.filter((item) => item.status === "NOT_ELIGIBLE").length}</strong><span>no aplicables</span></div></div>
      <div className="phase-card-list">
        {benefits.map((item) => <ResultCard key={item.benefitId} title={item.name} category={item.category === "TAX" ? "Fiscal" : "Seguridad Social"} status={item.status} reasons={item.reasons} missingFacts={item.missingFacts} sourceId={item.sourceIds[0]} />)}
        <ResultCard title="Cuota reducida para nueva alta" category="Seguridad Social" status={reducedFee.status} reasons={reducedFee.reasons} missingFacts={reducedFee.missingFacts} sourceId="LETA-ART-38-TER" />
      </div>
    </section>
  );

  if (view === "Ayudas") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow="AYUDAS VERIFICADAS" title="Convocatorias, plazos y condiciones antes de actuar." description="La disponibilidad de una ayuda no implica concesión. CEUTONOMO separa las convocatorias verificadas de los programas que todavía no publican una ventana aplicable." icon={<Landmark />} />
      <div className="grant-overview-grid">
        <article className="phase-card"><div className="phase-card-heading"><span>AEAT · AYUDA DIRECTA</span><b className={`status-chip status-${directAid.status.toLowerCase()}`}>{statusLabel[directAid.status]}</b></div><h2>Apoyo directo a empresas y profesionales de Ceuta</h2><strong className="phase-amount">{directAid.amountEuro ? `${directAid.amountEuro.toLocaleString("es-ES")} €` : "Según perfil"}</strong><p>Solicitud hasta el 30 de noviembre de 2026. Exenta de IRPF o IS según corresponda.</p><MissingFacts facts={directAid.missingFacts} /><SourceLink sourceId="AEAT-GC70-CEUTA-2026" /></article>
        <article className="phase-card"><div className="phase-card-heading"><span>PROCESA · CONTRATACIÓN</span><b className={`status-chip status-${hiringGrant.status.toLowerCase()}`}>{statusLabel[hiringGrant.status]}</b></div><h2>{hiringGrant.name}</h2><strong className="phase-amount">7.350 €–10.265 €</strong><p>La contratación debe ser posterior a la solicitud y mantenerse durante 3 años.</p><MissingFacts facts={hiringGrant.missingFacts} /><SourceLink sourceId={hiringGrant.sourceIds[0]} /></article>
      </div>
      <div className="grant-hold"><AlertTriangle size={18} /><div><b>Autoempleo: sin convocatoria 2026 verificada</b><p>La página oficial consultada sigue mostrando convocatorias de 2022. Sus importes y fechas no se presentan como vigentes.</p></div></div>
    </section>
  );

  if (view === "Fuentes") return (
    <section className="phase-workspace">
      <ViewHeader eyebrow="REGISTRO DE FUENTES" title="La trazabilidad forma parte del resultado." description={`${sources.length} documentos oficiales sostienen las reglas visibles del ejercicio 2026. Cada registro conserva emisor, localizador jurídico y fecha de revisión.`} icon={<BookOpenText />} />
      <div className="source-register">
        {sources.map((source) => <article key={source.id}><div><span>{source.issuer}</span><h2>{source.title}</h2><p>{source.legalLocator}</p></div><div className="source-meta"><small>Revisada {new Intl.DateTimeFormat("es-ES").format(new Date(`${source.lastVerified}T00:00:00Z`))}</small><a href={source.url} target="_blank" rel="noreferrer">Abrir fuente <ExternalLink size={14} /></a></div></article>)}
      </div>
    </section>
  );

  const roadmap = [
    { title: "Completar el diagnóstico", detail: missingCount ? `${missingCount} datos requieren confirmación` : "Perfil completo para las reglas evaluadas", done: missingCount === 0, action: "Elegibilidad" as const },
    { title: "Revisar el escenario económico", detail: `${formatEuro(euro(annualNetCents))} de neto anual estimado`, done: annualRevenueCents > 0, action: "Dashboard" as const },
    { title: "Confirmar ayudas antes de actuar", detail: "Revisar solicitud previa a alta, inversión o contratación", done: false, action: "Ayudas" as const },
    { title: "Validar con un gestor", detail: "Contrastar hechos, compatibilidades y documentación", done: false, action: "Dashboard" as const },
  ];
  return (
    <section className="phase-workspace">
      <ViewHeader eyebrow="HOJA DE RUTA PERSONAL" title="Del escenario a una decisión documentada." description="Los pasos se construyen con los datos actuales del diagnóstico y la simulación. Las acciones pendientes permanecen visibles hasta su validación." icon={<MapPinned />} />
      <div className="roadmap-list">{roadmap.map((item, index) => <article key={item.title} className={item.done ? "complete" : "pending"}><span className="roadmap-number">{item.done ? <Check aria-hidden="true" size={18} /> : index + 1}</span><div><small>{item.done ? "COMPLETADO" : "SIGUIENTE PASO"}</small><h2>{item.title}</h2><p>{item.detail}</p></div><button type="button" className="secondary-button" onClick={() => onNavigate(item.action)}>Abrir <ArrowRight aria-hidden="true" size={14} /></button></article>)}</div>
      <div className="roadmap-note"><CalendarClock size={19} /><p>Las fechas y reglas pertenecen al ejercicio 2026. Antes del lanzamiento público o de ejecutar una acción, revisa que la fuente siga vigente.</p></div>
    </section>
  );
}

function ViewHeader({ eyebrow, title, description, icon }: Readonly<{ eyebrow: string; title: string; description: string; icon: ReactNode }>) {
  return <header className="workspace-header phase-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></div><span className="phase-header-icon">{icon}</span></header>;
}

function Metric({ label, value, detail, featured = false }: Readonly<{ label: string; value: string; detail: string; featured?: boolean }>) {
  return <article className={featured ? "phase-metric featured" : "phase-metric"}><small>{label}</small><strong>{value}</strong><span>{detail}</span></article>;
}

function MissingFacts({ facts }: Readonly<{ facts: readonly string[] }>) {
  return facts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>Falta confirmar:</b> {facts.join(", ")}</span></div> : null;
}

function SourceLink({ sourceId }: Readonly<{ sourceId?: string }>) {
  const source = sources.find((item) => item.id === sourceId);
  return source ? <a className="phase-source-link" href={source.url} target="_blank" rel="noreferrer"><FileCheck2 size={14} /> Fuente oficial <ExternalLink size={13} /></a> : null;
}

function ResultCard({ title, category, status, reasons, missingFacts, sourceId }: Readonly<{ title: string; category: string; status: keyof typeof statusLabel; reasons: readonly string[]; missingFacts: readonly string[]; sourceId?: string }>) {
  return <article className="phase-card"><div className="phase-card-heading"><span>{category}</span><b className={`status-chip status-${status.toLowerCase()}`}>{statusLabel[status]}</b></div><h2>{title}</h2>{reasons.map((reason) => <p key={reason}>{reason}</p>)}<MissingFacts facts={missingFacts} /><SourceLink sourceId={sourceId} /></article>;
}
