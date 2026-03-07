"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type Customer = { id: string; name: string };
type Budget = {
  id: string;
  customerName?: string | null;
  consumptionKwh?: unknown;
  consumerUnitCode?: string | null;
  systemPowerKwp?: unknown;
  totalValue?: unknown;
  projectId?: string | null;
};

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const budgetId = searchParams.get("budgetId");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    kWp: "",
    utilityCompany: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    customerId: "",
  });

  useEffect(() => {
    if (!budgetId) {
      router.replace("/projects/budget");
      return;
    }
    let mounted = true;
    Promise.all([
      apiFetch(`/api/project-budgets/${budgetId}`).then((r) => r.json()),
      apiFetch("/api/customers").then((r) => r.json()),
    ])
      .then(([budgetData, customersData]) => {
        if (!mounted) return;
        setBudget(budgetData);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        const b = budgetData as Budget;
        setForm((prev) => ({
          ...prev,
          name: b.customerName?.trim() || prev.name,
          kWp:
            b.systemPowerKwp != null && b.systemPowerKwp !== ""
              ? String(b.systemPowerKwp)
              : prev.kWp,
        }));
      })
      .catch(() => setStatus("Falha ao carregar orçamento"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [budgetId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!budgetId) return;
    setStatus(null);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      kWp: form.kWp ? Number(form.kWp.replace(",", ".")) : undefined,
      utilityCompany: form.utilityCompany.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      zipCode: form.zipCode.trim() || undefined,
      customerId: form.customerId || undefined,
    };

    const res = await apiFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.message ?? "Falha ao criar projeto");
      return;
    }
    const project = await res.json();

    const patchRes = await apiFetch(`/api/project-budgets/${budgetId}`, {
      method: "PATCH",
      body: JSON.stringify({ projectId: project.id }),
    });
    if (!patchRes.ok) {
      setStatus("Projeto criado, mas falha ao vincular ao orçamento.");
      return;
    }

    router.push("/projects");
  }

  if (!budgetId) {
    return null;
  }
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-brand-navy-600">
        Carregando orçamento...
      </div>
    );
  }
  if (!budget) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-600">Orçamento não encontrado.</p>
        <Link href="/projects/budget" className="mt-2 inline-block text-sm text-brand-orange">
          Voltar aos orçamentos
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy-900">Novo projeto a partir do orçamento</h1>
        <p className="mt-1 text-sm text-brand-navy-600">
          Dados do orçamento foram usados para preencher o formulário. Ajuste se necessário.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium">Dados do projeto</h2>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nome do projeto"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customerId">Cliente</Label>
            <select
              id="customerId"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.customerId}
              onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
            >
              <option value="">Nenhum</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="Código interno"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kWp">Potência (kWp)</Label>
            <Input
              id="kWp"
              type="text"
              inputMode="decimal"
              value={form.kWp}
              onChange={(e) => setForm((p) => ({ ...p, kWp: e.target.value }))}
              placeholder="Ex: 5.4"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descrição"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="utilityCompany">Concessionária</Label>
            <Input
              id="utilityCompany"
              value={form.utilityCompany}
              onChange={(e) => setForm((p) => ({ ...p, utilityCompany: e.target.value }))}
              placeholder="Concessionária de energia"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Endereço da instalação"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="Cidade"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">UF</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              placeholder="UF"
              maxLength={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={form.zipCode}
              onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))}
              placeholder="CEP"
            />
          </div>
        </CardContent>
      </Card>

      {status && (
        <p className={status.startsWith("Falha") ? "text-sm text-red-600" : "text-sm text-brand-navy-600"}>
          {status}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">Criar projeto e vincular ao orçamento</Button>
        <Link href="/projects/budget">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
      </div>
    </form>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-brand-navy-600">Carregando...</div>}>
      <NewProjectForm />
    </Suspense>
  );
}
