"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableTable } from "@/components/editable-table";
import { apiFetch } from "@/lib/api";
import {
  computePricingItem,
  formatCurrency,
  formatCurrencyInput,
  formatPercent,
  parseCurrency,
  PricingSummary,
} from "@/lib/pricing";

type PricingItemRow = {
  id?: string;
  type: string;
  name: string;
  costValue: string;
  currentPrice: string;
};

const itemTypeOptions = [
  { value: "PROJECT", label: "Projeto" },
  { value: "KIT", label: "Kit" },
  { value: "CREDIT", label: "Crédito" },
  { value: "SERVICE", label: "Serviço" },
];

export default function PricingSimulatorPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([
    new Date().getFullYear(),
  ]);
  const [summary, setSummary] = useState<PricingSummary | null>(null);
  const [items, setItems] = useState<PricingItemRow[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const hydratedRef = useRef(false);
  const skipAutosaveRef = useRef(true);
  const autosaveTimerRef = useRef<number | null>(null);
  const pendingAutosaveRef = useRef(false);

  useEffect(() => {
    let active = true;
    hydratedRef.current = false;
    Promise.all([
      apiFetch(`/api/pricing/summary?year=${year}`),
      apiFetch("/api/pricing/items"),
      apiFetch("/api/pricing/revenue-years"),
    ])
      .then(async ([summaryRes, itemsRes, yearsRes]) => {
        if (!active) return;
        const summaryData = summaryRes.ok ? await summaryRes.json() : null;
        const itemsData = itemsRes.ok ? await itemsRes.json() : [];
        const years = yearsRes.ok ? await yearsRes.json() : [];
        setSummary(summaryData);
        setItems(
          Array.isArray(itemsData)
            ? itemsData.map((item) => ({
                id: item.id,
                type: item.type ?? "PROJECT",
                name: item.name ?? "",
                costValue: String(item.costValue ?? ""),
                currentPrice: String(item.currentPrice ?? ""),
              }))
            : [],
        );
        const normalizedYears = Array.isArray(years) ? years : [];
        const uniqueYears = Array.from(new Set([...normalizedYears, year])).sort(
          (a, b) => a - b,
        );
        setAvailableYears(uniqueYears);
        setRemovedIds([]);
        hydratedRef.current = true;
        skipAutosaveRef.current = true;
      })
      .catch(() => {
        if (!active) return;
        setStatus("Falha ao carregar dados do simulador.");
      });
    return () => {
      active = false;
    };
  }, [year]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { type: "PROJECT", name: "", costValue: "", currentPrice: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedIds((removed) => [...removed, target.id!]);
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSave() {
    if (!summary) return;
    setLoading(true);
    setStatus(null);

    const creates = items.filter((item) => !item.id && item.name.trim());
    const updates = items.filter((item) => item.id);

    const requests: Promise<Response>[] = [];
    removedIds.forEach((id) => {
      requests.push(apiFetch(`/api/pricing/items/${id}`, { method: "DELETE" }));
    });
    creates.forEach((item) => {
      requests.push(
        apiFetch("/api/pricing/items", {
          method: "POST",
          body: JSON.stringify({
            type: item.type,
            name: item.name,
            costValue: parseCurrency(item.costValue),
            currentPrice: parseCurrency(item.currentPrice),
          }),
        }),
      );
    });
    updates.forEach((item) => {
      requests.push(
        apiFetch(`/api/pricing/items/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            type: item.type,
            name: item.name,
            costValue: parseCurrency(item.costValue),
            currentPrice: parseCurrency(item.currentPrice),
          }),
        }),
      );
    });

    try {
      const responses = await Promise.all(requests);
      const hasError = responses.some((response) => !response.ok);
      if (hasError) {
        setStatus("Falha ao salvar itens do simulador.");
      } else {
        setStatus("Itens atualizados com sucesso.");
        setLastSavedAt(new Date());
        setRemovedIds([]);
      }
    } catch {
      setStatus("Falha ao salvar itens do simulador.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAutosave() {
    if (loading) return;
    if (hasLineErrors) return;
    pendingAutosaveRef.current = false;
    setIsAutosaving(true);
    await handleSave();
    setIsAutosaving(false);
  }

  const computedRows = useMemo(() => {
    if (!summary) return [];
    return items.map((item) => {
      const cost = parseCurrency(item.costValue);
      const price = parseCurrency(item.currentPrice);
      return {
        ...item,
        costValueNumeric: cost,
        currentPriceNumeric: price,
        calculations: computePricingItem(cost, price, summary),
      };
    });
  }, [items, summary]);

  const hasLineErrors = useMemo(() => {
    return computedRows.some((row) => {
      const hasData =
        row.name.trim().length > 0 ||
        row.costValueNumeric > 0 ||
        row.currentPriceNumeric > 0;
      if (!hasData) return false;
      return row.currentPriceNumeric <= 0;
    });
  }, [computedRows]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    if (hasLineErrors) return;
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
  }, [items, removedIds, hasLineErrors]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Simulador de Preço</h1>
          <p className="text-sm text-brand-navy-600">
            Precifique projetos, kits e serviços com base no CMV máximo.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-brand-navy-700">Ano base</label>
              <select
                className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
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
          {summary ? (
            <div className="grid gap-3 md:grid-cols-5">
              <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                Markup: {summary.markup ? summary.markup.toFixed(2) : "-"}
              </div>
              <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                Lucro desejado: {formatPercent(summary.desiredProfitPct)}
              </div>
              <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                Despesas fixas: {formatPercent(summary.fixedPct)}
              </div>
              <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                Despesas variáveis: {formatPercent(summary.variablePct)}
              </div>
              <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                CMV Máx: {formatPercent(summary.cmvMaxPct)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-brand-navy-600">Carregando resumo...</div>
          )}

          {summary?.warnings.includes("CMV_MAX_INVALID") ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Configuração inviável: soma de percentuais igual ou acima de 100%.
            </div>
          ) : null}

          <EditableTable
            columns={[
              {
                key: "type",
                label: "Tipo",
                type: "select",
                options: itemTypeOptions,
              },
              { key: "name", label: "Nome" },
              {
                key: "costValue",
                label: "Custo (R$)",
                align: "right",
                formatOnBlur: (value) => formatCurrencyInput(parseCurrency(value)),
              },
              {
                key: "currentPrice",
                label: "Preço praticado (R$)",
                align: "right",
                formatOnBlur: (value) => formatCurrencyInput(parseCurrency(value)),
              },
              {
                key: "alerts",
                label: "Alertas",
                render: (_row, index) => {
                  const currentPrice = computedRows[index]?.currentPriceNumeric ?? 0;
                  const alerts: string[] = [];
                  if (currentPrice <= 0) {
                    alerts.push("Preço praticado inválido");
                  }
                  if (summary?.cmvMaxPct !== undefined && summary.cmvMaxPct <= 0) {
                    alerts.push("CMV Máx inválido");
                  }
                  return alerts.length === 0 ? (
                    "-"
                  ) : (
                    <span className="text-xs text-red-600">{alerts.join(" | ")}</span>
                  );
                },
              },
              {
                key: "cmvReal",
                label: "CMV real",
                render: (_row, index) => {
                  const value = computedRows[index]?.calculations.cmvReal;
                  return value === null || value === undefined ? "-" : formatPercent(value);
                },
              },
              {
                key: "lucroRealPct",
                label: "Lucro real (%)",
                render: (_row, index) => {
                  const value = computedRows[index]?.calculations.lucroRealPct;
                  return value === null || value === undefined ? "-" : formatPercent(value);
                },
              },
              {
                key: "precoRecomendado",
                label: "Preço recomendado",
                render: (_row, index) => {
                  const value = computedRows[index]?.calculations.precoRecomendado;
                  return value === null || value === undefined ? "-" : formatCurrency(value);
                },
              },
              {
                key: "lucroRealValue",
                label: "Margem (R$) praticado",
                render: (_row, index) => {
                  const value = computedRows[index]?.calculations.lucroRealValue;
                  return value === null || value === undefined ? "-" : formatCurrency(value);
                },
              },
              {
                key: "lucroRecomendadoValue",
                label: "Margem (R$) recomendada",
                render: (_row, index) => {
                  const value = computedRows[index]?.calculations.lucroRecomendadoValue;
                  return value === null || value === undefined ? "-" : formatCurrency(value);
                },
              },
            ]}
            rows={items}
            onChange={setItems}
            onAddRow={addItem}
            onRemoveRow={removeItem}
            addLabel="Adicionar item"
          />

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            {isAutosaving ? (
              <span className="text-sm text-brand-navy-500">Salvando...</span>
            ) : null}
            {hasLineErrors ? (
              <span className="text-sm text-red-600">
                Autosave pausado: corrija os erros nas linhas.
              </span>
            ) : null}
            {lastSavedAt ? (
              <span className="text-sm text-brand-navy-500">
                Última atualização: {lastSavedAt.toLocaleTimeString("pt-BR")}
              </span>
            ) : null}
            {status ? <span className="text-sm text-brand-navy-600">{status}</span> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
