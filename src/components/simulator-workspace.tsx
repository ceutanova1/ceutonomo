"use client";

import {
  AlertTriangle, BadgeEuro, BookOpenText, BriefcaseBusiness,
  BookMarked, Calculator, Check, ChevronDown, CircleHelp, FileCheck2, Landmark, Languages, LayoutDashboard,
  MapPinned, Moon, ReceiptText, Scale, Send, ShieldCheck, Sparkles, Sun, TrendingUp, WalletCards,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { PhaseOneViews } from "@/components/phase-one-views";
import { StructureComparison } from "@/components/structure-comparison";
import {
  ClientDistributionEditor, ExpenseEditor, seedClientSegments, seedExpenses,
  type ClientSegmentDraft, type ExpenseDraft, type RevenueMode,
} from "@/components/financial-inputs";
import { evaluateCeutaAutonomoBonus } from "@/domain/eligibility/ceuta-autonomo-bonus";
import { applyBasisPoints, euro, formatEuro, parseEuro, subtractMoney } from "@/domain/money";
import { type BusinessProfileFacts, demoBusinessProfile } from "@/domain/profile";
import { calculateRetaContribution } from "@/domain/social-security/reta";
import { buildThreeYearRetaTimeline } from "@/domain/social-security/timeline";
import { analyzeClientDistribution } from "@/domain/simulations/client-distribution";
import { calculateDeductibleExpenses } from "@/domain/simulations/expenses";
import { calculateRevenue } from "@/domain/simulations/revenue";
import { calculateEconomicActivityNetIncome2026 } from "@/domain/tax/economic-activity";
import { calculateIrpfGeneral } from "@/domain/tax/irpf";
import { irpf2026GeneralRules } from "@/rules/2026/irpf";
import { reta2026Rules } from "@/rules/2026/reta";

const EligibilityWorkspace = dynamic(
  () => import("@/components/eligibility-workspace").then((module) => module.EligibilityWorkspace),
  { loading: () => <p className="loading-panel">Preparando el diagnóstico…</p> },
);

const navItems = [
  ["Dashboard", LayoutDashboard], ["Elegibilidad", ShieldCheck], ["Simulador", Calculator],
  ["Autónomo vs SL", Scale], ["Beneficios", BadgeEuro], ["Ayudas", Landmark],
  ["Hoja de ruta", MapPinned], ["Fuentes", BookOpenText], ["Ebook", BookMarked],
] as const;

type Locale = "es" | "en";
type Theme = "light" | "dark";

const englishNav: Record<(typeof navItems)[number][0], string> = {
  Dashboard: "Dashboard", Elegibilidad: "Eligibility", Simulador: "Simulator",
  "Autónomo vs SL": "Self-employed vs LLC", Beneficios: "Benefits", Ayudas: "Grants",
  "Hoja de ruta": "Roadmap", Fuentes: "Sources", Ebook: "Ebook",
};

const parseInteger = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const SCENARIO_STORAGE_KEY = "ceutaunomo-scenario-v1";

export function SimulatorWorkspace() {
  const [activeView, setActiveView] = useState<(typeof navItems)[number][0]>("Dashboard");
  const [dailyRate, setDailyRate] = useState("300");
  const [days, setDays] = useState("21");
  const [months, setMonths] = useState("12");
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("DERIVED");
  const [manualAnnualRevenue, setManualAnnualRevenue] = useState("75600");
  const [expenses, setExpenses] = useState<ExpenseDraft[]>(seedExpenses);
  const [clientSegments, setClientSegments] = useState<ClientSegmentDraft[]>(seedClientSegments);
  const [qualifyingCeutaPercentage, setQualifyingCeutaPercentage] = useState("100");
  const [taxpayerAge, setTaxpayerAge] = useState("35");
  const [resident, setResident] = useState(true);
  const [worksInCeuta, setWorksInCeuta] = useState(true);
  const [simplifiedDirectEstimation, setSimplifiedDirectEstimation] = useState(true);
  const [dependentWorkerReduction, setDependentWorkerReduction] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [interfaceReady, setInterfaceReady] = useState(false);
  const [locale, setLocale] = useState<Locale>("es");
  const [theme, setTheme] = useState<Theme>("light");
  const [profile, setProfile] = useState<BusinessProfileFacts>(demoBusinessProfile);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedLocale = window.localStorage.getItem("ceutaunomo-locale-v1");
        const storedTheme = window.localStorage.getItem("ceutaunomo-theme-v1");
        if (storedLocale === "es" || storedLocale === "en") {
          setLocale(storedLocale);
          document.documentElement.lang = storedLocale;
        }
        if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
        const stored = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
        if (!stored) return;
        const scenario = JSON.parse(stored) as Record<string, unknown>;
        if (typeof scenario.dailyRate === "string") setDailyRate(scenario.dailyRate);
        if (typeof scenario.days === "string") setDays(scenario.days);
        if (typeof scenario.months === "string") setMonths(scenario.months);
        if (scenario.revenueMode === "DERIVED" || scenario.revenueMode === "MANUAL") setRevenueMode(scenario.revenueMode);
        if (typeof scenario.manualAnnualRevenue === "string") setManualAnnualRevenue(scenario.manualAnnualRevenue);
        if (Array.isArray(scenario.expenses)) setExpenses(scenario.expenses as ExpenseDraft[]);
        if (Array.isArray(scenario.clientSegments)) setClientSegments(scenario.clientSegments as ClientSegmentDraft[]);
        if (typeof scenario.qualifyingCeutaPercentage === "string") setQualifyingCeutaPercentage(scenario.qualifyingCeutaPercentage);
        if (typeof scenario.taxpayerAge === "string") setTaxpayerAge(scenario.taxpayerAge);
        if (typeof scenario.resident === "boolean") setResident(scenario.resident);
        if (typeof scenario.worksInCeuta === "boolean") setWorksInCeuta(scenario.worksInCeuta);
        if (typeof scenario.simplifiedDirectEstimation === "boolean") setSimplifiedDirectEstimation(scenario.simplifiedDirectEstimation);
        if (typeof scenario.dependentWorkerReduction === "boolean") setDependentWorkerReduction(scenario.dependentWorkerReduction);
        if (scenario.profile && typeof scenario.profile === "object") setProfile(scenario.profile as BusinessProfileFacts);
        if (typeof scenario.savedAt === "string") setSavedAt(scenario.savedAt);
      } catch {
        window.localStorage.removeItem(SCENARIO_STORAGE_KEY);
      } finally {
        setInterfaceReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    window.localStorage.setItem("ceutaunomo-locale-v1", nextLocale);
    document.documentElement.lang = nextLocale;
  };

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    window.localStorage.setItem("ceutaunomo-theme-v1", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const saveScenario = () => {
    const timestamp = new Date().toISOString();
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify({
      dailyRate, days, months, revenueMode, manualAnnualRevenue, expenses, clientSegments,
      qualifyingCeutaPercentage, taxpayerAge, resident, worksInCeuta,
      simplifiedDirectEstimation, dependentWorkerReduction, savedAt: timestamp,
      profile,
    }));
    setSavedAt(timestamp);
  };

  const updateProfile = (nextProfile: BusinessProfileFacts) => {
    setProfile(nextProfile);
    if (typeof nextProfile.age === "number") setTaxpayerAge(String(nextProfile.age));
    if (typeof nextProfile.residentInCeuta === "boolean") setResident(nextProfile.residentInCeuta);
    if (typeof nextProfile.activityPerformedInCeuta === "boolean") setWorksInCeuta(nextProfile.activityPerformedInCeuta);
    if (typeof nextProfile.qualifyingCeutaIncomePercentage === "number") setQualifyingCeutaPercentage(String(nextProfile.qualifyingCeutaIncomePercentage));
  };

  const bonus = evaluateCeutaAutonomoBonus({ residentInCeuta: resident, activityPerformedInCeuta: worksInCeuta, coveredSector: true });

  const clientDistribution = useMemo(() => {
    try {
      return {
        ...analyzeClientDistribution(clientSegments.map((segment) => ({
          ...segment,
          shareBasisPoints: Math.min(10_000, Math.max(0, parseInteger(segment.percentage, 0) * 100)),
        }))),
        error: null,
      };
    } catch (error) {
      return { totalBasisPoints: clientSegments.reduce((total, segment) => total + Math.max(0, parseInteger(segment.percentage, 0) * 100), 0), unallocatedBasisPoints: 0, isComplete: false, segments: [], error: error instanceof Error ? error.message : "Revisa la distribución." };
    }
  }, [clientSegments]);

  const model = useMemo(() => {
    try {
      const revenue = revenueMode === "MANUAL" ? calculateRevenue({
        mode: "MANUAL",
        annualRevenue: parseEuro(manualAnnualRevenue || "0"),
      }) : calculateRevenue({
        dailyRate: parseEuro(dailyRate || "0"),
        billableDaysPerMonth: parseInteger(days, 0),
        workingMonths: parseInteger(months, 0),
      });
      const deductibleExpenses = calculateDeductibleExpenses(expenses.map((expense) => ({
        id: expense.id,
        label: expense.label,
        amount: parseEuro(expense.amount || "0"),
        frequency: expense.frequency,
        deductibleBasisPoints: parseInteger(expense.deductiblePercentage, 0) * 100,
        taxTreatment: expense.taxTreatment,
        notes: expense.notes,
      })));
      const preContributionProfit = subtractMoney(revenue.value, deductibleExpenses.value);
      const contribution = calculateRetaContribution({
        annualNetReturnBeforeGenericDeduction: preContributionProfit,
        activeMonths: 12,
        isSocietaryAutonomo: false,
        applyCeutaBonus: bonus.status === "POTENTIALLY_ELIGIBLE",
      }, reta2026Rules);
      const preTaxIncome = subtractMoney(preContributionProfit, contribution.finalAnnualContribution);
      const activityNetIncome = calculateEconomicActivityNetIncome2026({
        netIncomeBeforeDifficultExpenses: preTaxIncome,
        simplifiedDirectEstimation,
        qualifyingCeutaActivity: worksInCeuta,
        appliesIncompatibleDependentWorkerReduction: dependentWorkerReduction,
      });
      const irpf = calculateIrpfGeneral({
        generalTaxableBase: activityNetIncome.value.taxableNetIncome,
        qualifyingCeutaGeneralBase: applyBasisPoints(
          activityNetIncome.value.taxableNetIncome,
          Math.min(10_000, Math.max(0, parseInteger(qualifyingCeutaPercentage, 0) * 100)),
        ),
        taxpayerAge: parseInteger(taxpayerAge, 35),
        additionalPersonalFamilyMinimum: euro(0),
        applyCeutaDeduction: worksInCeuta,
      }, irpf2026GeneralRules);
      return {
        revenue,
        expenses: deductibleExpenses,
        preContributionProfit,
        contribution,
        preTaxIncome,
        activityNetIncome,
        irpf,
        netAnnualIncome: subtractMoney(preTaxIncome, irpf.estimatedGeneralIrpf),
        contributionTimeline: buildThreeYearRetaTimeline(2026, contribution),
        error: null,
      };
    } catch (error) {
      return {
        revenue: null,
        expenses: null,
        preContributionProfit: null,
        contribution: null,
        preTaxIncome: null,
        activityNetIncome: null,
        irpf: null,
        netAnnualIncome: null,
        contributionTimeline: null,
        error: error instanceof Error ? error.message : "Revisa los importes.",
      };
    }
  }, [revenueMode, manualAnnualRevenue, dailyRate, days, months, expenses, qualifyingCeutaPercentage, taxpayerAge, worksInCeuta, simplifiedDirectEstimation, dependentWorkerReduction, bonus.status]);

  return (
    <div className="app-shell" data-interface-ready={interfaceReady ? "true" : "false"}>
      <aside className="sidebar">
        <div className="brand-mark"><BrandLogo /></div>
        <nav aria-label={locale === "es" ? "Navegación principal" : "Main navigation"}>
          {navItems.map(([label, Icon], index) => <div className="nav-entry" key={label}>
            {index === 0 ? <span className="nav-group-label">{locale === "es" ? "PLANIFICA" : "PLAN"}</span> : null}
            {index === 4 ? <span className="nav-group-label">{locale === "es" ? "EXPLORA" : "EXPLORE"}</span> : null}
            <button type="button" aria-current={activeView === label ? "page" : undefined} className={activeView === label ? "nav-item active" : "nav-item"} onClick={() => setActiveView(label)}><Icon aria-hidden="true" size={18} /><span>{locale === "es" ? label : englishNav[label]}</span></button>
          </div>)}
        </nav>
        <div className="sidebar-foot">
          <div className="preference-controls" aria-label={locale === "es" ? "Preferencias" : "Preferences"}>
            <div className="preference-group"><Languages size={16} /><button type="button" className={locale === "es" ? "selected" : ""} onClick={() => changeLocale("es")}>ES</button><button type="button" className={locale === "en" ? "selected" : ""} onClick={() => changeLocale("en")}>EN</button></div>
            <div className="preference-group"><button type="button" aria-label={locale === "es" ? "Tema claro" : "Light theme"} className={theme === "light" ? "selected icon-choice" : "icon-choice"} onClick={() => changeTheme("light")}><Sun size={15} /></button><button type="button" aria-label={locale === "es" ? "Tema oscuro" : "Dark theme"} className={theme === "dark" ? "selected icon-choice" : "icon-choice"} onClick={() => changeTheme("dark")}><Moon size={15} /></button></div>
          </div>
          <div className="verified-note"><FileCheck2 aria-hidden="true" size={18} /><span>{locale === "es" ? "Reglas 2026" : "2026 rules"}<small>{locale === "es" ? "Verificación en curso" : "Verification in progress"}</small></span></div>
          <nav className="legal-links" aria-label={locale === "es" ? "Información legal" : "Legal information"}>
            <Link href="/privacidad">{locale === "es" ? "Privacidad" : "Privacy"}</Link>
            <Link href="/legal">{locale === "es" ? "Aviso legal" : "Legal notice"}</Link>
          </nav>
        </div>
      </aside>

      <main className="workspace">
        <div className="mobile-preferences">
          <button type="button" onClick={() => changeLocale(locale === "es" ? "en" : "es")}><Languages size={15} /> {locale === "es" ? "EN" : "ES"}</button>
          <button type="button" aria-label={locale === "es" ? (theme === "light" ? "Tema oscuro" : "Tema claro") : (theme === "light" ? "Dark theme" : "Light theme")} onClick={() => changeTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button>
          <Link className="mobile-legal-link" href="/privacidad">{locale === "es" ? "Privacidad" : "Privacy"}</Link>
          <Link className="mobile-legal-link" href="/legal">{locale === "es" ? "Aviso legal" : "Legal"}</Link>
        </div>
        {activeView === "Elegibilidad" ? <EligibilityWorkspace profile={profile} onProfileChange={updateProfile} /> : activeView === "Autónomo vs SL" ? <StructureComparison locale={locale} annualRevenueCents={model.revenue?.value.cents ?? 0} autonomoExpenseCents={model.expenses?.value.cents ?? 0} autonomoNetCents={model.netAnnualIncome?.cents ?? 0} /> : activeView === "Simulador" || activeView === "Beneficios" || activeView === "Ayudas" || activeView === "Hoja de ruta" || activeView === "Fuentes" ? <PhaseOneViews view={activeView} profile={profile} annualRevenueCents={model.revenue?.value.cents ?? 0} annualNetCents={model.netAnnualIncome?.cents ?? 0} recurringSavingCents={model.irpf && model.contribution ? model.irpf.ceutaGeneralDeduction.cents + model.contribution.annualSaving.cents : 0} onNavigate={setActiveView} /> : activeView === "Ebook" ? (
          <section className="ebook-panel">
            <div className="ebook-cover"><BookMarked size={42} /><span>CEUTONOMO</span><strong>{locale === "es" ? "Guía práctica para emprender en Ceuta" : "A practical guide to starting a business in Ceuta"}</strong><small>EDICIÓN 2026</small></div>
            <div className="ebook-copy"><p className="eyebrow">{locale === "es" ? "FASE FINAL · PRODUCTO DIGITAL" : "FINAL PHASE · DIGITAL PRODUCT"}</p><h1>{locale === "es" ? "De la simulación a una guía que puedas conservar." : "From simulation to a guide you can keep."}</h1><p>{locale === "es" ? "El ebook reunirá el método, ejemplos, listas de comprobación y fuentes verificadas de CEUTONOMO. Se ofrecerá como compra independiente para quien necesite una guía más profunda." : "The ebook will bring together CEUTONOMO’s method, examples, checklists and verified sources. It will be sold separately for people who need a deeper guide."}</p><ul><li>{locale === "es" ? "Versión española primero; edición inglesa después." : "Spanish edition first; English edition afterwards."}</li><li>{locale === "es" ? "Actualización y fecha de vigencia visibles." : "Visible update and validity dates."}</li><li>{locale === "es" ? "Pago y descarga se activarán solo en la fase final." : "Payment and download will only be enabled in the final phase."}</li></ul><span className="coming-soon">{locale === "es" ? "Próximamente" : "Coming soon"}</span></div>
          </section>
        ) : activeView !== "Dashboard" ? (
          <section className="phase-placeholder">
            <p className="eyebrow">{locale === "es" ? "PRÓXIMA ENTREGA" : "NEXT RELEASE"}</p>
            <h1>{locale === "es" ? activeView : englishNav[activeView]}</h1>
            <p>{locale === "es" ? "Esta sección se activará cuando sus reglas y fuentes oficiales estén verificadas. Puedes continuar con el plan económico o completar el diagnóstico de elegibilidad." : "This section will be enabled once its rules and official sources are verified. You can continue with the financial plan or complete the eligibility assessment."}</p>
            <div><button type="button" className="primary-button" onClick={() => setActiveView("Dashboard")}>{locale === "es" ? "Volver al dashboard" : "Back to dashboard"}</button><button type="button" className="secondary-button" onClick={() => setActiveView("Elegibilidad")}>{locale === "es" ? "Completar diagnóstico" : "Complete assessment"}</button></div>
          </section>
        ) : <>
        <header className="workspace-header">
          <div><p className="eyebrow">CEUTONOMO · {locale === "es" ? "DEMO PRIVADA" : "PRIVATE DEMO"}</p><h1>{locale === "es" ? "Tu actividad en Ceuta, explicada euro a euro." : "Your Ceuta business, explained euro by euro."}</h1><p className="lede">{locale === "es" ? "Simula. Decide. Emprende con claridad. Solo mostramos como ahorro lo que puede trazarse a una regla oficial." : "Simulate. Decide. Start with clarity. We only show savings that can be traced to an official rule."}</p></div>
          <div className="header-actions"><span className="year-pill">{locale === "es" ? "Ejercicio" : "Tax year"} 2026</span><button type="button" className="secondary-button save-button" onClick={saveScenario}>{savedAt ? <Check size={15} /> : null}{savedAt ? (locale === "es" ? "Escenario guardado" : "Scenario saved") : (locale === "es" ? "Guardar en este dispositivo" : "Save on this device")}</button></div>
        </header>

        <section className="status-strip" aria-label="Estado de verificación">
          <span className="status-dot" /><strong>Base legal verificada</strong><span>IRPF general y bonificación RETA de Ceuta</span><span className="strip-divider" /><AlertTriangle aria-hidden="true" size={16} /><span>IPSI, cuota reducida y compatibilidades pendientes: no se estiman</span>
        </section>

        <div className="dashboard-section-bar"><div><span>{locale === "es" ? "LECTURA RÁPIDA" : "AT A GLANCE"}</span><h2>{locale === "es" ? "Tu escenario, de más importante a más detallado" : "Your scenario, from most important to most detailed"}</h2></div><span className="live-indicator"><i />{locale === "es" ? "Se actualiza al editar" : "Updates as you edit"}</span></div>
        <section className="dashboard-kpis" aria-label="Resumen económico del escenario">
          <article className="kpi-featured kpi-net"><div className="kpi-icon"><WalletCards size={18} /></div><small>Neto anual estimado</small><strong>{model.netAnnualIncome ? formatEuro(model.netAnnualIncome) : "—"}</strong><span>{model.netAnnualIncome ? `${formatEuro(euro(Math.round(model.netAnnualIncome.cents / 12)))} / mes disponible` : "Neto mensual pendiente"}</span></article>
          <article className="kpi-featured kpi-saving"><div className="kpi-icon"><TrendingUp size={18} /></div><small>Ahorro recurrente total</small><strong>{model.irpf && model.contribution ? formatEuro(euro(model.irpf.ceutaGeneralDeduction.cents + model.contribution.annualSaving.cents)) : "—"}</strong><span>Fiscal + Seguridad Social · anual<br />No incluye ayudas de pago único</span></article>
          <article className="verification-kpi kpi-featured"><div className="kpi-icon"><Sparkles size={18} /></div><small>Ayuda extraordinaria</small><strong>5.000 €</strong><span>Potencial · faltan 2 verificaciones</span></article>
          <article className="kpi-detail"><small>Ingresos estimados</small><strong>{model.revenue ? formatEuro(model.revenue.value) : "—"}</strong><span>Facturación anual</span></article>
          <article className="kpi-detail"><small>Ahorro fiscal Ceuta</small><strong>{model.irpf ? formatEuro(model.irpf.ceutaGeneralDeduction) : "—"}</strong><span>Deducción IRPF recurrente</span></article>
          <article className="kpi-detail"><small>Ahorro Seguridad Social</small><strong>{model.contribution ? formatEuro(model.contribution.annualSaving) : "—"}</strong><span>Bonificación RETA 2026</span></article>
        </section>

        <div className="work-grid">
          <section className="input-panel" aria-labelledby="scenario-title">
            <div className="section-heading"><div><p className="eyebrow">ESCENARIO DEMO</p><h2 id="scenario-title">Desarrollador / consultor IT</h2></div><button className="icon-button" aria-label="Más opciones del escenario"><ChevronDown size={18} /></button></div>
            <div className="mode-switch" aria-label="Método de cálculo de ingresos">
              <button type="button" className={revenueMode === "DERIVED" ? "selected" : ""} onClick={() => setRevenueMode("DERIVED")}>Tarifa × actividad</button>
              <button type="button" className={revenueMode === "MANUAL" ? "selected" : ""} onClick={() => setRevenueMode("MANUAL")}>Ingresos anuales</button>
            </div>
            <div className="field-grid">
              {revenueMode === "DERIVED" ? <>
                <label>Tarifa diaria<span className="money-input"><b>€</b><input aria-label="Tarifa diaria" inputMode="decimal" value={dailyRate} onChange={(event) => setDailyRate(event.target.value)} /></span></label>
                <label>Días / mes<input aria-label="Días facturables al mes" inputMode="numeric" value={days} onChange={(event) => setDays(event.target.value)} /></label>
                <label>Meses trabajados<input aria-label="Meses trabajados" inputMode="numeric" value={months} onChange={(event) => setMonths(event.target.value)} /></label>
              </> : <label>Ingresos anuales<span className="money-input"><b>€</b><input aria-label="Ingresos anuales manuales" inputMode="decimal" value={manualAnnualRevenue} onChange={(event) => setManualAnnualRevenue(event.target.value)} /></span></label>}
                <label>Edad<input aria-label="Edad del contribuyente" inputMode="numeric" value={taxpayerAge} onChange={(event) => { setTaxpayerAge(event.target.value); setProfile((current) => ({ ...current, age: parseInteger(event.target.value, 35) })); }} /></label>
            </div>
            <ExpenseEditor expenses={expenses} onChange={setExpenses} />
            <label className="range-field"><span>Renta general calificable en Ceuta <b>{qualifyingCeutaPercentage}%</b></span><input aria-label="Porcentaje de renta calificable en Ceuta" type="range" min="0" max="100" step="5" value={qualifyingCeutaPercentage} onChange={(event) => { setQualifyingCeutaPercentage(event.target.value); setProfile((current) => ({ ...current, qualifyingCeutaIncomePercentage: Number(event.target.value) })); }} /><small>Vivir en Ceuta no convierte automáticamente toda la renta en renta obtenida en Ceuta.</small></label>
            <ClientDistributionEditor segments={clientSegments} onChange={setClientSegments} totalPercentage={clientDistribution.totalBasisPoints / 100} />
            <div className="fact-checks">
              <label><input type="checkbox" checked={resident} onChange={(event) => { setResident(event.target.checked); setProfile((current) => ({ ...current, residentInCeuta: event.target.checked })); }} /><span><b>Resido efectivamente en Ceuta</b><small>La residencia no califica por sí sola todos los ingresos.</small></span></label>
              <label><input type="checkbox" checked={worksInCeuta} onChange={(event) => { setWorksInCeuta(event.target.checked); setProfile((current) => ({ ...current, activityPerformedInCeuta: event.target.checked })); }} /><span><b>Realizo la actividad desde Ceuta</b><small>Debe poder acreditarse con hechos y medios reales.</small></span></label>
              <label><input type="checkbox" checked={simplifiedDirectEstimation} onChange={(event) => setSimplifiedDirectEstimation(event.target.checked)} /><span><b>Tributo en estimación directa simplificada</b><small>Activa el gasto extraordinario de difícil justificación de 2026 si la actividad califica.</small></span></label>
              <label><input type="checkbox" checked={dependentWorkerReduction} onChange={(event) => setDependentWorkerReduction(event.target.checked)} /><span><b>Aplico la reducción incompatible de autónomo dependiente / cliente único</b><small>Si se aplica, no se acumula el gasto de difícil justificación.</small></span></label>
            </div>
            <div className="client-note"><BriefcaseBusiness aria-hidden="true" size={19} /><span><b>Clientes:</b> {clientDistribution.isComplete ? "100% clasificados" : `${clientDistribution.totalBasisPoints / 100}% clasificado`}</span><em>IPSI/IVA requiere análisis separado</em></div>
          </section>

          <section className="ledger-panel" aria-labelledby="result-title">
            <div className="section-heading"><div><p className="eyebrow">RESULTADO PROVISIONAL</p><h2 id="result-title">Cuenta económica</h2></div><span className="source-badge"><ShieldCheck size={15} /> Trazable</span></div>
            {model.error ? <p className="error-message">{model.error}</p> : (
              <div className="ledger">
                <div className="ledger-row major"><span><small>Ingresos brutos</small>{revenueMode === "DERIVED" ? `${dailyRate} × ${days} × ${months}` : "Importe anual manual"}</span><strong>{formatEuro(model.revenue!.value)}</strong></div>
                <div className="ledger-row negative"><span><small>Gastos deducibles estimados</small>{expenses.length} partidas con afectación individual</span><strong>− {formatEuro(model.expenses!.value)}</strong></div>
                <div className="ledger-row negative"><span><small>Seguridad Social estimada</small>Base mínima del tramo {model.contribution!.bracket.id}</span><strong>− {formatEuro(model.contribution!.finalAnnualContribution)}</strong></div>
                <div className="ledger-row saving"><span><small>Gasto fiscal 2026 de difícil justificación</small>10% con límite de 2.000 €</span><strong>+ {formatEuro(model.activityNetIncome!.value.difficultToJustifyExpenses)}</strong></div>
                <div className="ledger-row negative"><span><small>IRPF ordinario estimado</small>Cuotas estatal + complementaria</span><strong>− {formatEuro(model.irpf!.normalGeneralIrpf)}</strong></div>
                <div className="ledger-row saving"><span><small>Deducción IRPF Ceuta</small>{qualifyingCeutaPercentage}% de renta general calificable</span><strong>+ {formatEuro(model.irpf!.ceutaGeneralDeduction)}</strong></div>
                <div className="ledger-total"><span><small>Neto anual estimado</small>Tras gastos, RETA e IRPF general</span><strong>{formatEuro(model.netAnnualIncome!)}</strong></div>
              </div>
            )}
            <div className="pending-block verified-scope"><div className="pending-icon"><CircleHelp size={19} /></div><div><b>IRPF general calculado con reglas verificadas</b><p>IRPF final estimado: {model.irpf ? formatEuro(model.irpf.estimatedGeneralIrpf) : "—"}. Tipo efectivo sobre la base general: {model.irpf ? (model.irpf.effectiveRateBasisPoints / 100).toFixed(2).replace(".", ",") : "—"}%. No incluye rentas del ahorro, otras reducciones, deducciones o pagos a cuenta.</p></div></div>
            <div className="eligibility-result">
              <div><span className={bonus.status === "POTENTIALLY_ELIGIBLE" ? "status-label potential" : "status-label blocked"}>{bonus.status === "POTENTIALLY_ELIGIBLE" ? "POTENCIALMENTE APLICABLE" : "NO APLICABLE"}</span><h3>Bonificación RETA Ceuta</h3><p>{bonus.reasons[0]}</p></div>
              <strong className="rate-display">{model.contribution ? formatEuro(model.contribution.annualSaving) : "—"}<small>ahorro anual: 50% ene–sep y 75% oct–dic, solo contingencias comunes</small></strong>
            </div>
            <details className="calculation-details"><summary><ReceiptText size={17} /> Cómo se ha calculado</summary><div><p><b>Ingresos:</b> {revenueMode === "DERIVED" ? "tarifa diaria × días facturables × meses" : "importe anual introducido manualmente"}.</p><p><b>Gastos:</b> cada partida se anualiza y aplica su porcentaje deducible individual. Los bienes de inversión no se deducen por su precio: requieren una amortización anual confirmada.</p><p><b>RETA 2026:</b> rendimiento computable tras 7% genérico, base mínima del tramo oficial y tipos por componente. La bonificación reduce solo contingencias comunes: 50% en enero–septiembre y 75% en octubre–diciembre.</p><p><b>Gastos de difícil justificación:</b> 10% del rendimiento positivo previo, máximo 2.000 €, solo en estimación directa simplificada y sin la reducción incompatible.</p><p><b>IRPF general:</b> escalas estatal y complementaria de Ceuta, menos la cuota correspondiente al mínimo personal, y después el 60% de la cuota proporcional a la renta calificable en Ceuta.</p><p><b>No incluido aún:</b> base del ahorro, IPSI ni ayudas no verificadas.</p></div></details>
          </section>
        </div>

        <section className="timeline-panel" aria-labelledby="timeline-title">
          <div className="section-heading"><div><p className="eyebrow">COTIZACIÓN · HORIZONTE 3 AÑOS</p><h2 id="timeline-title">Seguridad Social, sin inventar ejercicios futuros</h2></div><span className="source-badge"><ShieldCheck size={15} /> 2026 verificado</span></div>
          <div className="timeline-grid">
            {model.contributionTimeline?.map((year) => <article key={year.year} className={year.status === "CALCULATED" ? "timeline-year calculated" : "timeline-year pending"}>
              <header><strong>{year.year}</strong><span>{year.status === "CALCULATED" ? "Calculado" : "Pendiente de normativa"}</span></header>
              {year.status === "CALCULATED" ? <dl><div><dt>Cuota ordinaria</dt><dd>{formatEuro(year.standardContribution!)}</dd></div><div><dt>Incentivo aplicado</dt><dd>{year.appliedIncentive}</dd></div><div><dt>Cuota final</dt><dd>{formatEuro(year.finalContribution!)}</dd></div><div><dt>Ahorro anual</dt><dd>{formatEuro(year.annualSaving!)}</dd></div></dl> : <div className="future-year-copy"><CircleHelp size={18} /><p>{year.explanation}</p></div>}
            </article>)}
          </div>
        </section>

        <section className="warning-panel"><AlertTriangle aria-hidden="true" size={20} /><div><b>Antes de darte de alta o comprar equipo</b><p>No hemos verificado una convocatoria PROCESA de autoempleo activa en 2026. Confirma si la solicitud debe presentarse antes del alta, la inversión o el inicio de actividad.</p></div><button>Ver ayudas</button></section>
        <section className="advisor-cta" aria-labelledby="advisor-title"><div><p className="eyebrow">SIGUIENTE PASO</p><h2 id="advisor-title">¿Tu simulación encaja contigo?</h2><p>Envía el resumen a un gestor para revisar los hechos, las compatibilidades y la documentación antes de tomar decisiones.</p></div><a className="primary-button" href="mailto:medalibenali2@gmail.com?subject=Consulta%20CEUTONOMO%20%E2%80%94%20revisi%C3%B3n%20de%20simulaci%C3%B3n&body=Hola%2C%20he%20completado%20una%20simulaci%C3%B3n%20en%20CEUTONOMO%20y%20quiero%20revisarla%20con%20un%20gestor."><Send size={16} /> Solicitar revisión</a></section>
        <footer className="disclaimer">Este simulador ofrece estimaciones informativas según el ejercicio y las reglas verificadas. No sustituye el asesoramiento de la Agencia Tributaria, Seguridad Social, PROCESA o un asesor fiscal cualificado.</footer>
        </>}
      </main>
    </div>
  );
}
