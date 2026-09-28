import type { EligibilityResult } from "./types";

export type CeutaAutonomoFacts = Readonly<{
  residentInCeuta?: boolean;
  activityPerformedInCeuta?: boolean;
  coveredSector?: boolean;
}>;

export const evaluateCeutaAutonomoBonus = (
  facts: CeutaAutonomoFacts,
): EligibilityResult => {
  const missingFacts = [
    facts.residentInCeuta === undefined ? "Residencia efectiva en Ceuta" : null,
    facts.activityPerformedInCeuta === undefined
      ? "Lugar efectivo de realización de la actividad"
      : null,
    facts.coveredSector === undefined ? "Sector de actividad incluido" : null,
  ].filter((value): value is string => value !== null);

  if (missingFacts.length > 0) {
    return {
      benefitId: "ss-ceuta-autonomo-common-contingencies",
      status: "NEEDS_VERIFICATION",
      reasons: [],
      missingFacts,
      warnings: ["La compatibilidad con otras reducciones debe verificarse."],
      ruleRefs: ["SS-CEUTA-AUTONOMO-2026-v1", "SS-CEUTA-AUTONOMO-2026-v2"],
    };
  }

  if (!facts.residentInCeuta || !facts.activityPerformedInCeuta || !facts.coveredSector) {
    return {
      benefitId: "ss-ceuta-autonomo-common-contingencies",
      status: "NOT_ELIGIBLE",
      reasons: ["La regla exige residencia, ejercicio efectivo de la actividad en Ceuta y un sector incluido."],
      missingFacts: [],
      warnings: [],
      ruleRefs: ["SS-CEUTA-AUTONOMO-2026-v1", "SS-CEUTA-AUTONOMO-2026-v2"],
    };
  }

  return {
    benefitId: "ss-ceuta-autonomo-common-contingencies",
    status: "POTENTIALLY_ELIGIBLE",
    reasons: ["Los hechos declarados encajan en las condiciones generales publicadas por la Seguridad Social."],
    missingFacts: [],
    warnings: ["Debe confirmarse el encuadramiento sectorial y la compatibilidad antes de aplicar la bonificación."],
    ruleRefs: ["SS-CEUTA-AUTONOMO-2026-v1", "SS-CEUTA-AUTONOMO-2026-v2"],
  };
};
