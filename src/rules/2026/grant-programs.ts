import type { GrantProgram } from "@/domain/grants/grant-program";

export const procesaIndefiniteHiring2026: GrantProgram = {
  id: "procesa-indefinite-hiring-fse-2026",
  name: "PROCESA · Contratación indefinida FSE+",
  authority: "PROCESA — Ciudad Autónoma de Ceuta",
  sourceIds: ["PROCESA-CONTRATACION-INDEFINIDA-2026", "BOCCE-6608-CONTRATACION-INDEFINIDA-2026"],
  amountLabel: "7.350 €–10.265 €; posible incremento no concurrente de 500 €. Jornada parcial: 50%.",
  maintenancePeriod: "3 años",
  requiredDocuments: [
    "Solicitud electrónica",
    "Modelo de autobaremación y acreditación de criterios",
    "Declaración responsable del artículo 13.3 bis de la Ley General de Subvenciones",
    "Documentación laboral y de pertenencia al colectivo subvencionable",
  ],
  windows: [
    {
      id: "fifth-2026",
      opensAt: "2026-06-01T00:00:00+02:00",
      closesAt: "2026-09-30T13:00:00+02:00",
      budgetEuro: 200_000,
      actionMustFollowApplication: true,
    },
    {
      id: "sixth-2026",
      opensAt: "2026-10-01T00:00:00+02:00",
      closesAt: "2026-12-30T13:00:00+01:00",
      budgetEuro: 200_000,
      actionMustFollowApplication: true,
    },
  ],
};

