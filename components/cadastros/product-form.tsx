"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskMoney, parseMoney } from "@/lib/masks";

type ProductFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  inline?: boolean;
};

export function ProductForm({ onSuccess, onCancel, inline }: ProductFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "",
    cost: "",
    price: "",
    isActive: true,
  });

  const canSubmit = form.name.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || undefined,
      unit: form.unit.trim() || undefined,
      cost: form.cost ? parseMoney(form.cost) : undefined,
      price: form.price ? parseMoney(form.price) : undefined,
      isActive: form.isActive,
    };

    const response = await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      setStatus("Falha ao salvar: " + (err?.message ?? response.statusText));
      return;
    }

    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {!inline && (
        <div>
          <h1 className="text-lg font-semibold">Novo Produto</h1>
          <p className="text-sm text-brand-navy-600">
            Cadastre o produto. Nome é obrigatório.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium">Dados do Produto</h2>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nome do produto"
              className="max-w-md"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU / Código</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
              placeholder="Código interno"
              className="max-w-[180px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unidade</Label>
            <Input
              id="unit"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              placeholder="Ex: un, m², kWp"
              className="max-w-[120px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cost">Custo (R$)</Label>
            <Input
              id="cost"
              type="text"
              inputMode="decimal"
              value={form.cost}
              onChange={(e) =>
                setForm((p) => ({ ...p, cost: maskMoney(e.target.value) }))
              }
              placeholder="0,00"
              className="max-w-[140px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Preço de venda (R$)</Label>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: maskMoney(e.target.value) }))
              }
              placeholder="0,00"
              className="max-w-[140px]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-navy-700 sm:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-brand-navy-300"
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            Produto ativo (disponível para orçamentos)
          </label>
        </CardContent>
      </Card>

      {status && (
        <p
          className={
            "text-sm " +
            (status.startsWith("Falha") ? "text-red-600" : "text-brand-navy-600")
          }
        >
          {status}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={!canSubmit}>
          Salvar
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
