"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Check, CircleHelp, ExternalLink, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { evaluateBenefitRules } from "@/domain/eligibility/benefit-engine";
import { evaluateReducedFee2026 } from "@/domain/eligibility/reduced-fee";
import { evaluateCeutaExtraordinaryAid2026 } from "@/domain/grants/ceuta-extraordinary-aid";
import { evaluateHiringGrant } from "@/domain/grants/grant-program";
import { type BusinessProfileFacts } from "@/domain/profile";
import { localizeDomainText, pick, type AppLocale } from "@/lib/locale";
import { benefitRules2026 } from "@/rules/2026/benefits";
import { procesaIndefiniteHiring2026 } from "@/rules/2026/grant-programs";
import { ceutaExtraordinaryAid2026Rules } from "@/rules/2026/direct-aid";
import sources from "@/rules/2026/sources.json";

const steps = {
  es: ["Situación personal", "Actividad", "Implantación", "Resultado"],
  en: ["Personal situation", "Activity", "Presence", "Result"],
} as const;

const statusCopy = {
  ELIGIBLE: "Elegible",
  POTENTIALLY_ELIGIBLE: "Potencialmente aplicable",
  NOT_ELIGIBLE: "No aplicable",
  NEEDS_VERIFICATION: "Faltan datos",
} as const;

const englishStatusCopy = {
  ELIGIBLE: "Eligible",
  POTENTIALLY_ELIGIBLE: "Potentially applicable",
  NOT_ELIGIBLE: "Not applicable",
  NEEDS_VERIFICATION: "Missing facts",
} as const;

const activityOptions = [
  ["SOFTWARE_DEVELOPMENT", "Desarrollo de software", "Software development"],
  ["IT_CONSULTING", "Consultoría IT", "IT consulting"],
  ["SAAS", "SaaS"],
  ["ECOMMERCE", "E-commerce", "E-commerce"],
  ["MARKETING", "Marketing"],
  ["CALL_CENTRE", "Centro de llamadas", "Call centre"],
  ["PROFESSIONAL_SERVICES", "Servicios profesionales", "Professional services"],
  ["RETAIL", "Comercio", "Retail"],
  ["HOSPITALITY", "Hostelería", "Hospitality"],
  ["TOURISM", "Turismo", "Tourism"],
  ["CONSTRUCTION", "Construcción", "Construction"],
  ["OTHER", "Otra", "Other"],
] as const;

const sourceById = new Map(sources.map((source) => [source.id, source]));

type BooleanChoiceProps = {
  locale: AppLocale;
  label: string;
  help?: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
};

function BooleanChoice({ locale, label, help, value, onChange }: BooleanChoiceProps) {
  return (
    <fieldset className="choice-field">
      <legend>{label}</legend>
      {help ? <small>{help}</small> : null}
      <div className="segmented-control">
        <button type="button" className={value === true ? "selected" : ""} onClick={() => onChange(true)}>{pick(locale, "Sí", "Yes")}</button>
        <button type="button" className={value === false ? "selected" : ""} onClick={() => onChange(false)}>No</button>
      </div>
    </fieldset>
  );
}

type EligibilityWorkspaceProps = Readonly<{
  locale: AppLocale;
  profile: BusinessProfileFacts;
  onProfileChange: (profile: BusinessProfileFacts) => void;
}>;

