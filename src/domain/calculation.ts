import type { Money } from "./money";

export type CalculationLine = Readonly<{
  id: string;
  label: string;
  amount: Money;
  operation?: "ADD" | "SUBTRACT" | "RESULT";
  explanation: string;
}>;

export type Calculation<T> = Readonly<{
  value: T;
  lines: CalculationLine[];
  assumptions: string[];
  ruleRefs: string[];
}>;

