import type { EligibilityResult } from "./types";

export type ReducedFeeFacts = Readonly<{
  firstTimeAutonomo?: boolean;
  previousAutonomoEndDate?: string;
  previouslyUsedReducedFee?: boolean;
  plannedStartDate?: string;
}>;

const yearsBetween = (earlier: Date, later: Date): number =>
  (later.getTime() - earlier.getTime()) / (365.2425 * 24 * 60 * 60 * 1000);

export const evaluateReducedFee2026 = (facts: ReducedFeeFacts): EligibilityResult => {
  if (facts.firstTimeAutonomo === undefined) {
    return {
      benefitId: "ss-reduced-fee-2026",
      status: "NEEDS_VERIFICATION",
      reasons: [],
      missingFacts: ["Si es la primera alta en RETA"],
      warnings: ["Debe solicitarse al tramitar el alta."],
      ruleRefs: ["LETA-ART-38-TER", "RDL-13-2022-DT5"],
    };
  }

  if (!facts.firstTimeAutonomo) {
    const missing = [
      !facts.previousAutonomoEndDate ? "Fecha de la última baja en RETA" : null,
      facts.previouslyUsedReducedFee === undefined ? "Si disfrutó antes de una cuota reducida" : null,
      !facts.plannedStartDate ? "Fecha prevista de la nueva alta" : null,
    ].filter((value): value is string => value !== null);
    if (missing.length) {
      return {
        benefitId: "ss-reduced-fee-2026",
        status: "NEEDS_VERIFICATION",
        reasons: [],
        missingFacts: missing,
        warnings: ["Se exigen dos años sin alta, o tres si ya se disfrutó anteriormente de la reducción."],
        ruleRefs: ["LETA-ART-38-TER", "RDL-13-2022-DT5"],
      };
    }
    const requiredYears = facts.previouslyUsedReducedFee ? 3 : 2;
    if (yearsBetween(new Date(facts.previousAutonomoEndDate!), new Date(facts.plannedStartDate!)) < requiredYears) {
      return {
        benefitId: "ss-reduced-fee-2026",
        status: "NOT_ELIGIBLE",
        reasons: [`No ha transcurrido el período mínimo de ${requiredYears} años sin alta en RETA.`],
        missingFacts: [],
        warnings: [],
        ruleRefs: ["LETA-ART-38-TER"],
      };
    }
  }

  return {
    benefitId: "ss-reduced-fee-2026",
    status: "NEEDS_VERIFICATION",
    reasons: ["Los hechos personales encajan preliminarmente con el acceso a la cuota reducida."],
    missingFacts: ["Importe oficial de la cuota reducida para 2026", "Compatibilidad o prioridad frente a la bonificación Ceuta"],
    warnings: ["Solicítala al tramitar el alta; el segundo período exige rendimientos inferiores al SMI y una nueva solicitud."],
    ruleRefs: ["LETA-ART-38-TER", "RDL-13-2022-DT5"],
  };
};

