import type { ConfiguredBenefitRule } from "@/domain/eligibility/benefit-engine";

export const benefitRules2026: ConfiguredBenefitRule[] = [
  {
    id: "irpf-ceuta-general-income",
    name: "Deducción IRPF por rentas obtenidas en Ceuta",
    category: "TAX",
    jurisdiction: "CEUTA",
    ruleRefs: ["IRPF-CEUTA-2026-v1"],
    sourceIds: ["BOE-LIRPF-35-2006-68-4", "AEAT-IRPF-2025-CEUTA-WORKED-EXAMPLE"],
    positiveStatus: "POTENTIALLY_ELIGIBLE",
    successReason: "El perfil declara residencia y actividad efectiva en Ceuta, con renta general identificada como potencialmente calificable.",
    warnings: ["La procedencia de cada renta y la cuota atribuible deben acreditarse; residir en Ceuta no califica automáticamente todos los ingresos."],
    conditions: [
      {
        fact: "taxResidenceCountry",
        label: "Residencia fiscal",
        test: (value) => value === "ES",
        failureReason: "La simulación publicada está limitada a contribuyentes del IRPF español.",
      },
      {
        fact: "residentInCeuta",
        label: "Residencia efectiva en Ceuta",
        test: (value) => value === true,
        failureReason: "El perfil no declara residencia efectiva en Ceuta.",
      },
      {
        fact: "activityPerformedInCeuta",
        label: "Lugar efectivo de la actividad",
        test: (value) => value === true,
        failureReason: "El perfil no declara que la actividad se realice efectivamente desde Ceuta.",
      },
      {
        fact: "qualifyingCeutaIncomePercentage",
        label: "Porcentaje de renta potencialmente obtenida en Ceuta",
        test: (value) => typeof value === "number" && value > 0,
        failureReason: "No se ha identificado renta general potencialmente obtenida en Ceuta.",
      },
    ],
  },
  {
    id: "ss-ceuta-autonomo-common-contingencies",
    name: "Bonificación RETA Ceuta sobre contingencias comunes",
    category: "SOCIAL_SECURITY",
    jurisdiction: "CEUTA",
    ruleRefs: ["SS-CEUTA-AUTONOMO-2026-v1", "SS-CEUTA-AUTONOMO-2026-v2"],
    sourceIds: ["TGSS-BONIFICACION-CEUTA-AUTONOMOS", "BOE-RDL-22-2026-ART-36", "LGSS-ART-308-2026"],
    positiveStatus: "POTENTIALLY_ELIGIBLE",
    successReason: "Los hechos declarados encajan en las condiciones generales publicadas para la bonificación.",
    warnings: ["La bonificación es del 50% hasta septiembre y del 75% para cuotas devengadas desde octubre de 2026. Confirma la compatibilidad con cuota reducida u otros incentivos."],
    conditions: [
      {
        fact: "legalStructure",
        label: "Estructura jurídica",
        test: (value) => value === "AUTONOMO",
        failureReason: "Esta regla se evalúa para personas incluidas en RETA, no para una sociedad por sí sola.",
      },
      {
        fact: "residentInCeuta",
        label: "Residencia efectiva en Ceuta",
        test: (value) => value === true,
        failureReason: "El perfil no declara residencia efectiva en Ceuta.",
      },
      {
        fact: "activityPerformedInCeuta",
        label: "Actividad efectiva en Ceuta",
        test: (value) => value === true,
        failureReason: "La actividad no figura como realizada efectivamente en Ceuta.",
      },
      {
        fact: "coveredCeutaSocialSecuritySector",
        label: "Sector incluido en la bonificación",
        test: (value) => value === true,
        failureReason: "El sector declarado no figura como incluido en esta evaluación.",
      },
    ],
  },
];
