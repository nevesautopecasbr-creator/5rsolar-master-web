"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskMoney, maskMoneyFromNumber, parseMoney } from "@/lib/masks";

type ContractContext = {
  projectId: string;
  customerId: string | null;
  project: {
    id: string;
    name: string;
    code?: string | null;
    kWp: number | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
  customer: {
    id: string;
    name: string;
    document?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    consumptionKwh?: number | null;
    consumerUnitCode?: string | null;
  } | null;
  suggestedTotalValue: number | null;
  consumptionKwh: number | null;
  consumerUnitCode: string | null;
};

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [context, setContext] = useState<ContractContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    projectId: "",
    customerId: "",
    totalValue: "",
    templateId: "",
    status: "DRAFT",
    notes: "",
    installmentsCount: "",
    firstDueDate: "",
    intervalDays: "30",
  });

  // Carregar projetos, templates e contexto (se projectId na URL)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [projectsRes, templatesRes] = await Promise.all([
        apiFetch("/api/projects").then((r) => r.json()),
        apiFetch("/api/contract-templates").then((r) => r.json()),
      ]);
      if (!mounted) return;
      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setTemplates(Array.isArray(templatesRes) ? templatesRes : []);
      if (projectIdFromUrl) {
        try {
          const ctxRes = await apiFetch(`/api/contracts/context/${projectIdFromUrl}`);
          if (!ctxRes.ok) {
            setStatus("Projeto não encontrado ou sem acesso.");
            setLoading(false);
            return;
          }
          const ctx: ContractContext = await ctxRes.json();
          setContext(ctx);
          if (!ctx.customerId) {
            setStatus("Este projeto não tem cliente vinculado. Vincule um cliente ao projeto para criar o contrato.");
            setLoading(false);
            return;
          }
          setForm((p) => ({
            ...p,
            projectId: ctx.projectId,
            customerId: ctx.customerId,
            totalValue:
              ctx.suggestedTotalValue != null
                ? maskMoneyFromNumber(ctx.suggestedTotalValue)
                : p.totalValue,
          }));
        } catch {
          setStatus("Falha ao carregar dados do projeto.");
        }
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [projectIdFromUrl]);

  // Quando selecionar outro projeto (sem projectId na URL), carregar contexto
  async function onProjectSelect(projectId: string) {
    setForm((p) => ({ ...p, projectId, customerId: "", totalValue: "" }));
    if (!projectId) {
      setContext(null);
      return;
    }
    try {
      const r = await apiFetch(`/api/contracts/context/${projectId}`);
      if (!r.ok) return;
      const ctx: ContractContext = await r.json();
      setContext(ctx);
      setForm((p) => ({
        ...p,
        projectId: ctx.projectId,
        customerId: ctx.customerId ?? "",
        totalValue:
          ctx.suggestedTotalValue != null
            ? maskMoneyFromNumber(ctx.suggestedTotalValue)
            : p.totalValue,
      }));
    } catch {
      setContext(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const totalValue = parseMoney(form.totalValue);
    if (!form.projectId || !form.customerId) {
      setStatus("Projeto e cliente são obrigatórios.");
      return;
    }
    if (totalValue < 0) {
      setStatus("Valor total deve ser preenchido.");
      return;
    }
    const payload = {
      projectId: form.projectId,
      customerId: form.customerId,
      totalValue,
      templateId: form.templateId || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
      installmentsCount: form.installmentsCount ? Number(form.installmentsCount) : undefined,
      firstDueDate: form.firstDueDate || undefined,
      intervalDays: form.intervalDays ? Number(form.intervalDays) : undefined,
    };
    const res = await apiFetch("/api/contracts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.message ?? "Falha ao criar contrato.");
      return;
    }
    router.push("/contracts");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-brand-navy-600">Carregando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy-900">Novo contrato</h1>
        <p className="mt-1 text-sm text-brand-navy-600">
          Contratos derivados de projetos. Dados do cliente, consumo, endereço e valor podem vir do projeto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-brand-navy-900">Projeto e cliente</h2>
          <p className="text-sm text-brand-navy-600">
            Selecione o projeto ou use o link «Criar contrato» na lista de Projetos para preencher automaticamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="projectId">Projeto *</Label>
            <select
              id="projectId"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.projectId}
              onChange={(e) => onProjectSelect(e.target.value)}
              required
            >
              <option value="">Selecione um projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {context && (
            <div className="rounded-lg border border-brand-navy-100 bg-brand-navy-50/50 p-4 text-sm">
              <h3 className="font-medium text-brand-navy-800">Dados do projeto e cliente</h3>
              <dl className="mt-2 grid gap-1">
                <div>
                  <span className="text-brand-navy-500">Projeto:</span> {context.project.name}
                  {context.project.kWp != null && ` • ${context.project.kWp} kWp`}
                </div>
                <div>
                  <span className="text-brand-navy-500">Endereço:</span>{" "}
                  {[context.project.address, context.project.city, context.project.state]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
                {context.customer && (
                  <>
                    <div>
                      <span className="text-brand-navy-500">Cliente:</span> {context.customer.name}
                    </div>
                    {context.customer.email && (
                      <div>
                        <span className="text-brand-navy-500">E-mail:</span> {context.customer.email}
                      </div>
                    )}
                    {context.consumptionKwh != null && (
                      <div>
                        <span className="text-brand-navy-500">Consumo:</span> {context.consumptionKwh} kWh/mês
                        {context.consumerUnitCode && ` • UC: ${context.consumerUnitCode}`}
                      </div>
                    )}
                  </>
                )}
              </dl>
            </div>
          )}
          {form.projectId && !context?.customerId && (
            <p className="text-sm text-amber-600">
              Projeto sem cliente vinculado. Vincule um cliente ao projeto em Projetos para continuar.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-brand-navy-900">Valor e condições</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="totalValue">Valor total (R$) *</Label>
            <Input
              id="totalValue"
              type="text"
              inputMode="decimal"
              value={form.totalValue}
              onChange={(e) => setForm((p) => ({ ...p, totalValue: maskMoney(e.target.value) }))}
              placeholder="0,00"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="templateId">Modelo de contrato</Label>
            <select
              id="templateId"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.templateId}
              onChange={(e) => setForm((p) => ({ ...p, templateId: e.target.value }))}
            >
              <option value="">Nenhum</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="DRAFT">Rascunho</option>
              <option value="ACTIVE">Ativo</option>
              <option value="SUSPENDED">Suspenso</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
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
          <div className="border-t border-brand-navy-100 pt-4">
            <p className="mb-2 text-sm font-medium text-brand-navy-700">Parcelas (opcional)</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="installmentsCount">Número de parcelas</Label>
                <Input
                  id="installmentsCount"
                  type="number"
                  min={0}
                  value={form.installmentsCount}
                  onChange={(e) => setForm((p) => ({ ...p, installmentsCount: e.target.value }))}
                  placeholder="Ex: 12"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstDueDate">Primeiro vencimento</Label>
                <Input
                  id="firstDueDate"
                  type="date"
                  value={form.firstDueDate}
                  onChange={(e) => setForm((p) => ({ ...p, firstDueDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="intervalDays">Intervalo (dias)</Label>
                <Input
                  id="intervalDays"
                  type="number"
                  min={1}
                  value={form.intervalDays}
                  onChange={(e) => setForm((p) => ({ ...p, intervalDays: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {status && (
        <p className={status.startsWith("Falha") || status.includes("obrigatório") ? "text-sm text-red-600" : "text-sm text-brand-navy-600"}>
          {status}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={!form.customerId}>
          Criar contrato
        </Button>
        <Link href="/contracts">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
      </div>
    </form>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-brand-navy-600">Carregando...</div>}>
      <NewContractForm />
    </Suspense>
  );
}
