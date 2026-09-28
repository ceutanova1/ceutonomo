import type { BusinessProfileFacts } from "../profile";
import type { EligibilityResult } from "../eligibility/types";

export type CeutaExtraordinaryAidResult = EligibilityResult & Readonly<{
  amountEuro: number | null;
  applicationDeadline: string;
}>;

export type CeutaExtraordinaryAidRules = Readonly<{
  individualAmountEuro: number;
  companyAmountBrackets: ReadonlyArray<Readonly<{ upToTurnoverEuro: number | null; amountEuro: number }>>;
  applicationDeadline: string;
  measureEffectiveDate: string;
  ruleRef: string;
}>;

export const evaluateCeutaExtraordinaryAid2026 = (
  profile: BusinessProfileFacts,
  rules: CeutaExtraordinaryAidRules,
): CeutaExtraordinaryAidResult => {
  const common: Pick<CeutaExtraordinaryAidResult, "benefitId" | "applicationDeadline" | "ruleRefs"> = {
    benefitId: "aeat-ceuta-extraordinary-aid-2026",
    applicationDeadline: rules.applicationDeadline,
    ruleRefs: [rules.ruleRef],
  };
  if (profile.ceutaPresenceDuring2026ReferencePeriod === false || profile.negativelyAffectedBy2026MigrationCrisis === false) {
    return { ...common, status: "NOT_ELIGIBLE", amountEuro: null, reasons: ["No se cumplen la presencia en Ceuta y la afectación negativa exigidas por la ayuda."], missingFacts: [], warnings: [] };
  }
  const missingFacts = [
    profile.ceutaPresenceDuring2026ReferencePeriod === undefined ? "Presencia fiscal, establecimiento o inmueble afecto en Ceuta durante el período de referencia" : null,
    profile.negativelyAffectedBy2026MigrationCrisis === undefined ? "Afectación negativa por la crisis migratoria declarada" : null,
    profile.newBusiness === true && profile.registeredInTaxCensusBefore2026Measure === undefined ? `Alta censal anterior al ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${rules.measureEffectiveDate}T00:00:00Z`))}` : null,
    profile.newBusiness === false && profile.required2025TaxReturnFiled === undefined ? "Presentación de la declaración tributaria de 2025 exigida" : null,
    profile.legalStructure === "UNDECIDED" || profile.legalStructure === undefined ? "Forma jurídica para determinar el importe" : null,
    profile.legalStructure === "SL" && profile.company2025TurnoverEuro === undefined ? "Volumen de operaciones de 2025 para determinar el tramo" : null,
  ].filter((value): value is string => value !== null);
  const amountEuro = profile.legalStructure === "AUTONOMO"
    ? rules.individualAmountEuro
    : profile.legalStructure === "SL" && profile.company2025TurnoverEuro !== undefined
      ? rules.companyAmountBrackets.find((bracket) => bracket.upToTurnoverEuro === null || profile.company2025TurnoverEuro! <= bracket.upToTurnoverEuro)?.amountEuro ?? null
      : null;
  return {
    ...common,
    status: missingFacts.length ? "NEEDS_VERIFICATION" : "POTENTIALLY_ELIGIBLE",
    amountEuro,
    reasons: missingFacts.length ? [] : ["Los hechos declarados encajan preliminarmente con la ayuda directa extraordinaria."],
    missingFacts,
    warnings: [`La solicitud electrónica ante la AEAT finaliza el ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${rules.applicationDeadline}T00:00:00Z`))}.`, "La ayuda está exenta de IRPF o Impuesto sobre Sociedades, según corresponda."],
  };
};
