"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskMoney, parseMoney } from "@/lib/masks";

const CHART_ACCOUNT_TYPES: Array<{ value: string; label: string }> = [
  { value: "ASSET", label: "Ativo" },
  { value: "LIABILITY", label: "Passivo" },
  { value: "EQUITY", label: "Patrimônio líquido" },
  { value: "REVENUE", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
];

type BankOption = { id: string; name?: string | null };

export type NewAccountKind = "cash" | "chart";

type NewAccountFormProps = {
  initialKind?: NewAccountKind;
  /** Atualiza quando initialKind muda (ex.: abrir modal com tipo definido pelo botão) */
  kindKey?: number | string;
  onSubmitted: (payload: { kind: NewAccountKind; id: string }) => void;
  onCancel?: () => void;
  showCancel?: boolean;
  submitLabel?: string;
};

export function NewAccountForm({
  initialKind = "cash",
  kindKey,
  onSubmitted,
  onCancel,
  showCancel,
  submitLabel = "Salvar conta",
}: NewAccountFormProps) {
  const [kind, setKind] = useState<NewAccountKind>(initialKind);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const [cashName, setCashName] = useState("");
  const [cashBankId, setCashBankId] = useState("");
  const [cashNumber, setCashNumber] = useState("");
  const [cashOpening, setCashOpening] = useState("");
  const [cashActive, setCashActive] = useState(true);

  const [chartCode, setChartCode] = useState("");
  const [chartName, setChartName] = useState("");
  const [chartType, setChartType] = useState("EXPENSE");
  const [chartActive, setChartActive] = useState(true);

  useEffect(() => {
    setKind(initialKind);
  }, [initialKind, kindKey]);

  useEffect(() => {
    let active = true;
    setBanksLoading(true);
    apiFetch("/api/banks")
      .then(async (r) => {
        if (!r.ok) return [];
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then((list) => {
        if (active) setBanks(list as BankOption[]);
      })
      .catch(() => {
        if (active) setBanks([]);
      })
      .finally(() => {
        if (active) setBanksLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit() {
    setStatus(null);
    setSaving(true);
    try {
      if (kind === "cash") {
        const name = cashName.trim();
        if (!name) {
          setStatus("Informe o nome da conta caixa.");
          setSaving(false);
          return;
        }
        const body: Record<string, unknown> = {
          name,
          isActive: cashActive,
        };
        if (cashBankId) body.bankId = cashBankId;
        if (cashNumber.trim()) body.number = cashNumber.trim();
        const parsed = cashOpening.trim() ? parseMoney(cashOpening) : undefined;
        if (parsed !== undefined) body.openingBalance = parsed;

        const res = await apiFetch("/api/cash-accounts", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = Array.isArray((err as { message?: unknown }).message)
            ? (err as { message: string[] }).message.join(" • ")
            : typeof (err as { message?: string }).message === "string"
              ? (err as { message: string }).message
              : `HTTP ${res.status}`;
          setStatus(msg);
          return;
        }
        const created = (await res.json()) as { id: string };
        onSubmitted({ kind: "cash", id: created.id });
        return;
      }

      const code = chartCode.trim();
      const name = chartName.trim();
      if (!code || !name) {
        setStatus("Código e nome da conta contábil são obrigatórios.");
        setSaving(false);
        return;
      }
      const res = await apiFetch("/api/chart-accounts", {
        method: "POST",
        body: JSON.stringify({
          code,
          name,
          type: chartType,
          isActive: chartActive,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = Array.isArray((err as { message?: unknown }).message)
          ? (err as { message: string[] }).message.join(" • ")
          : typeof (err as { message?: string }).message === "string"
            ? (err as { message: string }).message
            : `HTTP ${res.status}`;
        setStatus(msg);
        return;
      }
      const created = (await res.json()) as { id: string };
      onSubmitted({ kind: "chart", id: created.id });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-md border border-brand-navy-200 p-1">
        <button
          type="button"
          onClick={() => {
            setKind("cash");
            setStatus(null);
          }}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            kind === "cash"
              ? "bg-brand-orange text-white"
              : "text-brand-navy-700 hover:bg-brand-navy-50"
          }`}
        >
          Conta caixa / banco
        </button>
        <button
          type="button"
          onClick={() => {
            setKind("chart");
            setStatus(null);
          }}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            kind === "chart"
              ? "bg-brand-orange text-white"
              : "text-brand-navy-700 hover:bg-brand-navy-50"
          }`}
        >
          Conta contábil
        </button>
      </div>

      {kind === "cash" ? (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cash-name">Nome da conta *</Label>
            <Input
              id="cash-name"
              value={cashName}
              onChange={(e) => setCashName(e.target.value)}
              placeholder="Ex.: Caixa loja, Conta corrente BB"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cash-bank">Banco (opcional)</Label>
            {banksLoading ? (
              <div className="text-sm text-brand-navy-600">Carregando bancos...</div>
            ) : (
              <select
                id="cash-bank"
                className="flex h-9 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-1.5 text-sm text-brand-navy-800 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                value={cashBankId}
                onChange={(e) => setCashBankId(e.target.value)}
              >
                <option value="">Nenhum</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name ?? b.id}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cash-number">Número / agência (opcional)</Label>
            <Input
              id="cash-number"
              value={cashNumber}
              onChange={(e) => setCashNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cash-opening">Saldo inicial (R$)</Label>
            <Input
              id="cash-opening"
              inputMode="numeric"
              value={cashOpening}
              onChange={(e) => setCashOpening(maskMoney(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-navy-700">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={cashActive}
              onChange={(e) => setCashActive(e.target.checked)}
            />
            Conta ativa
          </label>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="chart-code">Código *</Label>
            <Input
              id="chart-code"
              value={chartCode}
              onChange={(e) => setChartCode(e.target.value)}
              placeholder="Ex.: 3.1.01"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chart-name">Nome *</Label>
            <Input
              id="chart-name"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="Ex.: Despesas administrativas"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chart-type">Tipo *</Label>
            <select
              id="chart-type"
              className="flex h-9 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-1.5 text-sm text-brand-navy-800 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              {CHART_ACCOUNT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-navy-700">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={chartActive}
              onChange={(e) => setChartActive(e.target.checked)}
            />
            Conta ativa
          </label>
        </div>
      )}

      {status ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {status}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? "Salvando..." : submitLabel}
        </Button>
        {showCancel && onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
