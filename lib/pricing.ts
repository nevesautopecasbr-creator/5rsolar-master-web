export type PricingSummary = {
  totalFixedMonthly: number;
  totalVariablePct: number;
  annualRevenue: number;
  baseMonths: number;
  fixedPct: number;
  variablePct: number;
  desiredProfitPct: number;
  cmvMaxPct: number;
  markup: number;
  warnings: string[];
};

export function parseCurrency(input: string) {
  if (!input) return 0;
  const normalized = input.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isNaN(value) ? 0 : value;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCurrencyInput(value: number) {
  const formatted = formatCurrency(value);
  return formatted.replace(/[^\d,-]/g, "").trim();
}

export function parsePercent(input: string) {
  if (!input) return 0;
  const normalized = input.replace("%", "").replace(",", ".");
  const value = Number(normalized);
  if (Number.isNaN(value)) return 0;
  return value > 1 ? value / 100 : value;
}

export function formatPercentInput(value: number) {
  const percentValue = value * 100;
  return percentValue.toFixed(2).replace(".", ",");
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}

export function computePricingSummary(input: {
  totalFixedMonthly: number;
  totalVariablePct: number;
  annualRevenue: number;
  baseMonths: number;
  desiredProfitPct: number;
}): PricingSummary {
  const warnings: string[] = [];
  const fixedPct =
    input.annualRevenue > 0
      ? (input.totalFixedMonthly * input.baseMonths) / input.annualRevenue
      : 0;
  if (input.annualRevenue === 0) {
    warnings.push("ANNUAL_REVENUE_ZERO");
  }

  const variablePct = input.totalVariablePct;
  const cmvMaxPct = 1 - (input.desiredProfitPct + fixedPct + variablePct);
  if (cmvMaxPct <= 0) {
    warnings.push("CMV_MAX_INVALID");
  }

  const markup = cmvMaxPct > 0 ? 1 / cmvMaxPct : 0;

  return {
    totalFixedMonthly: input.totalFixedMonthly,
    totalVariablePct: input.totalVariablePct,
    annualRevenue: input.annualRevenue,
    baseMonths: input.baseMonths,
    fixedPct,
    variablePct,
    desiredProfitPct: input.desiredProfitPct,
    cmvMaxPct,
    markup,
    warnings,
  };
}

export function computePricingItem(
  costValue: number,
  currentPrice: number,
  summary: Pick<PricingSummary, "fixedPct" | "variablePct" | "desiredProfitPct" | "cmvMaxPct">,
) {
  if (currentPrice <= 0) {
    return {
      cmvReal: null,
      lucroRealPct: null,
      precoRecomendado: summary.cmvMaxPct > 0 ? costValue / summary.cmvMaxPct : null,
      lucroRealValue: null,
      lucroRecomendadoValue:
        summary.cmvMaxPct > 0 ? (costValue / summary.cmvMaxPct) * summary.desiredProfitPct : null,
    };
  }

  const cmvReal = costValue / currentPrice;
  const lucroRealPct = 1 - (cmvReal + summary.fixedPct + summary.variablePct);
  const precoRecomendado = summary.cmvMaxPct > 0 ? costValue / summary.cmvMaxPct : null;
  const lucroRealValue = currentPrice * lucroRealPct;
  const lucroRecomendadoValue =
    precoRecomendado !== null ? precoRecomendado * summary.desiredProfitPct : null;

  return {
    cmvReal,
    lucroRealPct,
    precoRecomendado,
    lucroRealValue,
    lucroRecomendadoValue,
  };
}

export const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
