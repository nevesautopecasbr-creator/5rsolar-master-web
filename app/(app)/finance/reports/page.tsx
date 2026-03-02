"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type CashflowData = {
  forecast: { inflow: number; outflow: number };
  realized: { inflow: number; outflow: number };
};

type CostByCustomer = {
  items: Array<{ customerId: string | null; customerName: string; total: number }>;
};

function getYearRange() {
  const start = new Date();
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(11, 31);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default function Page() {
  const { start, end } = getYearRange();
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [costByCustomer, setCostByCustomer] = useState<CostByCustomer | null>(null);
  const [startDate, setStartDate] = useState<string>(formatDateInput(start));
  const [endDate, setEndDate] = useState<string>(formatDateInput(end));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleLoad().catch(() => undefined);
  }, []); 

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

  async function handleLoad() {
    setLoading(true);
    setCashflow(null);
    setCostByCustomer(null);
    const params = new URLSearchParams({
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
    });
    try {
      const [cashflowRes, costRes] = await Promise.all([
        apiFetch(`/api/finance/reports/cashflow?${params.toString()}`),
        apiFetch(`/api/finance/reports/cost-by-customer?${params.toString()}`),
      ]);
      setCashflow(cashflowRes.ok ? await cashflowRes.json() : null);
      setCostByCustomer(costRes.ok ? await costRes.json() : null);
    } catch {
      setCashflow(null);
      setCostByCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Relatórios Financeiros</h1>
          <p className="text-sm text-slate-600">
            Fluxo de caixa e custo por cliente.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <span className="text-sm font-medium">Data inicial</span>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">Data final</span>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={handleLoad} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Fluxo de caixa</h2>
        </CardHeader>
        <CardContent>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Entrada</th>
              <th className="px-3 py-2 text-left font-semibold">Saída</th>
            </tr>
          </thead>
          <tbody>
            {cashflow ? (
              <>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2">Previsto</td>
                  <td className="px-3 py-2">
                    {currency.format(cashflow.forecast.inflow)}
                  </td>
                  <td className="px-3 py-2">
                    {currency.format(cashflow.forecast.outflow)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2">Realizado</td>
                  <td className="px-3 py-2">
                    {currency.format(cashflow.realized.inflow)}
                  </td>
                  <td className="px-3 py-2">
                    {currency.format(cashflow.realized.outflow)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={3}>
                  Carregando relatório...
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Custo por cliente</h2>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 text-left font-semibold">Cliente</th>
                <th className="px-3 py-2 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {costByCustomer ? (
                costByCustomer.items.length > 0 ? (
                  costByCustomer.items.map((item) => (
                    <tr key={item.customerId ?? item.customerName} className="border-b border-slate-100">
                      <td className="px-3 py-2">{item.customerName}</td>
                      <td className="px-3 py-2">{currency.format(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-500" colSpan={2}>
                      Nenhum custo encontrado no período.
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={2}>
                    Carregando relatório...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}