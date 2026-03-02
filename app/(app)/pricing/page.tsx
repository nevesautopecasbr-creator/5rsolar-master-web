"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditableTable } from "@/components/editable-table";
import { apiFetch } from "@/lib/api";
import {
  computePricingSummary,
  formatCurrency,
  formatCurrencyInput,
  formatPercent,
  formatPercentInput,
  monthLabels,
  parseCurrency,
  parsePercent,
} from "@/lib/pricing";

type ExpenseRow = {
  id?: string;
  description: string;
  value: string;
};

type RevenueRow = {
  month: number;
  value: string;
};

type PricingSettings = {
  desiredProfitPct: number;
};

export default function PricingPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [fixedExpenses, setFixedExpenses] = useState<ExpenseRow[]>([]);
  const [variableExpenses, setVariableExpenses] = useState<ExpenseRow[]>([]);
  const [removedFixedIds, setRemovedFixedIds] = useState<string[]>([]);
  const [removedVariableIds, setRemovedVariableIds] = useState<string[]>([]);
  const [revenueBase, setRevenueBase] = useState<RevenueRow[]>(
    Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      value: "",
    })),
  );
  const [desiredProfitInput, setDesiredProfitInput] = useState("20,00");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const hydratedRef = useRef(false);
  const skipAutosaveRef = useRef(true);
  const autosaveTimerRef = useRef<number | null>(null);
  const pendingAutosaveRef = useRef(false);

  const totalFixedMonthly = useMemo(
    () =>
      fixedExpenses.reduce((sum, item) => sum + parseCurrency(item.value), 0),
    [fixedExpenses],
  );

  const totalVariablePct = useMemo(
    () =>
      variableExpenses.reduce((sum, item) => sum + parsePercent(item.value), 0),
    [variableExpenses],
  );

  const annualRevenue = useMemo(
    () => revenueBase.reduce((sum, item) => sum + parseCurrency(item.value), 0),
    [revenueBase],
  );

  const baseMonths = useMemo(
    () => revenueBase.filter((item) => parseCurrency(item.value) > 0).length,
    [revenueBase],
  );

  const desiredProfitPct = useMemo(
    () => parsePercent(desiredProfitInput),
    [desiredProfitInput],
  );

  const summary = useMemo(
    () =>
      computePricingSummary({
        totalFixedMonthly,
        totalVariablePct,
        annualRevenue,
        baseMonths,
        desiredProfitPct,
      }),
    [totalFixedMonthly, totalVariablePct, annualRevenue, baseMonths, desiredProfitPct],
  );

  useEffect(() => {
    let active = true;
    hydratedRef.current = false;
    Promise.all([
      apiFetch("/api/pricing/fixed-expenses"),
      apiFetch("/api/pricing/variable-expenses"),
      apiFetch("/api/pricing/settings"),
      apiFetch(`/api/pricing/revenue-base?year=${year}`),
      apiFetch("/api/pricing/revenue-years"),
    ])
      .then(async ([fixedRes, variableRes, settingsRes, revenueRes, yearsRes]) => {
        if (!active) return;
        const fixed = fixedRes.ok ? await fixedRes.json() : [];
        const variable = variableRes.ok ? await variableRes.json() : [];
        const settings = settingsRes.ok ? await settingsRes.json() : ({} as PricingSettings);
        const revenue = revenueRes.ok ? await revenueRes.json() : [];
        const years = yearsRes.ok ? await yearsRes.json() : [];

        setFixedExpenses(
          Array.isArray(fixed)
            ? fixed.map((item) => ({
                id: item.id,
                description: item.description ?? "",
                value: formatCurrencyInput(Number(item.monthlyValue ?? 0)),
              }))
            : [],
        );
        setVariableExpenses(
          Array.isArray(variable)
            ? variable.map((item) => ({
                id: item.id,
                description: item.description ?? "",
                value: formatPercentInput(Number(item.pct ?? 0)),
              }))
            : [],
        );
        setDesiredProfitInput(
          formatPercentInput(Number(settings?.desiredProfitPct ?? 0.2)),
        );
        setRevenueBase(
          Array.isArray(revenue)
            ? revenue.map((item, index) => ({
                month: item.month ?? index + 1,
                value: formatCurrencyInput(Number(item.revenueValue ?? 0)),
              }))
            : Array.from({ length: 12 }, (_, index) => ({
                month: index + 1,
                value: "",
              })),
        );
        const normalizedYears = Array.isArray(years) ? years : [];
        const uniqueYears = Array.from(new Set([...normalizedYears, currentYear])).sort(
          (a, b) => a - b,
        );
        setAvailableYears(uniqueYears);
        setRemovedFixedIds([]);
        setRemovedVariableIds([]);
        hydratedRef.current = true;
        skipAutosaveRef.current = true;
      })
      .catch(() => {
        if (!active) return;
        setStatus("Falha ao carregar dados de precificação.");
      });
    return () => {
      active = false;
    };
  }, [year]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }
    pendingAutosaveRef.current = true;
    autosaveTimerRef.current = window.setTimeout(() => {
      if (!pendingAutosaveRef.current) return;
      handleAutosave();
    }, 800);
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [fixedExpenses, variableExpenses, revenueBase, desiredProfitInput]);

  function addFixedExpense() {
    setFixedExpenses((prev) => [...prev, { description: "", value: "" }]);
  }

  function removeFixedExpense(index: number) {
    setFixedExpenses((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedFixedIds((removed) => [...removed, target.id!]);
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function addVariableExpense() {
    setVariableExpenses((prev) => [...prev, { description: "", value: "" }]);
  }

  function removeVariableExpense(index: number) {
    setVariableExpenses((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedVariableIds((removed) => [...removed, target.id!]);
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSave(showStatus = true) {
    setLoading(true);
    if (showStatus) {
      setStatus(null);
    }

    const fixedCreates = fixedExpenses.filter((item) => !item.id && item.description.trim());
    const fixedUpdates = fixedExpenses.filter((item) => item.id);
    const variableCreates = variableExpenses.filter(
      (item) => !item.id && item.description.trim(),
    );
    const variableUpdates = variableExpenses.filter((item) => item.id);

    const requests: Promise<Response>[] = [];

    removedFixedIds.forEach((id) => {
      requests.push(apiFetch(`/api/pricing/fixed-expenses/${id}`, { method: "DELETE" }));
    });
    removedVariableIds.forEach((id) => {
      requests.push(
        apiFetch(`/api/pricing/variable-expenses/${id}`, { method: "DELETE" }),
      );
    });

    fixedCreates.forEach((item) => {
      requests.push(
        apiFetch("/api/pricing/fixed-expenses", {
          method: "POST",
          body: JSON.stringify({
            description: item.description,
            monthlyValue: parseCurrency(item.value),
          }),
        }),
      );
    });
    fixedUpdates.forEach((item) => {
      requests.push(
        apiFetch(`/api/pricing/fixed-expenses/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            description: item.description,
            monthlyValue: parseCurrency(item.value),
          }),
        }),
      );
    });

    variableCreates.forEach((item) => {
      requests.push(
        apiFetch("/api/pricing/variable-expenses", {
          method: "POST",
          body: JSON.stringify({
            description: item.description,
            pct: parsePercent(item.value),
          }),
        }),
      );
    });
    variableUpdates.forEach((item) => {
      requests.push(
        apiFetch(`/api/pricing/variable-expenses/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            description: item.description,
            pct: parsePercent(item.value),
          }),
        }),
      );
    });

    requests.push(
      apiFetch(`/api/pricing/revenue-base?year=${year}`, {
        method: "PUT",
        body: JSON.stringify({
          months: revenueBase.map((item) => ({
            month: item.month,
            revenueValue: parseCurrency(item.value),
          })),
        }),
      }),
    );

    requests.push(
      apiFetch("/api/pricing/settings", {
        method: "PUT",
        body: JSON.stringify({ desiredProfitPct }),
      }),
    );

    try {
      const responses = await Promise.all(requests);
      const hasError = responses.some((response) => !response.ok);
      if (hasError) {
        if (showStatus) {
          setStatus("Falha ao salvar ajustes de precificação.");
        }
      } else {
        if (showStatus) {
          setStatus("Precificação atualizada com sucesso.");
        }
        setLastSavedAt(new Date());
        setRemovedFixedIds([]);
        setRemovedVariableIds([]);
      }
    } catch {
      if (showStatus) {
        setStatus("Falha ao salvar ajustes de precificação.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAutosave() {
    if (loading) return;
    pendingAutosaveRef.current = false;
    setIsAutosaving(true);
    await handleSave(false);
    setIsAutosaving(false);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Precificação e Custos</h1>
          <p className="text-sm text-slate-600">
            Controle de despesas e parâmetros para cálculo de markup e CMV máximo.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Ano base</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {availableYears.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-3">
              <h2 className="text-base font-semibold">Despesas Fixas</h2>
              <EditableTable
                columns={[
                  { key: "description", label: "Descrição" },
                  {
                    key: "value",
                    label: "R$ Mensal",
                    align: "right",
                    formatOnBlur: (value) => formatCurrencyInput(parseCurrency(value)),
                  },
                ]}
                rows={fixedExpenses}
                onChange={setFixedExpenses}
                onAddRow={addFixedExpense}
                onRemoveRow={removeFixedExpense}
              />
              <div className="rounded-md border border-slate-200 p-3 text-sm">
                Total mensal: {formatCurrency(totalFixedMonthly)}
              </div>
            </div>
            <div className="grid gap-3">
              <h2 className="text-base font-semibold">Despesas Variáveis</h2>
              <EditableTable
                columns={[
                  { key: "description", label: "Descrição" },
                  {
                    key: "value",
                    label: "% sobre faturamento",
                    align: "right",
                    formatOnBlur: (value) =>
                      formatPercentInput(parsePercent(value)),
                  },
                ]}
                rows={variableExpenses}
                onChange={setVariableExpenses}
                onAddRow={addVariableExpense}
                onRemoveRow={removeVariableExpense}
              />
              <div className="rounded-md border border-slate-200 p-3 text-sm">
                Total percentual: {formatPercent(totalVariablePct)}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <h2 className="text-base font-semibold">Faturamento do Ano</h2>
            <div className="grid gap-3 md:grid-cols-6">
              {revenueBase.map((item, index) => (
                <div key={item.month} className="grid gap-1">
                  <Label>{monthLabels[index]}</Label>
                  <Input
                    value={item.value}
                    onChange={(event) => {
                      const updated = revenueBase.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, value: event.target.value }
                          : row,
                      );
                      setRevenueBase(updated);
                    }}
                    onBlur={(event) => {
                      const updated = revenueBase.map((row, rowIndex) =>
                        rowIndex === index
                          ? {
                              ...row,
                              value: formatCurrencyInput(
                                parseCurrency(event.target.value),
                              ),
                            }
                          : row,
                      );
                      setRevenueBase(updated);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-3 text-sm">
                Total anual: {formatCurrency(annualRevenue)}
              </div>
              <div className="rounded-md border border-slate-200 p-3 text-sm">
                Meses de base: {baseMonths}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Lucro desejado (%)</Label>
              <Input
                value={desiredProfitInput}
                onChange={(event) => setDesiredProfitInput(event.target.value)}
                onBlur={(event) =>
                  setDesiredProfitInput(formatPercentInput(parsePercent(event.target.value)))
                }
              />
            </div>
            <div className="rounded-md border border-slate-200 p-3 text-sm">
              Markup: {summary.markup ? summary.markup.toFixed(2) : "-"}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <div className="rounded-md border border-slate-200 p-3 text-sm">
              Despesas Fixas: {formatPercent(summary.fixedPct)}
            </div>
            <div className="rounded-md border border-slate-200 p-3 text-sm">
              Despesas Variáveis: {formatPercent(summary.variablePct)}
            </div>
            <div className="rounded-md border border-slate-200 p-3 text-sm">
              Lucro desejado: {formatPercent(summary.desiredProfitPct)}
            </div>
            <div className="rounded-md border border-slate-200 p-3 text-sm">
              CMV Máx: {formatPercent(summary.cmvMaxPct)}
            </div>
            <div className="rounded-md border border-slate-200 p-3 text-sm">
              Markup: {summary.markup ? summary.markup.toFixed(2) : "-"}
            </div>
          </div>

          {summary.warnings.includes("ANNUAL_REVENUE_ZERO") ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Informe o faturamento base para calcular o percentual de despesa fixa.
            </div>
          ) : null}
          {summary.warnings.includes("CMV_MAX_INVALID") ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Configuração inviável: soma de percentuais igual ou acima de 100%.
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            {isAutosaving ? (
              <span className="text-sm text-slate-500">Salvando...</span>
            ) : null}
            {lastSavedAt ? (
              <span className="text-sm text-slate-500">
                Última atualização: {lastSavedAt.toLocaleTimeString("pt-BR")}
              </span>
            ) : null}
            {status ? <span className="text-sm text-slate-600">{status}</span> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
