"use client";

import { AlertTriangle, Check, Plus, Trash2 } from "lucide-react";

import type { ClientKind, ClientRegion } from "@/domain/simulations/client-distribution";
import type { ExpenseInput } from "@/domain/simulations/expenses";

export type RevenueMode = "DERIVED" | "MANUAL";

export type ExpenseDraft = Readonly<{
  id: string;
  label: string;
  amount: string;
  frequency: ExpenseInput["frequency"];
  deductiblePercentage: string;
  taxTreatment: ExpenseInput["taxTreatment"];
  notes: string;
}>;

export type ClientSegmentDraft = Readonly<{
  id: string;
  label: string;
  region: ClientRegion;
  clientKind: ClientKind;
  percentage: string;
}>;

export const seedExpenses: ExpenseDraft[] = [
  { id: "gestoria", label: "Gestoría / contabilidad", amount: "80", frequency: "MONTHLY", deductiblePercentage: "100", taxTreatment: "DIRECT", notes: "Servicio profesional afecto a la actividad." },
  { id: "software", label: "Software y suscripciones", amount: "120", frequency: "MONTHLY", deductiblePercentage: "100", taxTreatment: "DIRECT", notes: "Herramientas utilizadas en la prestación." },
  { id: "internet", label: "Internet", amount: "60", frequency: "MONTHLY", deductiblePercentage: "50", taxTreatment: "PARTIALLY_AFFECTED", notes: "Supuesto de uso mixto editable." },
  { id: "phone", label: "Teléfono", amount: "40", frequency: "MONTHLY", deductiblePercentage: "50", taxTreatment: "PARTIALLY_AFFECTED", notes: "Supuesto de uso mixto editable." },
  { id: "electricity", label: "Electricidad", amount: "100", frequency: "MONTHLY", deductiblePercentage: "30", taxTreatment: "PARTIALLY_AFFECTED", notes: "Requiere revisar afectación y reglas de vivienda habitual." },
  { id: "equipment", label: "Equipo informático", amount: "1440", frequency: "ANNUAL", deductiblePercentage: "0", taxTreatment: "CAPITAL_ASSET", notes: "Precio de compra informativo; introduce solo la amortización anual fiscal cuando esté confirmada." },
];

export const seedClientSegments: ClientSegmentDraft[] = [
  { id: "mainland-b2b", label: "Península B2B", region: "MAINLAND_SPAIN", clientKind: "B2B", percentage: "70" },
  { id: "ceuta-b2b", label: "Ceuta B2B", region: "CEUTA", clientKind: "B2B", percentage: "0" },
  { id: "eu-b2b", label: "UE B2B", region: "EU", clientKind: "B2B", percentage: "30" },
  { id: "eu-b2c", label: "UE consumidores", region: "EU", clientKind: "B2C", percentage: "0" },
  { id: "non-eu", label: "Fuera de la UE", region: "NON_EU", clientKind: "B2B", percentage: "0" },
];

type ExpenseEditorProps = {
  expenses: ExpenseDraft[];
  onChange: (expenses: ExpenseDraft[]) => void;
};

const treatmentLabels: Record<ExpenseInput["taxTreatment"], string> = {
  DIRECT: "Gasto directo",
  PARTIALLY_AFFECTED: "Afectación parcial",
  CAPITAL_ASSET: "Bien de inversión",
  PAYROLL: "Personal",
  REQUIRES_REVIEW: "Requiere revisión",
};

export function ExpenseEditor({ expenses, onChange }: ExpenseEditorProps) {
  const updateExpense = (id: string, change: Partial<ExpenseDraft>) => onChange(
    expenses.map((expense) => expense.id === id ? { ...expense, ...change } : expense),
  );

  return (
    <details className="input-disclosure">
      <summary>Gastos desglosados <span>{expenses.length} partidas</span></summary>
      <div className="expense-editor">
        {expenses.map((expense) => (
          <article className="expense-row" key={expense.id}>
            <div className="expense-row-head">
              <input aria-label={`Nombre de ${expense.label}`} value={expense.label} onChange={(event) => updateExpense(expense.id, { label: event.target.value })} />
              <button type="button" aria-label={`Eliminar ${expense.label}`} onClick={() => onChange(expenses.filter((item) => item.id !== expense.id))}><Trash2 size={15} /></button>
            </div>
            <div className="expense-fields">
              <label>Importe €<input aria-label={`Importe de ${expense.label}`} inputMode="decimal" value={expense.amount} onChange={(event) => updateExpense(expense.id, { amount: event.target.value })} /></label>
              <label>Frecuencia<select aria-label={`Frecuencia de ${expense.label}`} value={expense.frequency} onChange={(event) => updateExpense(expense.id, { frequency: event.target.value as ExpenseDraft["frequency"] })}><option value="MONTHLY">Mensual</option><option value="ANNUAL">Anual</option></select></label>
              <label>Deducible %<input aria-label={`Porcentaje deducible de ${expense.label}`} type="number" min="0" max="100" value={expense.deductiblePercentage} onChange={(event) => updateExpense(expense.id, { deductiblePercentage: event.target.value })} /></label>
              <label>Tratamiento<select aria-label={`Tratamiento fiscal de ${expense.label}`} value={expense.taxTreatment} onChange={(event) => updateExpense(expense.id, { taxTreatment: event.target.value as ExpenseDraft["taxTreatment"] })}>{Object.entries(treatmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            <label className="expense-notes">Notas<input aria-label={`Notas de ${expense.label}`} value={expense.notes} onChange={(event) => updateExpense(expense.id, { notes: event.target.value })} /></label>
          </article>
        ))}
        <button type="button" className="add-line-button" onClick={() => onChange([...expenses, { id: crypto.randomUUID(), label: "Otro gasto", amount: "0", frequency: "MONTHLY", deductiblePercentage: "0", taxTreatment: "REQUIRES_REVIEW", notes: "Pendiente de justificar y clasificar." }])}><Plus size={15} /> Añadir gasto</button>
      </div>
    </details>
  );
}

type ClientDistributionEditorProps = {
  segments: ClientSegmentDraft[];
  onChange: (segments: ClientSegmentDraft[]) => void;
  totalPercentage: number;
};

export function ClientDistributionEditor({ segments, onChange, totalPercentage }: ClientDistributionEditorProps) {
  const update = (id: string, percentage: string) => onChange(segments.map((segment) => segment.id === id ? { ...segment, percentage } : segment));
  const complete = totalPercentage === 100;
  return (
    <details className="input-disclosure client-disclosure">
      <summary>Distribución de clientes <span className={complete ? "complete" : "incomplete"}>{complete ? <Check size={13} /> : <AlertTriangle size={13} />}{totalPercentage}% clasificado</span></summary>
      <div className="client-distribution">
        {segments.map((segment) => (
          <label key={segment.id}><span>{segment.label}<small>{segment.region.replaceAll("_", " ")} · {segment.clientKind}</small></span><span className="percentage-input"><input aria-label={`Porcentaje ${segment.label}`} type="number" min="0" max="100" value={segment.percentage} onChange={(event) => update(segment.id, event.target.value)} />%</span></label>
        ))}
        <p className={complete ? "distribution-note complete" : "distribution-note"}>{complete ? "La cartera está clasificada al 100%. Esta distribución se utilizará después para el análisis IPSI/IVA." : "La distribución debe sumar exactamente 100% antes de analizar el impuesto indirecto."}</p>
      </div>
    </details>
  );
}