export function EligibilityWorkspace({ locale, profile, onProfileChange }: EligibilityWorkspaceProps) {
  const [step, setStep] = useState(0);
  const results = useMemo(() => evaluateBenefitRules(benefitRules2026, profile), [profile]);
  const reducedFee = useMemo(() => evaluateReducedFee2026({ firstTimeAutonomo: profile.firstTimeAutonomo, previousAutonomoEndDate: profile.previousAutonomoEndDate, previouslyUsedReducedFee: profile.previouslyUsedReducedFee, plannedStartDate: profile.estimatedStartDate }), [profile.firstTimeAutonomo, profile.previousAutonomoEndDate, profile.previouslyUsedReducedFee, profile.estimatedStartDate]);
  const directAid = useMemo(() => evaluateCeutaExtraordinaryAid2026(profile, ceutaExtraordinaryAid2026Rules), [profile]);
  const grant = useMemo(() => evaluateHiringGrant(procesaIndefiniteHiring2026, profile, new Date()), [profile]);
  const statusCounts = useMemo(() => [...results, reducedFee, directAid, grant].reduce((counts, item) => ({ ...counts, [item.status]: counts[item.status] + 1 }), { ELIGIBLE: 0, POTENTIALLY_ELIGIBLE: 0, NOT_ELIGIBLE: 0, NEEDS_VERIFICATION: 0 }), [results, reducedFee, directAid, grant]);
  const update = <K extends keyof BusinessProfileFacts>(key: K, value: BusinessProfileFacts[K]) => {
    onProfileChange({ ...profile, [key]: value });
  };

  return (
    <div className="eligibility-workspace">
      <header className="workspace-header compact-header">
        <div>
          <p className="eyebrow">{pick(locale, "DIAGNÓSTICO DE ELEGIBILIDAD", "ELIGIBILITY ASSESSMENT")}</p>
          <h1>{pick(locale, "Primero los hechos. Después, los beneficios.", "Facts first. Benefits second.")}</h1>
          <p className="lede">{pick(locale, "Completa solo los datos necesarios. Las respuestas incompletas se muestran como “Faltan datos”, nunca como elegibilidad.", "Complete only the necessary facts. Incomplete answers appear as “Missing facts”, never as eligibility.")}</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} /> {pick(locale, "Sin guardar en servidor", "Not stored on a server")}</span>
      </header>

      <div className="onboarding-layout">
        <aside className="stepper" aria-label={pick(locale, "Progreso del diagnóstico", "Assessment progress")}>
          {steps[locale].map((label, index) => (
            <button type="button" key={label} className={index === step ? "current" : index < step ? "complete" : ""} onClick={() => setStep(index)}>
              <span>{index < step ? <Check size={15} /> : index + 1}</span><b>{label}</b>
            </button>
          ))}
        </aside>

        <section className="wizard-card" aria-live="polite">
          {step === 0 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">{pick(locale, "PASO 1 DE 4", "STEP 1 OF 4")}</p><h2>{pick(locale, "Situación personal", "Personal situation")}</h2></div></div>
              <p className="form-intro">{pick(locale, "Estos datos afectan a la residencia fiscal y a incentivos que pueden exigir una situación previa concreta.", "These facts affect tax residence and incentives that may require a specific prior situation.")}</p>
              <div className="wizard-grid">
                <label>{pick(locale, "Edad", "Age")}<input type="number" min="18" max="100" value={profile.age ?? ""} onChange={(event) => update("age", Number(event.target.value))} /></label>
                <label>{pick(locale, "Residencia fiscal", "Tax residence")}<select value={profile.taxResidenceCountry ?? ""} onChange={(event) => update("taxResidenceCountry", event.target.value)}><option value="">{pick(locale, "Seleccionar", "Select")}</option><option value="ES">{pick(locale, "España", "Spain")}</option><option value="OTHER">{pick(locale, "Otro país", "Another country")}</option></select></label>
                <BooleanChoice locale={locale} label={pick(locale, "¿Resides efectivamente en Ceuta?", "Do you effectively reside in Ceuta?")} value={profile.residentInCeuta} onChange={(value) => update("residentInCeuta", value)} />
                <BooleanChoice locale={locale} label={pick(locale, "¿Estás empadronado/a en Ceuta?", "Are you registered as a resident in Ceuta?")} value={profile.registeredInCeuta} onChange={(value) => update("registeredInCeuta", value)} />
                <label>{pick(locale, "Fecha de inicio de residencia", "Residence start date")} <span className="optional">{pick(locale, "Opcional", "Optional")}</span><input type="date" value={profile.residenceStartDate ?? ""} onChange={(event) => update("residenceStartDate", event.target.value)} /></label>
                <BooleanChoice locale={locale} label={pick(locale, "¿Es tu primera alta como autónomo?", "Is this your first self-employed registration?")} value={profile.firstTimeAutonomo} onChange={(value) => update("firstTimeAutonomo", value)} />
                {profile.firstTimeAutonomo === false ? <>
                  <label>{pick(locale, "Fecha de la última baja en RETA", "Last RETA deregistration date")}<input type="date" value={profile.previousAutonomoEndDate ?? ""} onChange={(event) => update("previousAutonomoEndDate", event.target.value)} /></label>
                  <BooleanChoice locale={locale} label={pick(locale, "¿Disfrutaste antes de una cuota reducida?", "Have you previously used a reduced fee?")} value={profile.previouslyUsedReducedFee} onChange={(value) => update("previouslyUsedReducedFee", value)} />
                </> : null}
                <BooleanChoice locale={locale} label={pick(locale, "¿Estás inscrito/a como demandante de empleo?", "Are you registered as a job seeker?")} value={profile.registeredJobSeeker} onChange={(value) => update("registeredJobSeeker", value)} />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">{pick(locale, "PASO 2 DE 4", "STEP 2 OF 4")}</p><h2>{pick(locale, "Actividad y estructura", "Activity and structure")}</h2></div></div>
              <p className="form-intro">{pick(locale, "La etiqueta comercial no determina por sí sola el tratamiento fiscal. Describe lo que realmente haces.", "A commercial label does not determine tax treatment by itself. Describe what you actually do.")}</p>
              <div className="wizard-grid">
                <label>{pick(locale, "Actividad", "Activity")}<select value={profile.activityType ?? ""} onChange={(event) => update("activityType", event.target.value as BusinessProfileFacts["activityType"])}>{activityOptions.map(([value, label, english = label]) => <option key={value} value={value}>{locale === "es" ? label : english}</option>)}</select></label>
                <label>{pick(locale, "Estructura", "Structure")}<select value={profile.legalStructure ?? "UNDECIDED"} onChange={(event) => update("legalStructure", event.target.value as BusinessProfileFacts["legalStructure"])}><option value="AUTONOMO">{pick(locale, "Autónomo", "Self-employed")}</option><option value="SL">SL / SLU</option><option value="UNDECIDED">{pick(locale, "Aún no decidido", "Not decided yet")}</option></select></label>
                {profile.legalStructure === "SL" ? <label>{pick(locale, "Volumen de operaciones 2025 (€)", "2025 turnover (€)")}<input type="number" min="0" value={profile.company2025TurnoverEuro ?? ""} onChange={(event) => update("company2025TurnoverEuro", event.target.value === "" ? undefined : Number(event.target.value))} /></label> : null}
                <label className="full-field">{pick(locale, "Descripción de la actividad", "Activity description")}<textarea rows={4} value={profile.activityDescription ?? ""} onChange={(event) => update("activityDescription", event.target.value)} /></label>
                <label>CNAE <span className="optional">{pick(locale, "Si lo conoces", "If known")}</span><input value={profile.cnae ?? ""} onChange={(event) => update("cnae", event.target.value)} /></label>
                <label>IAE <span className="optional">{pick(locale, "Si lo conoces", "If known")}</span><input value={profile.iae ?? ""} onChange={(event) => update("iae", event.target.value)} /></label>
                <BooleanChoice locale={locale} label={pick(locale, "¿Es una actividad nueva?", "Is this a new activity?")} value={profile.newBusiness} onChange={(value) => update("newBusiness", value)} />
                <label>{pick(locale, "Fecha estimada de inicio", "Estimated start date")} <span className="optional">{pick(locale, "Opcional", "Optional")}</span><input type="date" value={profile.estimatedStartDate ?? ""} onChange={(event) => update("estimatedStartDate", event.target.value)} /></label>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">{pick(locale, "PASO 3 DE 4", "STEP 3 OF 4")}</p><h2>{pick(locale, "Implantación real en Ceuta", "Real presence in Ceuta")}</h2></div></div>
              <p className="form-intro">{pick(locale, "La elegibilidad depende de hechos acreditables: dónde trabajas, qué medios utilizas y qué renta procede de Ceuta.", "Eligibility depends on supportable facts: where you work, which resources you use and which income arises in Ceuta.")}</p>
              <div className="wizard-grid">
                <BooleanChoice locale={locale} label={pick(locale, "¿Realizarás efectivamente la actividad desde Ceuta?", "Will you effectively perform the activity from Ceuta?")} value={profile.activityPerformedInCeuta} onChange={(value) => update("activityPerformedInCeuta", value)} />
                <BooleanChoice locale={locale} label={pick(locale, "¿Tendrás establecimiento o medios materiales en Ceuta?", "Will you have premises or material resources in Ceuta?")} value={profile.physicalEstablishmentInCeuta} onChange={(value) => update("physicalEstablishmentInCeuta", value)} />
                <label>{pick(locale, "Lugar de trabajo", "Workplace")}<select value={profile.workplaceType ?? ""} onChange={(event) => update("workplaceType", event.target.value as BusinessProfileFacts["workplaceType"])}><option value="HOME_OFFICE">{pick(locale, "Domicilio / home office", "Home office")}</option><option value="OFFICE">{pick(locale, "Oficina", "Office")}</option><option value="COWORKING">Coworking</option><option value="OTHER">{pick(locale, "Otro", "Other")}</option></select></label>
                <label>{pick(locale, "Empleados actuales", "Current employees")}<input type="number" min="0" value={profile.employeesNow ?? 0} onChange={(event) => update("employeesNow", Number(event.target.value))} /></label>
                <label>{pick(locale, "Empleados previstos", "Planned employees")}<input type="number" min="0" value={profile.employeesPlanned ?? 0} onChange={(event) => update("employeesPlanned", Number(event.target.value))} /></label>
                <label>{pick(locale, "Renta potencialmente obtenida en Ceuta", "Income potentially obtained in Ceuta")} <b className="range-value">{profile.qualifyingCeutaIncomePercentage ?? 0}%</b><input type="range" min="0" max="100" step="5" value={profile.qualifyingCeutaIncomePercentage ?? 0} onChange={(event) => update("qualifyingCeutaIncomePercentage", Number(event.target.value))} /><small>{pick(locale, "Es una hipótesis editable, no una validación automática.", "This is an editable assumption, not an automatic validation.")}</small></label>
                <BooleanChoice locale={locale} label={pick(locale, "¿El sector figura entre los incluidos en la bonificación RETA?", "Is the sector included in the RETA relief?")} help={pick(locale, "Si no estás seguro, deja este punto para verificación profesional.", "If unsure, leave this point for professional verification.")} value={profile.coveredCeutaSocialSecuritySector} onChange={(value) => update("coveredCeutaSocialSecuritySector", value)} />
                <BooleanChoice locale={locale} label={pick(locale, "¿Tuviste domicilio fiscal, establecimiento o inmueble afecto en Ceuta durante el período de referencia de 2026?", "Did you have a tax address, establishment or business property in Ceuta during the 2026 reference period?")} value={profile.ceutaPresenceDuring2026ReferencePeriod} onChange={(value) => update("ceutaPresenceDuring2026ReferencePeriod", value)} />
                <BooleanChoice locale={locale} label={pick(locale, "¿La crisis migratoria declarada afectó negativamente a tu actividad?", "Did the declared migration crisis negatively affect your activity?")} help={pick(locale, "No se presume: debe declararse y poder justificarse.", "This is not presumed: it must be declared and supportable.")} value={profile.negativelyAffectedBy2026MigrationCrisis} onChange={(value) => update("negativelyAffectedBy2026MigrationCrisis", value)} />
                {profile.newBusiness ? <BooleanChoice locale={locale} label={pick(locale, "¿Constabas de alta en el censo antes del 3 de septiembre de 2026?", "Were you registered in the tax census before 3 September 2026?")} value={profile.registeredInTaxCensusBefore2026Measure} onChange={(value) => update("registeredInTaxCensusBefore2026Measure", value)} /> : <BooleanChoice locale={locale} label={pick(locale, "¿Presentaste la declaración tributaria de 2025 exigida?", "Did you file the required 2025 tax return?")} value={profile.required2025TaxReturnFiled} onChange={(value) => update("required2025TaxReturnFiled", value)} />}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">{pick(locale, "PASO 4 DE 4", "STEP 4 OF 4")}</p><h2>{pick(locale, "Resultado trazable", "Traceable result")}</h2></div><span className="source-badge"><ShieldCheck size={15} /> {results.length + 3} {pick(locale, "reglas evaluadas", "rules evaluated")}</span></div>
              <div className="result-summary">
                <div><strong>{statusCounts.POTENTIALLY_ELIGIBLE + statusCounts.ELIGIBLE}</strong><span>{pick(locale, "potenciales", "potential")}</span></div>
                <div><strong>{statusCounts.NEEDS_VERIFICATION}</strong><span>{pick(locale, "por completar", "to complete")}</span></div>
                <div><strong>{statusCounts.NOT_ELIGIBLE}</strong><span>{pick(locale, "no aplicables", "not applicable")}</span></div>
                <div className="window-summary"><strong>{grant.windowStatus === "OPEN" ? pick(locale, "Abierta", "Open") : grant.windowStatus === "UPCOMING" ? pick(locale, "Próxima", "Upcoming") : pick(locale, "Cerrada", "Closed")}</strong><span>{pick(locale, "convocatoria de contratación", "hiring call")}</span></div>
              </div>
              <div className="benefit-list">
                {results.map((result) => (
                  <article className={`benefit-card status-${result.status.toLowerCase()}`} key={result.benefitId}>
                    <div className="benefit-title"><div><span>{result.category === "TAX" ? pick(locale, "Fiscal", "Tax") : pick(locale, "Seguridad Social", "Social Security")}</span><h3>{localizeDomainText(locale, result.name)}</h3></div><b>{locale === "es" ? statusCopy[result.status] : englishStatusCopy[result.status]}</b></div>
                    {result.reasons.map((reason) => <p key={reason}>{localizeDomainText(locale, reason)}</p>)}
                    {result.missingFacts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>{pick(locale, "Falta confirmar:", "To confirm:")}</b> {result.missingFacts.map((fact) => localizeDomainText(locale, fact)).join(", ")}</span></div> : null}
                    {result.warnings.map((warning) => <div className="result-warning" key={warning}><AlertTriangle size={15} /><span>{localizeDomainText(locale, warning)}</span></div>)}
                    <footer><span>{pick(locale, "Reglas", "Rules")} {result.ruleRefs.join(" · ")}</span><a href={sourceById.get(result.sourceIds[0])?.url} target="_blank" rel="noreferrer">{pick(locale, "Ver fuente oficial", "View official source")} <ExternalLink size={13} /></a></footer>
                  </article>
                ))}
                <article className={`benefit-card status-${reducedFee.status.toLowerCase()}`}>
                  <div className="benefit-title"><div><span>{pick(locale, "Seguridad Social · Inicio de actividad", "Social Security · Starting a business")}</span><h3>{pick(locale, "Cuota reducida para nueva alta", "Reduced fee for new registrations")}</h3></div><b>{locale === "es" ? statusCopy[reducedFee.status] : englishStatusCopy[reducedFee.status]}</b></div>
                  {reducedFee.reasons.map((reason) => <p key={reason}>{localizeDomainText(locale, reason)}</p>)}
                  {reducedFee.missingFacts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>Falta confirmar:</b> {reducedFee.missingFacts.join(", ")}</span></div> : null}
                  {reducedFee.warnings.map((warning) => <div className="result-warning" key={warning}><AlertTriangle size={15} /><span>{warning}</span></div>)}
                  <footer><span>{pick(locale, "Reglas", "Rules")} {reducedFee.ruleRefs.join(" · ")}</span><a href={sourceById.get("LETA-ART-38-TER")?.url} target="_blank" rel="noreferrer">{pick(locale, "Ver norma oficial", "View official rule")} <ExternalLink size={13} /></a></footer>
                </article>
                <article className={`benefit-card grant-card status-${directAid.status.toLowerCase()}`}>
                  <div className="benefit-title"><div><span>Ayuda estatal extraordinaria · AEAT</span><h3>Apoyo directo a empresas y profesionales de Ceuta</h3></div><b>{statusCopy[directAid.status]}</b></div>
                  {directAid.reasons.map((reason) => <p key={reason}>{reason}</p>)}
                  <dl className="grant-facts"><div><dt>Importe orientativo</dt><dd>{directAid.amountEuro ? `${directAid.amountEuro.toLocaleString("es-ES")} €` : "Según forma jurídica y volumen"}</dd></div><div><dt>Solicitud</dt><dd>Hasta el 30 de noviembre de 2026</dd></div><div><dt>Tributación</dt><dd>Exenta de IRPF / IS</dd></div></dl>
                  {directAid.missingFacts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>Falta confirmar:</b> {directAid.missingFacts.join(", ")}</span></div> : null}
                  {directAid.warnings.map((warning) => <div className="result-warning" key={warning}><AlertTriangle size={15} /><span>{warning}</span></div>)}
                  <footer><span>Regla {directAid.ruleRefs.join(" · ")}</span><a href={sourceById.get("AEAT-GC70-CEUTA-2026")?.url} target="_blank" rel="noreferrer">Solicitar / ver procedimiento <ExternalLink size={13} /></a></footer>
                </article>
                <article className={`benefit-card grant-card status-${grant.status.toLowerCase()}`}>
                  <div className="benefit-title"><div><span>Ayuda · {grant.windowStatus === "OPEN" ? "Convocatoria abierta" : grant.windowStatus === "UPCOMING" ? "Próxima convocatoria" : "Convocatorias cerradas"}</span><h3>{grant.name}</h3></div><b>{statusCopy[grant.status]}</b></div>
                  {grant.reasons.map((reason) => <p key={reason}>{reason}</p>)}
                  <dl className="grant-facts">
                    <div><dt>Importe</dt><dd>{procesaIndefiniteHiring2026.amountLabel}</dd></div>
                    <div><dt>Ventana</dt><dd>{grant.activeWindow ? `Hasta ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(grant.activeWindow.closesAt))}` : grant.nextWindow ? `Abre ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "Europe/Madrid" }).format(new Date(grant.nextWindow.opensAt))}` : "Sin ventana 2026 abierta"}</dd></div>
                    <div><dt>Mantenimiento</dt><dd>{procesaIndefiniteHiring2026.maintenancePeriod}</dd></div>
                  </dl>
                  {grant.missingFacts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>Falta confirmar:</b> {grant.missingFacts.join(", ")}</span></div> : null}
                  {grant.warnings.map((warning) => <div className="result-warning" key={warning}><AlertTriangle size={15} /><span>{warning}</span></div>)}
                  <details className="document-list"><summary>Documentación indicada</summary><ul>{procesaIndefiniteHiring2026.requiredDocuments.map((document) => <li key={document}>{document}</li>)}</ul></details>
                  <footer><span>Verificada el 28/09/2026</span><a href={sourceById.get(grant.sourceIds[0])?.url} target="_blank" rel="noreferrer">Ver convocatoria oficial <ExternalLink size={13} /></a></footer>
                </article>
              </div>
              <div className="grant-hold"><AlertTriangle size={18} /><div><b>Autoempleo: sin convocatoria 2026 verificada</b><p>La página oficial de autoempleo consultada sigue mostrando ventanas de 2022. No se traslada ese importe ni esas fechas a 2026.</p></div></div>
            </>
          ) : null}

          <footer className="wizard-actions">
            <button type="button" className="back-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={16} /> {pick(locale, "Anterior", "Previous")}</button>
            {step < steps[locale].length - 1 ? <button type="button" className="primary-button" onClick={() => setStep((current) => Math.min(steps[locale].length - 1, current + 1))}>{pick(locale, "Continuar", "Continue")} <ArrowRight size={16} /></button> : <button type="button" className="primary-button" onClick={() => setStep(0)}>{pick(locale, "Editar respuestas", "Edit answers")}</button>}
          </footer>
        </section>
      </div>
    </div>
  );
}
