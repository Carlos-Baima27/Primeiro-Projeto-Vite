export function normalizeMoneyValue(value: number | string): number {
  const rawValue = typeof value === "string" ? value.trim().replace(",", ".") : String(value);
  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    throw new TypeError("Valor monetário inválido.");
  }

  return numericValue;
}

export function toCents(value: number | string): number {
  const numericValue = normalizeMoneyValue(value);

  return Math.round((numericValue + Number.EPSILON) * 100);
}

export function fromCents(cents: number): number {
  if (!Number.isFinite(cents)) {
    throw new TypeError("Quantidade em centavos inválida.");
  }

  return cents / 100;
}

export function sumInCents(values: Array<number | string>): number {
  return values.reduce<number>((sum, value) => sum + toCents(value), 0);
}

export function sumValues(values: Array<number | string>): number {
  return fromCents(sumInCents(values));
}

export const convertToCents = toCents;
export const convertFromCents = fromCents;
export const sumCents = sumInCents;
export const sumCurrencyValues = sumValues;
