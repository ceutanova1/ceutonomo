export type AppLocale = "es" | "en";

export const pick = (locale: AppLocale, spanish: string, english: string) => locale === "es" ? spanish : english;

const englishDomainText: Readonly<Record<string, string>> = {
  "Deducción IRPF por rentas obtenidas en Ceuta": "Income tax deduction for income obtained in Ceuta",
  "Bonificación RETA Ceuta sobre contingencias comunes": "Ceuta RETA relief on common contingencies",
  "PROCESA · Contratación indefinida FSE+": "PROCESA · Permanent hiring FSE+",
  "El perfil declara residencia y actividad efectiva en Ceuta, con renta general identificada como potencialmente calificable.": "The profile declares effective residence and activity in Ceuta, with general income identified as potentially qualifying.",
  "Los hechos declarados encajan en las condiciones generales publicadas para la bonificación.": "The declared facts match the published general conditions for the relief.",
  "Los hechos declarados encajan en las condiciones generales publicadas por la Seguridad Social.": "The declared facts match the general conditions published by Social Security.",
  "La procedencia de cada renta y la cuota atribuible deben acreditarse; residir en Ceuta no califica automáticamente todos los ingresos.": "The source of each income item and the attributable tax must be evidenced; living in Ceuta does not automatically qualify all income.",
  "La bonificación es del 50% hasta septiembre y del 75% para cuotas devengadas desde octubre de 2026. Confirma la compatibilidad con cuota reducida u otros incentivos.": "The relief is 50% through September and 75% for contributions accrued from October 2026. Confirm compatibility with the reduced fee and other incentives.",
  "La simulación publicada está limitada a contribuyentes del IRPF español.": "The published simulation is limited to Spanish personal income tax taxpayers.",
  "El perfil no declara residencia efectiva en Ceuta.": "The profile does not declare effective residence in Ceuta.",
  "El perfil no declara que la actividad se realice efectivamente desde Ceuta.": "The profile does not declare that the activity is effectively performed from Ceuta.",
  "No se ha identificado renta general potencialmente obtenida en Ceuta.": "No potentially Ceuta-sourced general income has been identified.",
  "Esta regla se evalúa para personas incluidas en RETA, no para una sociedad por sí sola.": "This rule is assessed for people covered by RETA, not for a company on its own.",
  "La actividad no figura como realizada efectivamente en Ceuta.": "The activity is not declared as effectively performed in Ceuta.",
  "El sector declarado no figura como incluido en esta evaluación.": "The declared sector is not included in this assessment.",
  "Residencia fiscal": "Tax residence",
  "Residencia efectiva en Ceuta": "Effective residence in Ceuta",
  "Lugar efectivo de la actividad": "Effective place of activity",
  "Porcentaje de renta potencialmente obtenida en Ceuta": "Percentage of income potentially obtained in Ceuta",
  "Estructura jurídica": "Legal structure",
  "Actividad efectiva en Ceuta": "Effective activity in Ceuta",
  "Sector incluido en la bonificación": "Sector covered by the relief",
  "Si es la primera alta en RETA": "Whether this is the first RETA registration",
  "Fecha de la última baja en RETA": "Date of the last RETA deregistration",
  "Si disfrutó antes de una cuota reducida": "Whether a reduced fee was previously used",
  "Fecha prevista de la nueva alta": "Planned date of the new registration",
  "Importe oficial de la cuota reducida para 2026": "Official reduced-fee amount for 2026",
  "Compatibilidad o prioridad frente a la bonificación Ceuta": "Compatibility or priority against the Ceuta relief",
  "Los hechos personales encajan preliminarmente con el acceso a la cuota reducida.": "The personal facts preliminarily match access to the reduced fee.",
  "Debe solicitarse al tramitar el alta.": "It must be requested when registering.",
  "Se exigen dos años sin alta, o tres si ya se disfrutó anteriormente de la reducción.": "Two years without registration are required, or three if the reduction was used previously.",
  "Solicítala al tramitar el alta; el segundo período exige rendimientos inferiores al SMI y una nueva solicitud.": "Request it when registering; the second period requires earnings below the minimum wage and a new application.",
  "Presencia fiscal, establecimiento o inmueble afecto en Ceuta durante el período de referencia": "Tax presence, establishment or business property in Ceuta during the reference period",
  "Afectación negativa por la crisis migratoria declarada": "Negative impact from the declared migration crisis",
  "Presentación de la declaración tributaria de 2025 exigida": "Required 2025 tax return filing",
  "Forma jurídica para determinar el importe": "Legal form needed to determine the amount",
  "Volumen de operaciones de 2025 para determinar el tramo": "2025 turnover needed to determine the bracket",
  "No se cumplen la presencia en Ceuta y la afectación negativa exigidas por la ayuda.": "The Ceuta presence and negative-impact conditions required by the aid are not met.",
  "Los hechos declarados encajan preliminarmente con la ayuda directa extraordinaria.": "The declared facts preliminarily match the extraordinary direct aid.",
  "La ayuda está exenta de IRPF o Impuesto sobre Sociedades, según corresponda.": "The aid is exempt from personal or corporate income tax, as applicable.",
  "Número de contrataciones previstas": "Number of planned hires",
  "Colectivo subvencionable de la persona a contratar": "Eligible category of the person to be hired",
  "Inscripción de la persona como demandante de empleo en Ceuta": "Registration of the candidate as a job seeker in Ceuta",
  "Incremento neto de plantilla y ausencia de relación laboral previa": "Net workforce increase and no previous employment relationship",
  "El perfil no prevé una contratación indefinida.": "The profile does not plan a permanent hire.",
  "El proyecto no figura como localizado en Ceuta.": "The project is not declared as located in Ceuta.",
  "El perfil y la contratación declarada encajan preliminarmente en la convocatoria.": "The profile and declared hire preliminarily match the call.",
  "La concesión es competitiva y depende de puntuación y crédito disponible.": "The award is competitive and depends on scoring and available funding.",
  "Presenta la solicitud antes de formalizar la contratación: una contratación anterior no es subvencionable en esta ventana.": "Submit the application before formalizing the hire: an earlier hire is not eligible in this window.",
  "50% × 9 meses · 75% × 3 meses": "50% × 9 months · 75% × 3 months",
  "No se proyectan importes usando reglas de otro ejercicio.": "No amounts are projected using rules from another tax year.",
};

export const localizeDomainText = (locale: AppLocale, value: string): string => {
  if (locale === "es") return value;
  if (englishDomainText[value]) return englishDomainText[value];
  const years = value.match(/^No ha transcurrido el período mínimo de (\d+) años sin alta en RETA\.$/);
  if (years) return `The minimum period of ${years[1]} years without RETA registration has not elapsed.`;
  if (value.startsWith("Alta censal anterior al ")) return value.replace("Alta censal anterior al ", "Tax registration before ");
  if (value.startsWith("La solicitud electrónica ante la AEAT finaliza el ")) return value.replace("La solicitud electrónica ante la AEAT finaliza el ", "The online AEAT application closes on ");
  return value;
};
