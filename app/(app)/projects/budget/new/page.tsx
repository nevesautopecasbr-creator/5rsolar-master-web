"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type ProductOption = {
  id: string;
  name?: string | null;
  price?: number | string | null;
  isActive?: boolean | null;
};

type ProductSelection = {
  productId: string;
  name: string;
  price: number | null;
  quantity: number;
};

function toNumber(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  const parsed = Number(value.replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

export default function ProjectBudgetNewPage() {
  const [customerName, setCustomerName] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsUsed, setProductsUsed] = useState<ProductSelection[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setProductsError(null);
    setProductsLoading(true);
    apiFetch("/api/products")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setProducts(list.filter((item) => item.isActive !== false));
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setProductsError("Falha ao carregar produtos.");
      })
      .finally(() => {
        if (!active) return;
        setProductsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const materialCostValue = useMemo(() => {
    return productsUsed.reduce((total, item) => {
      const price = item.price ?? 0;
      return total + price * item.quantity;
    }, 0);
  }, [productsUsed]);

  const totalValue = useMemo(() => {
    return (
      toNumber(laborCost) +
      materialCostValue +
      toNumber(taxAmount) +
      toNumber(otherCosts)
    );
  }, [laborCost, materialCostValue, taxAmount, otherCosts]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

  async function handleSubmit() {
    setStatus(null);
    setLoading(true);

    const payload = {
      laborCost: toNumber(laborCost),
      materialCost: materialCostValue,
      taxAmount: toNumber(taxAmount),
      otherCosts: otherCosts ? toNumber(otherCosts) : undefined,
      totalValue,
      customerName: customerName || undefined,
      notes: notes || undefined,
      productsUsed: productsUsed.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await apiFetch("/api/project-budgets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setStatus("Falha ao salvar orçamento.");
        return false;
      }

      setStatus("Orçamento salvo com sucesso.");
      setLaborCost("");
      setTaxAmount("");
      setOtherCosts("");
      setNotes("");
      setCustomerName("");
      setProductsUsed([]);
      return true;
    } catch {
      setStatus("Falha ao salvar orçamento.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    const success = await handleSubmit();
    if (success) {
      window.location.href = "/projects";
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Novo Orçamento</h1>
          <p className="text-sm text-slate-600">
            Lançamento de custos, impostos e valor total do projeto.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label>Cliente</Label>
            <Input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          <div className="grid gap-2">
            <Label>Preço mão de obra</Label>
            <Input
              type="text"
              value={laborCost}
              onChange={(event) => setLaborCost(event.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="grid gap-2">
            <Label>Impostos</Label>
            <Input
              type="text"
              value={taxAmount}
              onChange={(event) => setTaxAmount(event.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="grid gap-2">
            <Label>Outros custos</Label>
            <Input
              type="text"
              value={otherCosts}
              onChange={(event) => setOtherCosts(event.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Observações</Label>
            <Input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Detalhes adicionais do orçamento"
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Produtos utilizados</Label>
            <div className="rounded-md border border-slate-200 p-3">
              {productsError ? (
                <div className="text-sm text-red-600">{productsError}</div>
              ) : null}
              {productsLoading ? (
                <div className="text-sm text-slate-600">Carregando produtos...</div>
              ) : null}
              {!productsLoading && !productsError && products.length === 0 ? (
                <div className="text-sm text-slate-600">
                  Nenhum produto disponível.
                </div>
              ) : null}
              {!productsLoading && !productsError && products.length > 0 ? (
                <div className="grid gap-2 text-sm">
                  <div className="grid grid-cols-[1fr_140px_120px] items-center gap-3 text-xs text-slate-500">
                    <span>Produto</span>
                    <span className="text-center">Preço</span>
                    <span className="text-center">Quantidade</span>
                  </div>
                  {products.map((product) => {
                    const selection = productsUsed.find(
                      (item) => item.productId === product.id,
                    );
                    const checked = Boolean(selection);
                    const price = toPrice(product.price);
                    return (
                      <div
                        key={product.id}
                        className="grid grid-cols-[1fr_140px_120px] items-center gap-3 rounded-md border border-slate-100 px-3 py-2"
                      >
                        <label className="flex items-center justify-start gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            checked={checked}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setProductsUsed((prev) => {
                                if (!isChecked) {
                                  return prev.filter(
                                    (item) => item.productId !== product.id,
                                  );
                                }
                                if (prev.some((item) => item.productId === product.id)) {
                                  return prev;
                                }
                                return [
                                  ...prev,
                                  {
                                    productId: product.id,
                                    name: product.name ?? "Produto",
                                    price,
                                    quantity: 1,
                                  },
                                ];
                              });
                            }}
                          />
                          <span>{product.name ?? "Produto"}</span>
                        </label>
                        <span className="text-center text-slate-500">
                          {price === null ? "-" : currency.format(price)}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="h-9 text-center"
                          value={selection?.quantity ?? 0}
                          disabled={!checked}
                          onChange={(event) => {
                            const quantity = Number(event.target.value);
                            setProductsUsed((prev) =>
                              prev.map((item) =>
                                item.productId === product.id
                                  ? { ...item, quantity: Number.isNaN(quantity) ? 0 : quantity }
                                  : item,
                              ),
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Preço materiais</Label>
            <Input
              type="text"
              value={currency.format(materialCostValue)}
              readOnly
              className="bg-slate-50 text-right"
            />
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm md:col-span-2">
            Total do projeto: {currency.format(totalValue)}
          </div>
          <div className="flex items-end gap-3 md:col-span-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar orçamento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleContinue}
              disabled={loading}
            >
              Continuar como projeto
            </Button>
          </div>
          {status ? (
            <div className="text-sm text-slate-600 md:col-span-2">{status}</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
