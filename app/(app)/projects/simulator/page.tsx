"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskMoney, parseMoney } from "@/lib/masks";

type SimulateResult = {
  suggestedPowerKwp: number;
  monthlyGenerationKwh: number;
  monthlySavings: number | null;
  paybackYears: number | null;
  premissas: {
    fioBPct: number;
    simultaneityFactor: number;
    consumerGroup: string | null;
    modality: string | null;
    sunHoursPerDay: number;
    systemLossFactor: number;
  };
};

function formatMoney(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SolarSimulatorPage() {
  const [form, setForm] = useState({
    consumptionKwh: "",
    billValue: "",
    systemCost: "",
    consumerGroup: "",
    modality: "",
    fioBPct: "0,15",
    simultaneityFactor: "0,85",
  });
  const [result, setResult] = useState<SimulateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const consumptionKwh = Number(form.consumptionKwh.replace(",", "."));
    if (!Number.isFinite(consumptionKwh) || consumptionKwh < 1) {
      setError("Informe o consumo mensal em kWh (número maior que 0).");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        consumptionKwh,
        billValue: form.billValue ? parseMoney(form.billValue) : undefined,
        systemCost: form.systemCost ? parseMoney(form.systemCost) : undefined,
        consumerGroup: form.consumerGroup || undefined,
        modality: form.modality || undefined,
        fioBPct: form.fioBPct ? Number(form.fioBPct.replace(",", ".")) : undefined,
        simultaneityFactor: form.simultaneityFactor
          ? Number(form.simultaneityFactor.replace(",", "."))
          : undefined,
      };
      const r = await apiFetch("/api/solar-simulator/calculate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setError(err?.message ?? "Falha ao calcular.");
        return;
      }
      const data: SimulateResult = await r.json();
      setResult(data);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const applyToNewBudget =
    result &&
    `/projects/budget/new?consumptionKwh=${encodeURIComponent(form.consumptionKwh)}&suggestedPowerKwp=${result.suggestedPowerKwp}&monthlySavings=${result.monthlySavings ?? ""}&paybackYears=${result.paybackYears ?? ""}&fioBPct=${result.premissas.fioBPct}&simultaneityFactor=${result.premissas.simultaneityFactor}&consumerGroup=${result.premissas.consumerGroup ?? ""}&modality=${result.premissas.modality ?? ""}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy-900">
          Simulador de consumo e economia
        </h1>
        <p className="mt-1 text-sm text-brand-navy-600">
          Consumo (e opcionalmente conta de luz e custo do sistema). Lei 14.300: fio B e fator de simultaneidade.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-brand-navy-900">Dados de entrada</h2>
            <p className="text-sm text-brand-navy-600">
              Preencha o consumo mensal. Conta de luz e custo do sistema permitem calcular economia e payback.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="consumptionKwh">Consumo mensal (kWh) *</Label>
              <Input
                id="consumptionKwh"
                type="text"
                inputMode="decimal"
                value={form.consumptionKwh}
                onChange={(e) => setForm((p) => ({ ...p, consumptionKwh: e.target.value }))}
                placeholder="Ex: 500"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="billValue">Valor da conta de luz (R$) — opcional</Label>
              <Input
                id="billValue"
                type="text"
                inputMode="decimal"
                value={form.billValue}
                onChange={(e) => setForm((p) => ({ ...p, billValue: maskMoney(e.target.value) }))}
                placeholder="Ex: 450,00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="systemCost">Custo estimado do sistema (R$) — opcional (payback)</Label>
              <Input
                id="systemCost"
                type="text"
                inputMode="decimal"
                value={form.systemCost}
                onChange={(e) => setForm((p) => ({ ...p, systemCost: maskMoney(e.target.value) }))}
                placeholder="Ex: 25000,00"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="consumerGroup">Grupo (A/B)</Label>
                <select
                  id="consumerGroup"
                  className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
                  value={form.consumerGroup}
                  onChange={(e) => setForm((p) => ({ ...p, consumerGroup: e.target.value }))}
                >
                  <option value="">—</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modality">Modalidade</Label>
                <select
                  id="modality"
                  className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
                  value={form.modality}
                  onChange={(e) => setForm((p) => ({ ...p, modality: e.target.value }))}
                >
                  <option value="">—</option>
                  <option value="autoconsumo_local">Autoconsumo local</option>
                  <option value="autoconsumo_remoto">Autoconsumo remoto</option>
                  <option value="geracao_compartilhada">Geração compartilhada</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="fioBPct">Fio B (ex.: 0,15 = 15%)</Label>
                <Input
                  id="fioBPct"
                  type="text"
                  inputMode="decimal"
                  value={form.fioBPct}
                  onChange={(e) => setForm((p) => ({ ...p, fioBPct: e.target.value }))}
                  placeholder="0,15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="simultaneityFactor">Fator de simultaneidade (ex.: 0,85)</Label>
                <Input
                  id="simultaneityFactor"
                  type="text"
                  inputMode="decimal"
                  value={form.simultaneityFactor}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, simultaneityFactor: e.target.value }))
                  }
                  placeholder="0,85"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Calculando..." : "Calcular"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {result && (
        <Card className="border-2 border-brand-navy-200 bg-brand-navy-50/50">
          <CardHeader>
            <h2 className="text-base font-semibold text-brand-navy-900">Resultado da simulação</h2>
            <p className="text-sm text-brand-navy-600">
              Premissas: Lei 14.300 (fio B e simultaneidade) aplicadas.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-navy-600">Potência sugerida (kWp)</dt>
                <dd className="font-medium">{result.suggestedPowerKwp}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-navy-600">Geração mensal estimada (kWh)</dt>
                <dd className="font-medium">{result.monthlyGenerationKwh}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-navy-600">Economia mensal estimada</dt>
                <dd className="font-medium">
                  {result.monthlySavings != null
                    ? `R$ ${formatMoney(result.monthlySavings)}`
                    : "— (informe valor da conta)"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-navy-600">Payback estimado</dt>
                <dd className="font-medium">
                  {result.paybackYears != null
                    ? `${result.paybackYears} anos`
                    : "— (informe custo do sistema e valor da conta)"}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-brand-navy-500">
              Premissas: Fio B {(result.premissas.fioBPct * 100).toFixed(1)}%, simultaneidade{" "}
              {result.premissas.simultaneityFactor}, grupo {result.premissas.consumerGroup ?? "—"},{" "}
              {result.premissas.modality ?? "—"}.
            </p>
            {applyToNewBudget && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href={applyToNewBudget}>
                  <Button type="button">Usar no novo orçamento</Button>
                </Link>
                <Link href="/projects/budget">
                  <Button type="button" variant="outline">
                    Ver orçamentos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Link href="/projects/budget">
          <Button type="button" variant="outline">
            Voltar aos orçamentos
          </Button>
        </Link>
      </div>
    </div>
  );
}
