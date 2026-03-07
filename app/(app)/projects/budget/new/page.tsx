"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type Product = { id: string; name: string; price?: number | null; unit?: string | null };
type BudgetProduct = { productId: string; name: string; price: number; quantity: number };
type BudgetContext = {
  customerName: string | null;
  consumptionKwh: number | null;
  consumerUnitCode: string | null;
  systemPowerKwp: number | null;
};

const STEPS = [
  { id: 1, title: "Projeto e dados da proposta", description: "Vincule ao projeto para herdar consumo e UC do cliente" },
  { id: 2, title: "Produtos e serviços", description: "Adicione itens ao orçamento" },
  { id: 3, title: "Revisão", description: "Confira e salve o orçamento" },
];

function formatMoney(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    projectId: "",
    customerName: "",
    consumptionKwh: "",
    consumerUnitCode: "",
    systemPowerKwp: "",
    laborCost: "0",
    materialCost: "0",
    taxAmount: "0",
    otherCosts: "0",
    notes: "",
  });
  const [budgetProducts, setBudgetProducts] = useState<BudgetProduct[]>([]);
  const [contextLoaded, setContextLoaded] = useState(false);

  const loadContext = useCallback(async (projectId: string) => {
    if (!projectId) {
      setForm((p) => ({
        ...p,
        customerName: "",
        consumptionKwh: "",
        consumerUnitCode: "",
        systemPowerKwp: "",
      }));
      setContextLoaded(false);
      return;
    }
    try {
      const r = await apiFetch(`/api/project-budgets/context/${projectId}`);
      if (!r.ok) return;
      const ctx: BudgetContext = await r.json();
      setForm((p) => ({
        ...p,
        customerName: ctx.customerName ?? "",
        consumptionKwh: ctx.consumptionKwh != null ? String(ctx.consumptionKwh) : "",
        consumerUnitCode: ctx.consumerUnitCode ?? "",
        systemPowerKwp: ctx.systemPowerKwp != null ? String(ctx.systemPowerKwp) : "",
      }));
      setContextLoaded(true);
    } catch {
      setContextLoaded(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch("/api/products").then((r) => r.json()),
      apiFetch("/api/projects").then((r) => r.json()),
    ])
      .then(([prods, projs]) => {
        if (!mounted) return;
        setProducts(Array.isArray(prods) ? prods.filter((p: Product) => p.id) : []);
        setProjects(Array.isArray(projs) ? projs : []);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadContext(form.projectId);
  }, [form.projectId, loadContext]);

  function addProduct() {
    const first = products[0];
    if (!first) return;
    setBudgetProducts((prev) => [
      ...prev,
      { productId: first.id, name: first.name, price: first.price ?? 0, quantity: 1 },
    ]);
  }

  function removeProduct(idx: number) {
    setBudgetProducts((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateProduct(idx: number, field: keyof BudgetProduct, value: string | number) {
    setBudgetProducts((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        if (field === "productId") {
          const product = products.find((x) => x.id === value);
          return product
            ? { ...p, productId: product.id, name: product.name, price: product.price ?? 0 }
            : { ...p, [field]: value };
        }
        if (field === "quantity") return { ...p, quantity: Number(value) || 0 };
        if (field === "price") return { ...p, price: Number(value) || 0 };
        return { ...p, [field]: value };
      }),
    );
  }

  const labor = Number(form.laborCost.replace(",", ".")) || 0;
  const material = Number(form.materialCost.replace(",", ".")) || 0;
  const tax = Number(form.taxAmount.replace(",", ".")) || 0;
  const other = Number(form.otherCosts.replace(",", ".")) || 0;
  const productsSubtotal = budgetProducts.reduce((s, p) => s + p.price * p.quantity, 0);
  const totalValue = productsSubtotal + labor + material + tax + other;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const payload = {
      projectId: form.projectId || undefined,
      customerName: form.customerName.trim() || undefined,
      consumptionKwh: form.consumptionKwh ? Number(form.consumptionKwh.replace(",", ".")) : undefined,
      consumerUnitCode: form.consumerUnitCode.trim() || undefined,
      systemPowerKwp: form.systemPowerKwp ? Number(form.systemPowerKwp.replace(",", ".")) : undefined,
      laborCost: labor,
      materialCost: material,
      taxAmount: tax,
      otherCosts: other,
      totalValue: Math.round(totalValue * 100) / 100,
      notes: form.notes.trim() || undefined,
      productsUsed: budgetProducts.map((p) => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
    };

    const response = await apiFetch("/api/project-budgets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.message ?? response.statusText;
      setStatus("Falha ao salvar: " + msg);
      return;
    }

    router.push("/projects/budget");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-brand-navy-600">Carregando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy-900">Novo Orçamento</h1>
        <p className="mt-1 text-sm text-brand-navy-600">
          Fluxo em etapas: projeto e proposta, produtos e revisão.
        </p>
      </div>

      {/* Stepper */}
      <nav aria-label="Etapas do orçamento" className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                step === s.id
                  ? "border-brand-navy-600 bg-brand-navy-600 text-white"
                  : step > s.id
                    ? "border-brand-navy-500 bg-brand-navy-100 text-brand-navy-700"
                    : "border-brand-navy-200 bg-white text-brand-navy-500"
              }`}
            >
              {s.id}
            </button>
            <span className={`hidden text-sm sm:inline ${step === s.id ? "font-medium text-brand-navy-800" : "text-brand-navy-600"}`}>
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-4 bg-brand-navy-200 sm:mx-2 sm:w-8" aria-hidden />
            )}
          </div>
        ))}
      </nav>

      {/* Step 1: Projeto e dados da proposta */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-brand-navy-900">{STEPS[0].title}</h2>
            <p className="text-sm text-brand-navy-600">{STEPS[0].description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="projectId">Projeto (opcional)</Label>
              <select
                id="projectId"
                className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
                value={form.projectId}
                onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
              >
                <option value="">Nenhum — preencher manualmente</option>
                {projects.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
              {contextLoaded && (
                <p className="text-xs text-green-700">Dados do cliente e consumo herdados do cadastro.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Cliente</Label>
                <Input
                  id="customerName"
                  value={form.customerName}
                  onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="consumerUnitCode">Unidade consumidora (UC)</Label>
                <Input
                  id="consumerUnitCode"
                  value={form.consumerUnitCode}
                  onChange={(e) => setForm((p) => ({ ...p, consumerUnitCode: e.target.value }))}
                  placeholder="Código da UC"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="consumptionKwh">Consumo (kWh/mês)</Label>
                <Input
                  id="consumptionKwh"
                  type="text"
                  inputMode="decimal"
                  value={form.consumptionKwh}
                  onChange={(e) => setForm((p) => ({ ...p, consumptionKwh: e.target.value }))}
                  placeholder="Ex: 500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="systemPowerKwp">Potência do sistema (kWp)</Label>
                <Input
                  id="systemPowerKwp"
                  type="text"
                  inputMode="decimal"
                  value={form.systemPowerKwp}
                  onChange={(e) => setForm((p) => ({ ...p, systemPowerKwp: e.target.value }))}
                  placeholder="Ex: 5.4"
                />
              </div>
            </div>

            <div className="border-t border-brand-navy-100 pt-4">
              <p className="mb-3 text-sm font-medium text-brand-navy-700">Custos (R$)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="laborCost">Mão de obra</Label>
                  <Input
                    id="laborCost"
                    type="text"
                    inputMode="decimal"
                    value={form.laborCost}
                    onChange={(e) => setForm((p) => ({ ...p, laborCost: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="materialCost">Material</Label>
                  <Input
                    id="materialCost"
                    type="text"
                    inputMode="decimal"
                    value={form.materialCost}
                    onChange={(e) => setForm((p) => ({ ...p, materialCost: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxAmount">Impostos</Label>
                  <Input
                    id="taxAmount"
                    type="text"
                    inputMode="decimal"
                    value={form.taxAmount}
                    onChange={(e) => setForm((p) => ({ ...p, taxAmount: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="otherCosts">Outros</Label>
                  <Input
                    id="otherCosts"
                    type="text"
                    inputMode="decimal"
                    value={form.otherCosts}
                    onChange={(e) => setForm((p) => ({ ...p, otherCosts: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Observações"
              />
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)}>
                Próximo: Produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Produtos */}
      {step === 2 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-brand-navy-900">{STEPS[1].title}</h2>
              <p className="text-sm text-brand-navy-600">{STEPS[1].description}</p>
            </div>
            <Button type="button" variant="outline" onClick={addProduct} disabled={products.length === 0}>
              + Adicionar produto
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.length === 0 && (
              <p className="text-sm text-amber-600">
                Cadastre produtos em Cadastros → Produtos para adicioná-los ao orçamento.
              </p>
            )}
            {budgetProducts.map((bp, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-end gap-4 rounded-lg border border-brand-navy-100 bg-brand-navy-50/30 p-4"
              >
                <div className="grid min-w-[200px] flex-1 gap-2">
                  <Label>Produto</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
                    value={bp.productId}
                    onChange={(e) => updateProduct(idx, "productId", e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.price != null ? `(R$ ${formatMoney(p.price)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid w-24 gap-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    min={0.01}
                    step={1}
                    value={bp.quantity}
                    onChange={(e) => updateProduct(idx, "quantity", e.target.value)}
                  />
                </div>
                <div className="grid w-28 gap-2">
                  <Label>Preço un. (R$)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={bp.price}
                    onChange={(e) => updateProduct(idx, "price", e.target.value)}
                  />
                </div>
                <div className="flex items-end text-sm font-medium text-brand-navy-700">
                  = R$ {formatMoney(bp.price * bp.quantity)}
                </div>
                <Button type="button" variant="ghost" onClick={() => removeProduct(idx)}>
                  Remover
                </Button>
              </div>
            ))}
            {budgetProducts.length > 0 && (
              <div className="border-t border-brand-navy-200 pt-4 text-sm">
                <span className="font-medium text-brand-navy-700">
                  Subtotal produtos: R$ {formatMoney(productsSubtotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Próximo: Revisão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Revisão */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-brand-navy-900">{STEPS[2].title}</h2>
            <p className="text-sm text-brand-navy-600">{STEPS[2].description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-brand-navy-100 bg-white p-4">
              <h3 className="mb-3 text-sm font-medium text-brand-navy-700">Resumo da proposta</h3>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-brand-navy-500">Cliente</dt>
                  <dd className="font-medium">{form.customerName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-brand-navy-500">Unidade consumidora</dt>
                  <dd className="font-medium">{form.consumerUnitCode || "—"}</dd>
                </div>
                <div>
                  <dt className="text-brand-navy-500">Consumo (kWh/mês)</dt>
                  <dd className="font-medium">{form.consumptionKwh || "—"}</dd>
                </div>
                <div>
                  <dt className="text-brand-navy-500">Potência (kWp)</dt>
                  <dd className="font-medium">{form.systemPowerKwp || "—"}</dd>
                </div>
                <div>
                  <dt className="text-brand-navy-500">Subtotal produtos</dt>
                  <dd className="font-medium">R$ {formatMoney(productsSubtotal)}</dd>
                </div>
                <div>
                  <dt className="text-brand-navy-500">Custos (mão de obra, material, impostos, outros)</dt>
                  <dd className="font-medium">R$ {formatMoney(labor + material + tax + other)}</dd>
                </div>
              </dl>
            </div>

            <Card className="border-2 border-brand-navy-200 bg-brand-navy-50/50">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-brand-navy-800">
                  Valor total do orçamento: R$ {formatMoney(totalValue)}
                </p>
              </CardContent>
            </Card>

            {status && (
              <p className={status.startsWith("Falha") ? "text-sm text-red-600" : "text-sm text-brand-navy-600"}>
                {status}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button type="submit">Salvar orçamento</Button>
              <Link href="/projects/budget">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {step !== 3 && (
        <div className="flex justify-end">
          <Link href="/projects/budget">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      )}
    </form>
  );
}
