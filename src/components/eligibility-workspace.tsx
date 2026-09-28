"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Check, CircleHelp, ExternalLink, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { evaluateBenefitRules } from "@/domain/eligibility/benefit-engine";
import { evaluateReducedFee2026 } from "@/domain/eligibility/reduced-fee";
import { evaluateCeutaExtraordinaryAid2026 } from "@/domain/grants/ceuta-extraordinary-aid";
import { evaluateHiringGrant } from "@/domain/grants/grant-program";
import { type BusinessProfileFacts, demoBusinessProfile } from "@/domain/profile";
import { benefitRules2026 } from "@/rules/2026/benefits";
import { procesaIndefiniteHiring2026 } from "@/rules/2026/grant-programs";
import { ceutaExtraordinaryAid2026Rules } from "@/rules/2026/direct-aid";
import sources from "@/rules/2026/sources.json";

const steps = ["Situación personal", "Actividad", "Implantación", "Resultado"] as const;

const statusCopy = {
  ELIGIBLE: "Elegible",
  POTENTIALLY_ELIGIBLE: "Potencialmente aplicable",
  NOT_ELIGIBLE: "No aplicable",
  NEEDS_VERIFICATION: "Faltan datos",
} as const;

const activityOptions = [
  ["SOFTWARE_DEVELOPMENT", "Desarrollo de software"],
  ["IT_CONSULTING", "Consultoría IT"],
  ["SAAS", "SaaS"],
  ["ECOMMERCE", "E-commerce"],
  ["MARKETING", "Marketing"],
  ["CALL_CENTRE", "Centro de llamadas"],
  ["PROFESSIONAL_SERVICES", "Servicios profesionales"],
  ["RETAIL", "Comercio"],
  ["HOSPITALITY", "Hostelería"],
  ["TOURISM", "Turismo"],
  ["CONSTRUCTION", "Construcción"],
  ["OTHER", "Otra"],
] as const;

const sourceById = new Map(sources.map((source) => [source.id, source]));

type BooleanChoiceProps = {
  label: string;
  help?: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
};

function BooleanChoice({ label, help, value, onChange }: BooleanChoiceProps) {
  return (
    <fieldset className="choice-field">
      <legend>{label}</legend>
      {help ? <small>{help}</small> : null}
      <div className="segmented-control">
        <button type="button" className={value === true ? "selected" : ""} onClick={() => onChange(true)}>Sí</button>
        <button type="button" className={value === false ? "selected" : ""} onClick={() => onChange(false)}>No</button>
      </div>
    </fieldset>
  );
}

