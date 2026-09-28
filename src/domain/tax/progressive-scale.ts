import { addMoney, applyBasisPoints, euro, type Money } from "../money";

export type ProgressiveBracket = Readonly<{
  upToCents: number | null;
  rateBasisPoints: number;
}>;

export const calculateProgressiveQuota = (
  taxableBase: Money,
  brackets: ProgressiveBracket[],
): Money => {
  if (taxableBase.cents < 0) throw new RangeError("A taxable base cannot be negative.");
  if (brackets.length === 0) throw new RangeError("A progressive scale needs at least one bracket.");

  let previousLimit = 0;
  let remaining = taxableBase.cents;
  const quotaParts: Money[] = [];

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bandWidth = bracket.upToCents === null
      ? remaining
      : bracket.upToCents - previousLimit;
    if (bandWidth < 0) throw new RangeError("Progressive scale limits must be ordered.");
    const taxableInBand = Math.min(remaining, bandWidth);
    quotaParts.push(applyBasisPoints(euro(taxableInBand), bracket.rateBasisPoints));
    remaining -= taxableInBand;
    if (bracket.upToCents !== null) previousLimit = bracket.upToCents;
  }

  if (remaining > 0) throw new RangeError("The progressive scale does not cover the taxable base.");
  return addMoney(...quotaParts);
};

