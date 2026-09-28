export type Money = Readonly<{
  currency: "EUR";
  cents: number;
}>;

const ensureSafeCents = (cents: number): number => {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError("Money must use safe integer cents.");
  }
  return cents;
};

export const euro = (cents: number): Money => ({
  currency: "EUR",
  cents: ensureSafeCents(cents),
});

export const parseEuro = (value: string): Money => {
  const normalized = value.trim().replace(",", ".");
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new TypeError("Use a monetary amount with no more than two decimals.");

  const [, sign, whole, fraction = ""] = match;
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return euro(sign === "-" ? -cents : cents);
};

export const addMoney = (...values: Money[]): Money =>
  euro(values.reduce((total, value) => total + value.cents, 0));

export const subtractMoney = (left: Money, right: Money): Money =>
  euro(left.cents - right.cents);

export const multiplyMoney = (value: Money, multiplier: number): Money => {
  if (!Number.isSafeInteger(multiplier)) {
    throw new TypeError("Money multipliers must be safe integers.");
  }
  return euro(value.cents * multiplier);
};

export const applyBasisPoints = (value: Money, basisPoints: number): Money => {
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new RangeError("A rate must be between 0 and 10,000 basis points.");
  }
  const absolute = Math.abs(value.cents);
  const rounded = Math.floor((absolute * basisPoints + 5_000) / 10_000);
  return euro(value.cents < 0 ? -rounded : rounded);
};

export const formatEuro = (value: Money, locale = "es-ES"): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
    maximumFractionDigits: 0,
  }).format(value.cents / 100);

