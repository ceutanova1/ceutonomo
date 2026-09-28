import type { BusinessProfileFacts } from "@/domain/profile";

export type GrantWindow = Readonly<{
  id: string;
  opensAt: string;
  closesAt: string;
  budgetEuro: number;
  actionMustFollowApplication: boolean;
}>;

export type GrantProgram = Readonly<{
  id: string;
  name: string;
  authority: string;
  sourceIds: string[];
  amountLabel: string;
  maintenancePeriod: string;
  requiredDocuments: string[];
  windows: GrantWindow[];
}>;

export type GrantWindowStatus = "OPEN" | "UPCOMING" | "CLOSED";

export type GrantEvaluation = Readonly<{
  grantId: string;
  name: string;
  status: "POTENTIALLY_ELIGIBLE" | "NOT_ELIGIBLE" | "NEEDS_VERIFICATION";
  windowStatus: GrantWindowStatus;
  activeWindow: GrantWindow | null;
  nextWindow: GrantWindow | null;
  reasons: string[];
  missingFacts: string[];
  warnings: string[];
  sourceIds: string[];
}>;

const timestamp = (value: string) => new Date(value).getTime();

export const getGrantWindowState = (
  windows: GrantWindow[],
  now: Date,
): Pick<GrantEvaluation, "windowStatus" | "activeWindow" | "nextWindow"> => {
  const currentTime = now.getTime();
  const activeWindow = windows.find((window) => currentTime >= timestamp(window.opensAt) && currentTime <= timestamp(window.closesAt)) ?? null;
  if (activeWindow) return { windowStatus: "OPEN", activeWindow, nextWindow: null };

  const nextWindow = windows.find((window) => currentTime < timestamp(window.opensAt)) ?? null;
  return {
    windowStatus: nextWindow ? "UPCOMING" : "CLOSED",
    activeWindow: null,
    nextWindow,
  };
};

export const evaluateHiringGrant = (
  program: GrantProgram,
  profile: BusinessProfileFacts,
  now: Date,
): GrantEvaluation => {
  const window = getGrantWindowState(program.windows, now);
  const plannedEmployeesKnown = profile.employeesPlanned !== undefined;
  const missingFacts = [
    !plannedEmployeesKnown ? "Número de contrataciones previstas" : null,
    plannedEmployeesKnown && (profile.employeesPlanned ?? 0) > 0 ? "Colectivo subvencionable de la persona a contratar" : null,
    plannedEmployeesKnown && (profile.employeesPlanned ?? 0) > 0 ? "Inscripción de la persona como demandante de empleo en Ceuta" : null,
    plannedEmployeesKnown && (profile.employeesPlanned ?? 0) > 0 ? "Incremento neto de plantilla y ausencia de relación laboral previa" : null,
  ].filter((value): value is string => value !== null);

  if (plannedEmployeesKnown && (profile.employeesPlanned ?? 0) === 0) {
    return {
      grantId: program.id,
      name: program.name,
      status: "NOT_ELIGIBLE",
      ...window,
      reasons: ["El perfil no prevé una contratación indefinida."],
      missingFacts: [],
      warnings: [],
      sourceIds: program.sourceIds,
    };
  }

  if (profile.physicalEstablishmentInCeuta === false) {
    return {
      grantId: program.id,
      name: program.name,
      status: "NOT_ELIGIBLE",
      ...window,
      reasons: ["El proyecto no figura como localizado en Ceuta."],
      missingFacts: [],
      warnings: [],
      sourceIds: program.sourceIds,
    };
  }

  return {
    grantId: program.id,
    name: program.name,
    status: missingFacts.length ? "NEEDS_VERIFICATION" : "POTENTIALLY_ELIGIBLE",
    ...window,
    reasons: missingFacts.length ? [] : ["El perfil y la contratación declarada encajan preliminarmente en la convocatoria."],
    missingFacts,
    warnings: [
      "La concesión es competitiva y depende de puntuación y crédito disponible.",
      ...(window.activeWindow?.actionMustFollowApplication || window.nextWindow?.actionMustFollowApplication
        ? ["Presenta la solicitud antes de formalizar la contratación: una contratación anterior no es subvencionable en esta ventana."]
        : []),
    ],
    sourceIds: program.sourceIds,
  };
};