export function EligibilityWorkspace() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BusinessProfileFacts>(demoBusinessProfile);
  const results = useMemo(() => evaluateBenefitRules(benefitRules2026, profile), [profile]);
  const reducedFee = useMemo(() => evaluateReducedFee2026({ firstTimeAutonomo: profile.firstTimeAutonomo, previousAutonomoEndDate: profile.previousAutonomoEndDate, previouslyUsedReducedFee: profile.previouslyUsedReducedFee, plannedStartDate: profile.estimatedStartDate }), [profile.firstTimeAutonomo, profile.previousAutonomoEndDate, profile.previouslyUsedReducedFee, profile.estimatedStartDate]);
  const directAid = useMemo(() => evaluateCeutaExtraordinaryAid2026(profile, ceutaExtraordinaryAid2026Rules), [profile]);
  const grant = useMemo(() => evaluateHiringGrant(procesaIndefiniteHiring2026, profile, new Date()), [profile]);
  const statusCounts = useMemo(() => [...results, reducedFee, directAid, grant].reduce((counts, item) => ({ ...counts, [item.status]: counts[item.status] + 1 }), { ELIGIBLE: 0, POTENTIALLY_ELIGIBLE: 0, NOT_ELIGIBLE: 0, NEEDS_VERIFICATION: 0 }), [results, reducedFee, directAid, grant]);
  const update = <K extends keyof BusinessProfileFacts>(key: K, value: BusinessProfileFacts[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="eligibility-workspace">
      <header className="workspace-header compact-header">
        <div>
          <p className="eyebrow">DIAGNÓSTICO DE ELEGIBILIDAD</p>
          <h1>Primero los hechos. Después, los beneficios.</h1>
          <p className="lede">Completa solo los datos necesarios. Las respuestas incompletas se muestran como “Faltan datos”, nunca como elegibilidad.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} /> Sin guardar en servidor</span>
      </header>

      <div className="onboarding-layout">
        <aside className="stepper" aria-label="Progreso del diagnóstico">
          {steps.map((label, index) => (
            <button type="button" key={label} className={index === step ? "current" : index < step ? "complete" : ""} onClick={() => setStep(index)}>
              <span>{index < step ? <Check size={15} /> : index + 1}</span><b>{label}</b>
            </button>
          ))}
        </aside>

        <section className="wizard-card" aria-live="polite">
          {step === 0 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">PASO 1 DE 4</p><h2>Situación personal</h2></div></div>
              <p className="form-intro">Estos datos afectan a la residencia fiscal y a incentivos que pueden exigir una situación previa concreta.</p>
              <div className="wizard-grid">
                <label>Edad<input type="number" min="18" max="100" value={profile.age ?? ""} onChange={(event) => update("age", Number(event.target.value))} /></label>
                <label>Residencia fiscal<select value={profile.taxResidenceCountry ?? ""} onChange={(event) => update("taxResidenceCountry", event.target.value)}><option value="">Seleccionar</option><option value="ES">España</option><option value="OTHER">Otro país</option></select></label>
                <BooleanChoice label="¿Resides efectivamente en Ceuta?" value={profile.residentInCeuta} onChange={(value) => update("residentInCeuta", value)} />
                <BooleanChoice label="¿Estás empadronado/a en Ceuta?" value={profile.registeredInCeuta} onChange={(value) => update("registeredInCeuta", value)} />
                <label>Fecha de inicio de residencia <span className="optional">Opcional</span><input type="date" value={profile.residenceStartDate ?? ""} onChange={(event) => update("residenceStartDate", event.target.value)} /></label>
                <BooleanChoice label="¿Es tu primera alta como autónomo?" value={profile.firstTimeAutonomo} onChange={(value) => update("firstTimeAutonomo", value)} />
                {profile.firstTimeAutonomo === false ? <>
                  <label>Fecha de la última baja en RETA<input type="date" value={profile.previousAutonomoEndDate ?? ""} onChange={(event) => update("previousAutonomoEndDate", event.target.value)} /></label>
                  <BooleanChoice label="¿Disfrutaste antes de una cuota reducida?" value={profile.previouslyUsedReducedFee} onChange={(value) => update("previouslyUsedReducedFee", value)} />
                </> : null}
                <BooleanChoice label="¿Estás actualmente desempleado/a?" value={profile.unemployed} onChange={(value) => update("unemployed", value)} />
                <BooleanChoice label="¿Estás inscrito/a como demandante de empleo?" value={profile.registeredJobSeeker} onChange={(value) => update("registeredJobSeeker", value)} />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">PASO 2 DE 4</p><h2>Actividad y estructura</h2></div></div>
              <p className="form-intro">La etiqueta comercial no determina por sí sola el tratamiento fiscal. Describe lo que realmente haces.</p>
              <div className="wizard-grid">
                <label>Actividad<select value={profile.activityType ?? ""} onChange={(event) => update("activityType", event.target.value as BusinessProfileFacts["activityType"])}>{activityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>Estructura<select value={profile.legalStructure ?? "UNDECIDED"} onChange={(event) => update("legalStructure", event.target.value as BusinessProfileFacts["legalStructure"])}><option value="AUTONOMO">Autónomo</option><option value="SL">SL / SLU</option><option value="UNDECIDED">Aún no decidido</option></select></label>
                {profile.legalStructure === "SL" ? <label>Volumen de operaciones 2025 (€)<input type="number" min="0" value={profile.company2025TurnoverEuro ?? ""} onChange={(event) => update("company2025TurnoverEuro", event.target.value === "" ? undefined : Number(event.target.value))} /></label> : null}
                <label className="full-field">Descripción de la actividad<textarea rows={4} value={profile.activityDescription ?? ""} onChange={(event) => update("activityDescription", event.target.value)} /></label>
                <label>CNAE <span className="optional">Si lo conoces</span><input value={profile.cnae ?? ""} onChange={(event) => update("cnae", event.target.value)} /></label>
                <label>IAE <span className="optional">Si lo conoces</span><input value={profile.iae ?? ""} onChange={(event) => update("iae", event.target.value)} /></label>
                <BooleanChoice label="¿Es una actividad nueva?" value={profile.newBusiness} onChange={(value) => update("newBusiness", value)} />
                <label>Fecha estimada de inicio <span className="optional">Opcional</span><input type="date" value={profile.estimatedStartDate ?? ""} onChange={(event) => update("estimatedStartDate", event.target.value)} /></label>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">PASO 3 DE 4</p><h2>Implantación real en Ceuta</h2></div></div>
              <p className="form-intro">La elegibilidad depende de hechos acreditables: dónde trabajas, qué medios utilizas y qué renta procede de Ceuta.</p>
              <div className="wizard-grid">
                <BooleanChoice label="¿Realizarás efectivamente la actividad desde Ceuta?" value={profile.activityPerformedInCeuta} onChange={(value) => update("activityPerformedInCeuta", value)} />
                <BooleanChoice label="¿Tendrás establecimiento o medios materiales en Ceuta?" value={profile.physicalEstablishmentInCeuta} onChange={(value) => update("physicalEstablishmentInCeuta", value)} />
                <label>Lugar de trabajo<select value={profile.workplaceType ?? ""} onChange={(event) => update("workplaceType", event.target.value as BusinessProfileFacts["workplaceType"])}><option value="HOME_OFFICE">Domicilio / home office</option><option value="OFFICE">Oficina</option><option value="COWORKING">Coworking</option><option value="OTHER">Otro</option></select></label>
                <label>Empleados actuales<input type="number" min="0" value={profile.employeesNow ?? 0} onChange={(event) => update("employeesNow", Number(event.target.value))} /></label>
                <label>Empleados previstos<input type="number" min="0" value={profile.employeesPlanned ?? 0} onChange={(event) => update("employeesPlanned", Number(event.target.value))} /></label>
                <label>Renta potencialmente obtenida en Ceuta <b className="range-value">{profile.qualifyingCeutaIncomePercentage ?? 0}%</b><input type="range" min="0" max="100" step="5" value={profile.qualifyingCeutaIncomePercentage ?? 0} onChange={(event) => update("qualifyingCeutaIncomePercentage", Number(event.target.value))} /><small>Es una hipótesis editable, no una validación automática.</small></label>
                <BooleanChoice label="¿El sector figura entre los incluidos en la bonificación RETA?" help="Si no estás seguro, deja este punto para verificación profesional." value={profile.coveredCeutaSocialSecuritySector} onChange={(value) => update("coveredCeutaSocialSecuritySector", value)} />
                <BooleanChoice label="¿Tuviste domicilio fiscal, establecimiento o inmueble afecto en Ceuta durante el período de referencia de 2026?" value={profile.ceutaPresenceDuring2026ReferencePeriod} onChange={(value) => update("ceutaPresenceDuring2026ReferencePeriod", value)} />
                <BooleanChoice label="¿La crisis migratoria declarada afectó negativamente a tu actividad?" help="No se presume: debe declararse y poder justificarse." value={profile.negativelyAffectedBy2026MigrationCrisis} onChange={(value) => update("negativelyAffectedBy2026MigrationCrisis", value)} />
                {profile.newBusiness ? <BooleanChoice label="¿Constabas de alta en el censo antes del 3 de septiembre de 2026?" value={profile.registeredInTaxCensusBefore2026Measure} onChange={(value) => update("registeredInTaxCensusBefore2026Measure", value)} /> : <BooleanChoice label="¿Presentaste la declaración tributaria de 2025 exigida?" value={profile.required2025TaxReturnFiled} onChange={(value) => update("required2025TaxReturnFiled", value)} />}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="section-heading"><div><p className="eyebrow">PASO 4 DE 4</p><h2>Resultado trazable</h2></div><span className="source-badge"><ShieldCheck size={15} /> {results.length + 3} reglas evaluadas</span></div>
              <div className="result-summary">
                <div><strong>{statusCounts.POTENTIALLY_ELIGIBLE + statusCounts.ELIGIBLE}</strong><span>potenciales</span></div>
                <div><strong>{statusCounts.NEEDS_VERIFICATION}</strong><span>por completar</span></div>
                <div><strong>{statusCounts.NOT_ELIGIBLE}</strong><span>no aplicables</span></div>
                <div className="window-summary"><strong>{grant.windowStatus === "OPEN" ? "Abierta" : grant.windowStatus === "UPCOMING" ? "Próxima" : "Cerrada"}</strong><span>convocatoria de contratación</span></div>
              </div>
              <div className="benefit-list">
                {results.map((result) => (
                  <article className={`benefit-card status-${result.status.toLowerCase()}`} key={result.benefitId}>
                    <div className="benefit-title"><div><span>{result.category === "TAX" ? "Fiscal" : "Seguridad Social"}</span><h3>{result.name}</h3></div><b>{statusCopy[result.status]}</b></div>
                    {result.reasons.map((reason) => <p key={reason}>{reason}</p>)}
                    {result.missingFacts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>Falta confirmar:</b> {result.missingFacts.join(", ")}</span></div> : null}
                    {result.warnings.map((warning) => <div className="result-warning" key={warning}><AlertTriangle size={15} /><span>{warning}</span></div>)}
                    <footer><span>Reglas {result.ruleRefs.join(" · ")}</span><a href={sourceById.get(result.sourceIds[0])?.url} target="_blank" rel="noreferrer">Ver fuente oficial <ExternalLink size={13} /></a></footer>
                  </article>
                ))}
                <article className={`benefit-card status-${reducedFee.status.toLowerCase()}`}>
                  <div className="benefit-title"><div><span>Seguridad Social · Inicio de actividad</span><h3>Cuota reducida para nueva alta</h3></div><b>{statusCopy[reducedFee.status]}</b></div>
                  {reducedFee.reasons.map((reason) => <p key={reason}>{reason}</p>)}
                  {reducedFee.missingFacts.length ? <div className="missing-facts"><CircleHelp size={16} /><span><b>Falta confirmar:</b> {reducedFee.missingFacts.join(", ")}</span></div> : null}
                  {reducedFee.warnings.map((warning) => <div className="result-warning" key={warning}><AlertTriangle size={15} /><span>{warning}</span></div>)}
                  <footer><span>Reglas {reducedFee.ruleRefs.join(" · ")}</span><a href={sourceById.get("LETA-ART-38-TER")?.url} target="_blank" rel="noreferrer">Ver norma oficial <ExternalLink size={13} /></a></footer>
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
            <button type="button" className="back-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={16} /> Anterior</button>
            {step < steps.length - 1 ? <button type="button" className="primary-button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Continuar <ArrowRight size={16} /></button> : <button type="button" className="primary-button" onClick={() => setStep(0)}>Editar respuestas</button>}
          </footer>
        </section>
      </div>
    </div>
  );
}
