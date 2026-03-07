"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskMoney, maskMoneyFromNumber, parseMoney } from "@/lib/masks";

type Product = { id: string; name: string; price?: number | null; unit?: string | null };
type BudgetProduct = { productId: string; name: string; price: number; quantity: number };
type BudgetContext = {
  customerName: string | null;
  consumptionKwh: number | null;
  consumerUnitCode: string | null;
  systemPowerKwp: number | null;
};

function formatMoney(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
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

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch("/api/products").then((r) => r.json()),
      apiFetch("/api/projects").then((r) => r.json()),
      apiFetch(`/api/project-budgets/${id}`).then((r) => r.json()),
    ])
      .then(([prods, projs, budget]) => {
        if (!mounted) return;
        setProducts(Array.isArray(prods) ? prods.filter((p: Product) => p.id) : []);
        setProjects(Array.isArray(projs) ? projs : []);
        setForm({
          projectId: budget.projectId ?? "",
          customerName: budget.customerName ?? "",
          consumptionKwh: budget.consumptionKwh != null ? String(budget.consumptionKwh) : "",
          consumerUnitCode: budget.consumerUnitCode ?? "",
          systemPowerKwp: budget.systemPowerKwp != null ? String(budget.systemPowerKwp) : "",
          laborCost: budget.laborCost != null ? maskMoneyFromNumber(Number(budget.laborCost)) : "0,00",
          materialCost: budget.materialCost != null ? maskMoneyFromNumber(Number(budget.materialCost)) : "0,00",
          taxAmount: budget.taxAmount != null ? maskMoneyFromNumber(Number(budget.taxAmount)) : "0,00",
          otherCosts: budget.otherCosts != null ? maskMoneyFromNumber(Number(budget.otherCosts)) : "0,00",
          notes: budget.notes ?? "",
        });
        const used = budget.productsUsed;
        if (Array.isArray(used) && used.length > 0) {
          setBudgetProducts(
            used.map((u: { productId?: string; name?: string; price?: number; quantity?: number }) => ({
              productId: u.productId ?? "",
              name: u.name ?? "",
              price: Number(u.price) || 0,
              quantity: Number(u.quantity) || 1,
            })),
          );
        }
      })
      .catch(() => setStatus("Falha ao carregar orçamento"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  async function onProjectChange(projectId: string) {
    setForm((p) => ({ ...p, projectId }));
    if (projectId) {
      try {
        const r = await apiFetch(`/api/project-budgets/context/${projectId}`);
        if (!r.ok) return;
        const ctx: BudgetContext = await r.json();
        setForm((p) => ({
          ...p,
          projectId,
          customerName: ctx.customerName ?? "",
          consumptionKwh: ctx.consumptionKwh != null ? String(ctx.consumptionKwh) : "",
          consumerUnitCode: ctx.consumerUnitCode ?? "",
          systemPowerKwp: ctx.systemPowerKwp != null ? String(ctx.systemPowerKwp) : "",
        }));
      } catch {
        /* ignore */
      }
    }
  }

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
      prev.map((p, i): BudgetProduct => {
        if (i !== idx) return p;
        if (field === "productId") {
          const product = products.find((x) => x.id === value);
          return product
            ? { ...p, productId: product.id, name: product.name, price: product.price ?? 0 }
            : { ...p, productId: String(value) };
        }
        if (field === "quantity") return { ...p, quantity: Number(value) || 0 };
        if (field === "price") return { ...p, price: Number(value) || 0 };
        return { ...p, [field]: value } as BudgetProduct;
      }),
    );
  }

  const labor = parseMoney(form.laborCost);
  const material = parseMoney(form.materialCost);
  const tax = parseMoney(form.taxAmount);
  const other = parseMoney(form.otherCosts);
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

    const response = await apiFetch(`/api/project-budgets/${id}`, {
      method: "PATCH",
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
        <h1 className="text-xl font-semibold text-brand-navy-900">Editar Orçamento</h1>
        <p className="mt-1 text-sm text-brand-navy-600">
          Altere os dados da proposta. Consumo, UC e potência podem ser herdados ao vincular um projeto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-brand-navy-900">Dados da proposta</h2>
          <p className="text-sm text-brand-navy-600">
            Projeto, cliente, consumo (kWh), UC, potência (kWp) e custos.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="projectId">Projeto (opcional)</Label>
            <select
              id="projectId"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.projectId}
              onChange={(e) => onProjectChange(e.target.value)}
            >
              <option value="">Nenhum</option>
              {projects.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
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
                    onChange={(e) => setForm((p) => ({ ...p, laborCost: maskMoney(e.target.value) }))}
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
                    onChange={(e) => setForm((p) => ({ ...p, materialCost: maskMoney(e.target.value) }))}
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
                    onChange={(e) => setForm((p) => ({ ...p, taxAmount: maskMoney(e.target.value) }))}
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
                    onChange={(e) => setForm((p) => ({ ...p, otherCosts: maskMoney(e.target.value) }))}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-brand-navy-900">Produtos</h2>
            <p className="text-sm text-brand-navy-600">
              Adicione ou remova produtos. O valor total é atualizado ao salvar.
            </p>
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
                  {!products.some((p) => p.id === bp.productId) && bp.productId && (
                    <option value={bp.productId}>
                      {bp.name} (R$ {formatMoney(bp.price)}) — cadastro atual
                    </option>
                  )}
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
                  value={maskMoneyFromNumber(bp.price)}
                  onChange={(e) => updateProduct(idx, "price", parseMoney(e.target.value))}
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
        </CardContent>
      </Card>

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
      <div className="flex gap-2">
        <Button type="submit">Salvar orçamento</Button>
        <Link href="/projects/budget">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
