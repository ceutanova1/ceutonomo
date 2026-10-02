"use client";

import {
  AlertTriangle, BadgeEuro, BookOpenText, BriefcaseBusiness,
  BookMarked, Calculator, Check, ChevronDown, CircleHelp, FileCheck2, Landmark, Languages, LayoutDashboard,
  MapPinned, Moon, ReceiptText, RotateCcw, Scale, Send, ShieldCheck, Sparkles, Sun, TrendingUp, WalletCards,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { PhaseOneViews } from "@/components/phase-one-views";
import { StructureComparison } from "@/components/structure-comparison";
import { ScenarioExportPanel } from "@/components/scenario-export-panel";
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
import { localizeDomainText, pick } from "@/lib/locale";
import { irpf2026GeneralRules } from "@/rules/2026/irpf";
import { reta2026Rules } from "@/rules/2026/reta";
import { trackAnalyticsEvent } from "@/lib/analytics";
import sources from "@/rules/2026/sources.json";

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
    window.dispatchEvent(new CustomEvent("ceutonomo:locale-changed", { detail: nextLocale }));
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

  const resetDemoScenario = () => {
    const confirmed = window.confirm(locale === "es"
      ? "¿Restaurar el escenario inicial de la demo? Se eliminará únicamente el escenario guardado; conservarás idioma, tema y preferencias de cookies."
      : "Restore the initial demo scenario? Only the saved scenario will be removed; language, theme and cookie preferences will be kept.");
    if (!confirmed) return;

    window.localStorage.removeItem(SCENARIO_STORAGE_KEY);
    setDailyRate("300");
    setDays("21");
    setMonths("12");
    setRevenueMode("DERIVED");
    setManualAnnualRevenue("75600");
    setExpenses(seedExpenses.map((expense) => ({ ...expense })));
    setClientSegments(seedClientSegments.map((segment) => ({ ...segment })));
    setQualifyingCeutaPercentage("100");
    setTaxpayerAge("35");
    setResident(true);
    setWorksInCeuta(true);
    setSimplifiedDirectEstimation(true);
    setDependentWorkerReduction(false);
    setProfile({ ...demoBusinessProfile });
    setSavedAt(null);
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
      <a className="skip-link" href="#main-content">{locale === "es" ? "Saltar al contenido" : "Skip to content"}</a>
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

      <main className="workspace" id="main-content" tabIndex={-1}>
        <div className="mobile-preferences">
          <button type="button" onClick={() => changeLocale(locale === "es" ? "en" : "es")}><Languages size={15} /> {locale === "es" ? "EN" : "ES"}</button>
          <button type="button" aria-label={locale === "es" ? (theme === "light" ? "Tema oscuro" : "Tema claro") : (theme === "light" ? "Dark theme" : "Light theme")} onClick={() => changeTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button>
          <Link className="mobile-legal-link" href="/privacidad">{locale === "es" ? "Privacidad" : "Privacy"}</Link>
          <Link className="mobile-legal-link" href="/legal">{locale === "es" ? "Aviso legal" : "Legal"}</Link>
        </div>
        {activeView === "Elegibilidad" ? <EligibilityWorkspace locale={locale} profile={profile} onProfileChange={updateProfile} /> : activeView === "Autónomo vs SL" ? <StructureComparison locale={locale} annualRevenueCents={model.revenue?.value.cents ?? 0} autonomoExpenseCents={model.expenses?.value.cents ?? 0} autonomoNetCents={model.netAnnualIncome?.cents ?? 0} /> : activeView === "Simulador" || activeView === "Beneficios" || activeView === "Ayudas" || activeView === "Hoja de ruta" || activeView === "Fuentes" ? <PhaseOneViews locale={locale} view={activeView} profile={profile} annualRevenueCents={model.revenue?.value.cents ?? 0} annualNetCents={model.netAnnualIncome?.cents ?? 0} recurringSavingCents={model.irpf && model.contribution ? model.irpf.ceutaGeneralDeduction.cents + model.contribution.annualSaving.cents : 0} onNavigate={setActiveView} /> : activeView === "Ebook" ? (
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
          <div className="header-actions"><span className="year-pill">{locale === "es" ? "Ejercicio" : "Tax year"} 2026</span><button type="button" className="secondary-button save-button" onClick={saveScenario}>{savedAt ? <Check size={15} /> : null}{savedAt ? (locale === "es" ? "Escenario guardado" : "Scenario saved") : (locale === "es" ? "Guardar en este dispositivo" : "Save on this device")}</button><button type="button" className="reset-demo-button" onClick={resetDemoScenario}><RotateCcw aria-hidden="true" size={14} />{locale === "es" ? "Restaurar demo" : "Restore demo"}</button></div>
        </header>

        <section className="status-strip" aria-label="Estado de verificación">
          <span className="status-dot" /><strong>{pick(locale, "Base legal verificada", "Verified legal basis")}</strong><span>{pick(locale, "IRPF general y bonificación RETA de Ceuta", "General income tax and Ceuta RETA relief")}</span><span className="strip-divider" /><AlertTriangle aria-hidden="true" size={16} /><span>{pick(locale, "IPSI, cuota reducida y compatibilidades pendientes: no se estiman", "IPSI, reduced fee and pending compatibility: not estimated")}</span>
        </section>

        <div className="dashboard-section-bar"><div><span>{locale === "es" ? "LECTURA RÁPIDA" : "AT A GLANCE"}</span><h2>{locale === "es" ? "Tu escenario, de más importante a más detallado" : "Your scenario, from most important to most detailed"}</h2></div><span className="live-indicator"><i />{locale === "es" ? "Se actualiza al editar" : "Updates as you edit"}</span></div>
        <section className="dashboard-kpis" aria-label="Resumen económico del escenario">
          <article className="kpi-featured kpi-net"><div className="kpi-icon"><WalletCards size={18} /></div><small>{pick(locale, "Neto anual estimado", "Estimated annual net")}</small><strong>{model.netAnnualIncome ? formatEuro(model.netAnnualIncome) : "—"}</strong><span>{model.netAnnualIncome ? `${formatEuro(euro(Math.round(model.netAnnualIncome.cents / 12)))} / ${pick(locale, "mes disponible", "available per month")}` : pick(locale, "Neto mensual pendiente", "Monthly net pending")}</span></article>
          <article className="kpi-featured kpi-saving"><div className="kpi-icon"><TrendingUp size={18} /></div><small>{pick(locale, "Ahorro recurrente total", "Total recurring saving")}</small><strong>{model.irpf && model.contribution ? formatEuro(euro(model.irpf.ceutaGeneralDeduction.cents + model.contribution.annualSaving.cents)) : "—"}</strong><span>{pick(locale, "Fiscal + Seguridad Social · anual", "Tax + Social Security · annual")}<br />{pick(locale, "No incluye ayudas de pago único", "Excludes one-off grants")}</span></article>
          <article className="verification-kpi kpi-featured"><div className="kpi-icon"><Sparkles size={18} /></div><small>{pick(locale, "Ayuda extraordinaria", "Extraordinary aid")}</small><strong>5.000 €</strong><span>{pick(locale, "Potencial · faltan 2 verificaciones", "Potential · 2 checks missing")}</span></article>
          <article className="kpi-detail"><small>{pick(locale, "Ingresos estimados", "Estimated revenue")}</small><strong>{model.revenue ? formatEuro(model.revenue.value) : "—"}</strong><span>{pick(locale, "Facturación anual", "Annual turnover")}</span></article>
          <article className="kpi-detail"><small>{pick(locale, "Ahorro fiscal Ceuta", "Ceuta tax saving")}</small><strong>{model.irpf ? formatEuro(model.irpf.ceutaGeneralDeduction) : "—"}</strong><span>{pick(locale, "Deducción IRPF recurrente", "Recurring income-tax deduction")}</span></article>
          <article className="kpi-detail"><small>{pick(locale, "Ahorro Seguridad Social", "Social Security saving")}</small><strong>{model.contribution ? formatEuro(model.contribution.annualSaving) : "—"}</strong><span>{pick(locale, "Bonificación RETA 2026", "2026 RETA relief")}</span></article>
        </section>

        <div className="work-grid">
          <section className="input-panel" aria-labelledby="scenario-title">
            <div className="section-heading"><div><p className="eyebrow">{pick(locale, "ESCENARIO DEMO", "DEMO SCENARIO")}</p><h2 id="scenario-title">{pick(locale, "Desarrollador / consultor IT", "Software developer / IT consultant")}</h2></div><button className="icon-button" aria-label={pick(locale, "Más opciones del escenario", "More scenario options")}><ChevronDown size={18} /></button></div>
            <div className="mode-switch" aria-label={pick(locale, "Método de cálculo de ingresos", "Revenue calculation method")}>
              <button type="button" className={revenueMode === "DERIVED" ? "selected" : ""} onClick={() => setRevenueMode("DERIVED")}>{pick(locale, "Tarifa × actividad", "Rate × activity")}</button>
              <button type="button" className={revenueMode === "MANUAL" ? "selected" : ""} onClick={() => setRevenueMode("MANUAL")}>{pick(locale, "Ingresos anuales", "Annual revenue")}</button>
            </div>
            <div className="field-grid">
              {revenueMode === "DERIVED" ? <>
                <label>{pick(locale, "Tarifa diaria", "Daily rate")}<span className="money-input"><b>€</b><input aria-label={pick(locale, "Tarifa diaria", "Daily rate")} inputMode="decimal" value={dailyRate} onChange={(event) => setDailyRate(event.target.value)} /></span></label>
                <label>{pick(locale, "Días / mes", "Days / month")}<input aria-label={pick(locale, "Días facturables al mes", "Billable days per month")} inputMode="numeric" value={days} onChange={(event) => setDays(event.target.value)} /></label>
                <label>{pick(locale, "Meses trabajados", "Working months")}<input aria-label={pick(locale, "Meses trabajados", "Working months")} inputMode="numeric" value={months} onChange={(event) => setMonths(event.target.value)} /></label>
              </> : <label>{pick(locale, "Ingresos anuales", "Annual revenue")}<span className="money-input"><b>€</b><input aria-label={pick(locale, "Ingresos anuales manuales", "Manual annual revenue")} inputMode="decimal" value={manualAnnualRevenue} onChange={(event) => setManualAnnualRevenue(event.target.value)} /></span></label>}
                <label>{pick(locale, "Edad", "Age")}<input aria-label={pick(locale, "Edad del contribuyente", "Taxpayer age")} inputMode="numeric" value={taxpayerAge} onChange={(event) => { setTaxpayerAge(event.target.value); setProfile((current) => ({ ...current, age: parseInteger(event.target.value, 35) })); }} /></label>
            </div>
            <ExpenseEditor locale={locale} expenses={expenses} onChange={setExpenses} />
            <label className="range-field"><span>{pick(locale, "Renta general calificable en Ceuta", "General income qualifying in Ceuta")} <b>{qualifyingCeutaPercentage}%</b></span><input aria-label={pick(locale, "Porcentaje de renta calificable en Ceuta", "Percentage of income qualifying in Ceuta")} type="range" min="0" max="100" step="5" value={qualifyingCeutaPercentage} onChange={(event) => { setQualifyingCeutaPercentage(event.target.value); setProfile((current) => ({ ...current, qualifyingCeutaIncomePercentage: Number(event.target.value) })); }} /><small>{pick(locale, "Vivir en Ceuta no convierte automáticamente toda la renta en renta obtenida en Ceuta.", "Living in Ceuta does not automatically make all income Ceuta-sourced.")}</small></label>
            <ClientDistributionEditor locale={locale} segments={clientSegments} onChange={setClientSegments} totalPercentage={clientDistribution.totalBasisPoints / 100} />
            <div className="fact-checks">
              <label><input type="checkbox" checked={resident} onChange={(event) => { setResident(event.target.checked); setProfile((current) => ({ ...current, residentInCeuta: event.target.checked })); }} /><span><b>{pick(locale, "Resido efectivamente en Ceuta", "I effectively reside in Ceuta")}</b><small>{pick(locale, "La residencia no califica por sí sola todos los ingresos.", "Residence alone does not qualify all income.")}</small></span></label>
              <label><input type="checkbox" checked={worksInCeuta} onChange={(event) => { setWorksInCeuta(event.target.checked); setProfile((current) => ({ ...current, activityPerformedInCeuta: event.target.checked })); }} /><span><b>{pick(locale, "Realizo la actividad desde Ceuta", "I perform the activity from Ceuta")}</b><small>{pick(locale, "Debe poder acreditarse con hechos y medios reales.", "This must be supportable with real facts and resources.")}</small></span></label>
              <label><input type="checkbox" checked={simplifiedDirectEstimation} onChange={(event) => setSimplifiedDirectEstimation(event.target.checked)} /><span><b>{pick(locale, "Tributo en estimación directa simplificada", "I use simplified direct assessment")}</b><small>{pick(locale, "Activa el gasto extraordinario de difícil justificación de 2026 si la actividad califica.", "Enables the 2026 special difficult-to-justify expense when the activity qualifies.")}</small></span></label>
              <label><input type="checkbox" checked={dependentWorkerReduction} onChange={(event) => setDependentWorkerReduction(event.target.checked)} /><span><b>{pick(locale, "Aplico la reducción incompatible de autónomo dependiente / cliente único", "I apply the incompatible dependent-worker / single-client reduction")}</b><small>{pick(locale, "Si se aplica, no se acumula el gasto de difícil justificación.", "When applied, the difficult-to-justify expense is not added.")}</small></span></label>
            </div>
            <div className="client-note"><BriefcaseBusiness aria-hidden="true" size={19} /><span><b>{pick(locale, "Clientes:", "Clients:")}</b> {clientDistribution.isComplete ? pick(locale, "100% clasificados", "100% classified") : `${clientDistribution.totalBasisPoints / 100}% ${pick(locale, "clasificado", "classified")}`}</span><em>{pick(locale, "IPSI/IVA requiere análisis separado", "IPSI/VAT requires separate analysis")}</em></div>
          </section>

          <section className="ledger-panel" aria-labelledby="result-title">
            <div className="section-heading"><div><p className="eyebrow">{pick(locale, "RESULTADO PROVISIONAL", "PROVISIONAL RESULT")}</p><h2 id="result-title">{pick(locale, "Cuenta económica", "Financial account")}</h2></div><span className="source-badge"><ShieldCheck size={15} /> {pick(locale, "Trazable", "Traceable")}</span></div>
            {model.error ? <p className="error-message">{model.error}</p> : (
              <div className="ledger">
                <div className="ledger-row major"><span><small>{pick(locale, "Ingresos brutos", "Gross revenue")}</small>{revenueMode === "DERIVED" ? `${dailyRate} × ${days} × ${months}` : pick(locale, "Importe anual manual", "Manual annual amount")}</span><strong>{formatEuro(model.revenue!.value)}</strong></div>
                <div className="ledger-row negative"><span><small>{pick(locale, "Gastos deducibles estimados", "Estimated deductible expenses")}</small>{expenses.length} {pick(locale, "partidas con afectación individual", "items with individual business allocation")}</span><strong>− {formatEuro(model.expenses!.value)}</strong></div>
                <div className="ledger-row negative"><span><small>{pick(locale, "Seguridad Social estimada", "Estimated Social Security")}</small>{pick(locale, "Base mínima del tramo", "Minimum base for bracket")} {model.contribution!.bracket.id}</span><strong>− {formatEuro(model.contribution!.finalAnnualContribution)}</strong></div>
                <div className="ledger-row saving"><span><small>{pick(locale, "Gasto fiscal 2026 de difícil justificación", "2026 difficult-to-justify tax expense")}</small>{pick(locale, "10% con límite de 2.000 €", "10% capped at €2,000")}</span><strong>+ {formatEuro(model.activityNetIncome!.value.difficultToJustifyExpenses)}</strong></div>
                <div className="ledger-row negative"><span><small>{pick(locale, "IRPF ordinario estimado", "Estimated ordinary income tax")}</small>{pick(locale, "Cuotas estatal + complementaria", "State + supplementary liabilities")}</span><strong>− {formatEuro(model.irpf!.normalGeneralIrpf)}</strong></div>
                <div className="ledger-row saving"><span><small>{pick(locale, "Deducción IRPF Ceuta", "Ceuta income-tax deduction")}</small>{qualifyingCeutaPercentage}% {pick(locale, "de renta general calificable", "of qualifying general income")}</span><strong>+ {formatEuro(model.irpf!.ceutaGeneralDeduction)}</strong></div>
                <div className="ledger-total"><span><small>{pick(locale, "Neto anual estimado", "Estimated annual net")}</small>{pick(locale, "Tras gastos, RETA e IRPF general", "After expenses, RETA and general income tax")}</span><strong>{formatEuro(model.netAnnualIncome!)}</strong></div>
              </div>
            )}
            <div className="pending-block verified-scope"><div className="pending-icon"><CircleHelp size={19} /></div><div><b>IRPF general calculado con reglas verificadas</b><p>IRPF final estimado: {model.irpf ? formatEuro(model.irpf.estimatedGeneralIrpf) : "—"}. Tipo efectivo sobre la base general: {model.irpf ? (model.irpf.effectiveRateBasisPoints / 100).toFixed(2).replace(".", ",") : "—"}%. No incluye rentas del ahorro, otras reducciones, deducciones o pagos a cuenta.</p></div></div>
            <div className="eligibility-result">
              <div><span className={bonus.status === "POTENTIALLY_ELIGIBLE" ? "status-label potential" : "status-label blocked"}>{bonus.status === "POTENTIALLY_ELIGIBLE" ? pick(locale, "POTENCIALMENTE APLICABLE", "POTENTIALLY APPLICABLE") : pick(locale, "NO APLICABLE", "NOT APPLICABLE")}</span><h3>{pick(locale, "Bonificación RETA Ceuta", "Ceuta RETA relief")}</h3><p>{localizeDomainText(locale, bonus.reasons[0])}</p></div>
              <strong className="rate-display">{model.contribution ? formatEuro(model.contribution.annualSaving) : "—"}<small>{pick(locale, "ahorro anual: 50% ene–sep y 75% oct–dic, solo contingencias comunes", "annual saving: 50% Jan–Sep and 75% Oct–Dec, common contingencies only")}</small></strong>
            </div>
            <details className="calculation-details"><summary><ReceiptText size={17} /> Cómo se ha calculado</summary><div><p><b>Ingresos:</b> {revenueMode === "DERIVED" ? "tarifa diaria × días facturables × meses" : "importe anual introducido manualmente"}.</p><p><b>Gastos:</b> cada partida se anualiza y aplica su porcentaje deducible individual. Los bienes de inversión no se deducen por su precio: requieren una amortización anual confirmada.</p><p><b>RETA 2026:</b> rendimiento computable tras 7% genérico, base mínima del tramo oficial y tipos por componente. La bonificación reduce solo contingencias comunes: 50% en enero–septiembre y 75% en octubre–diciembre.</p><p><b>Gastos de difícil justificación:</b> 10% del rendimiento positivo previo, máximo 2.000 €, solo en estimación directa simplificada y sin la reducción incompatible.</p><p><b>IRPF general:</b> escalas estatal y complementaria de Ceuta, menos la cuota correspondiente al mínimo personal, y después el 60% de la cuota proporcional a la renta calificable en Ceuta.</p><p><b>No incluido aún:</b> base del ahorro, IPSI ni ayudas no verificadas.</p></div></details>
          </section>
        </div>

        <section className="timeline-panel" aria-labelledby="timeline-title">
          <div className="section-heading"><div><p className="eyebrow">{pick(locale, "COTIZACIÓN · HORIZONTE 3 AÑOS", "CONTRIBUTIONS · 3-YEAR HORIZON")}</p><h2 id="timeline-title">{pick(locale, "Seguridad Social, sin inventar ejercicios futuros", "Social Security, without inventing future years")}</h2></div><span className="source-badge"><ShieldCheck size={15} /> {pick(locale, "2026 verificado", "2026 verified")}</span></div>
          <div className="timeline-grid">
            {model.contributionTimeline?.map((year) => <article key={year.year} className={year.status === "CALCULATED" ? "timeline-year calculated" : "timeline-year pending"}>
              <header><strong>{year.year}</strong><span>{year.status === "CALCULATED" ? pick(locale, "Calculado", "Calculated") : pick(locale, "Pendiente de normativa", "Rules pending")}</span></header>
              {year.status === "CALCULATED" ? <dl><div><dt>{pick(locale, "Cuota ordinaria", "Standard contribution")}</dt><dd>{formatEuro(year.standardContribution!)}</dd></div><div><dt>{pick(locale, "Incentivo aplicado", "Applied incentive")}</dt><dd>{localizeDomainText(locale, year.appliedIncentive)}</dd></div><div><dt>{pick(locale, "Cuota final", "Final contribution")}</dt><dd>{formatEuro(year.finalContribution!)}</dd></div><div><dt>{pick(locale, "Ahorro anual", "Annual saving")}</dt><dd>{formatEuro(year.annualSaving!)}</dd></div></dl> : <div className="future-year-copy"><CircleHelp size={18} /><p>{localizeDomainText(locale, year.explanation)}</p></div>}
            </article>)}
          </div>
        </section>

        <section className="warning-panel"><AlertTriangle aria-hidden="true" size={20} /><div><b>{pick(locale, "Antes de darte de alta o comprar equipo", "Before registering or buying equipment")}</b><p>{pick(locale, "No hemos verificado una convocatoria PROCESA de autoempleo activa en 2026. Confirma si la solicitud debe presentarse antes del alta, la inversión o el inicio de actividad.", "We have not verified an active 2026 PROCESA self-employment call. Confirm whether the application must be filed before registration, investment or starting the activity.")}</p></div><button type="button" onClick={() => setActiveView("Ayudas")}>{pick(locale, "Ver ayudas", "View grants")}</button></section>
        {model.revenue && model.expenses && model.contribution && model.irpf && model.netAnnualIncome ? <ScenarioExportPanel locale={locale} draft={{
          locale,
          profile: {
            age: profile.age ?? parseInteger(taxpayerAge, 35),
            residentInCeuta: resident,
            activityPerformedInCeuta: worksInCeuta,
            legalStructure: profile.legalStructure ?? "AUTONOMO",
          },
          assumptions: {
            revenueMethod: revenueMode,
            qualifyingCeutaIncomePercentage: parseInteger(qualifyingCeutaPercentage, 0),
            simplifiedDirectEstimation,
            dependentWorkerReduction,
            expenseLines: expenses.length,
            classifiedClientPercentage: clientDistribution.totalBasisPoints / 100,
          },
          results: {
            annualRevenueCents: model.revenue.value.cents,
            deductibleExpensesCents: model.expenses.value.cents,
            retaContributionCents: model.contribution.finalAnnualContribution.cents,
            estimatedIrpfCents: model.irpf.estimatedGeneralIrpf.cents,
            netAnnualIncomeCents: model.netAnnualIncome.cents,
            recurringSavingCents: model.irpf.ceutaGeneralDeduction.cents + model.contribution.annualSaving.cents,
          },
          warnings: [
            "No incluye base del ahorro, IPSI, otras reducciones, deducciones ni pagos a cuenta.",
            "La cuota reducida 2026 y su compatibilidad con la bonificación de Ceuta permanecen pendientes de verificación.",
            "Las ayudas potenciales no se incluyen en el ahorro recurrente ni en el neto anual.",
          ],
          sources: sources.filter((source) => ["BOE-LIRPF-35-2006-68-4", "BOE-RDL-22-2026-ART-36", "BOE-ORDER-PJC-297-2026-ART-18", "LGSS-ART-308-2026", "RDL-22-2026-DA-64"].includes(source.id)).map((source) => ({ id: source.id, title: source.title, url: source.url, verifiedAt: source.lastVerified })),
        }} /> : null}
        <section className="advisor-cta" aria-labelledby="advisor-title"><div><p className="eyebrow">{pick(locale, "SIGUIENTE PASO", "NEXT STEP")}</p><h2 id="advisor-title">{pick(locale, "¿Tu simulación encaja contigo?", "Does this simulation fit your situation?")}</h2><p>{pick(locale, "Envía el resumen a un gestor para revisar los hechos, las compatibilidades y la documentación antes de tomar decisiones.", "Send the summary to an adviser to review the facts, compatibility and documents before making decisions.")}</p></div><a className="primary-button" onClick={() => trackAnalyticsEvent("advisor_contact_started", { channel: "email" })} href={locale === "es" ? "mailto:medalibenali2@gmail.com?subject=Consulta%20CEUTONOMO%20%E2%80%94%20revisi%C3%B3n%20de%20simulaci%C3%B3n&body=Hola%2C%20he%20completado%20una%20simulaci%C3%B3n%20en%20CEUTONOMO%20y%20quiero%20revisarla%20con%20un%20gestor." : "mailto:medalibenali2@gmail.com?subject=CEUTONOMO%20simulation%20review&body=Hello%2C%20I%20have%20completed%20a%20CEUTONOMO%20simulation%20and%20would%20like%20to%20review%20it%20with%20an%20adviser."}><Send size={16} /> {pick(locale, "Solicitar revisión", "Request review")}</a></section>
        <footer className="disclaimer">{pick(locale, "Este simulador ofrece estimaciones informativas según el ejercicio y las reglas verificadas. No sustituye el asesoramiento de la Agencia Tributaria, Seguridad Social, PROCESA o un asesor fiscal cualificado.", "This simulator provides informative estimates for the stated year and verified rules. It does not replace advice from the Spanish Tax Agency, Social Security, PROCESA or a qualified tax adviser.")}</footer>
        </>}
      </main>
    </div>
  );
}
