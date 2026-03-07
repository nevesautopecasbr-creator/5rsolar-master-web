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

export default function EditContractPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({
    projectId: "",
    customerId: "",
    totalValue: "",
    templateId: "",
    status: "DRAFT",
    notes: "",
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch(`/api/contracts/${id}`).then((r) => r.json()),
      apiFetch("/api/projects").then((r) => r.json()),
      apiFetch("/api/customers").then((r) => r.json()),
      apiFetch("/api/contract-templates").then((r) => r.json()),
    ])
      .then(([contract, projectsData, customersData, templatesData]) => {
        if (!mounted) return;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setTemplates(Array.isArray(templatesData) ? templatesData : []);
        setForm({
          projectId: contract.projectId ?? "",
          customerId: contract.customerId ?? "",
          totalValue:
            contract.totalValue != null
              ? maskMoneyFromNumber(Number(contract.totalValue))
              : "0,00",
          templateId: contract.templateId ?? "",
          status: contract.status ?? "DRAFT",
          notes: contract.notes ?? "",
        });
      })
      .catch(() => setStatus("Falha ao carregar contrato"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const totalValue = parseMoney(form.totalValue);
    const payload = {
      projectId: form.projectId,
      customerId: form.customerId,
      totalValue,
      templateId: form.templateId || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };
    const res = await apiFetch(`/api/contracts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.message ?? "Falha ao salvar.");
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
        <h1 className="text-xl font-semibold text-brand-navy-900">Editar contrato</h1>
        <p className="mt-1 text-sm text-brand-navy-600">
          Alterar valor, modelo, status e observações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-brand-navy-900">Projeto e cliente</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="projectId">Projeto</Label>
            <select
              id="projectId"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.projectId}
              onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customerId">Cliente</Label>
            <select
              id="customerId"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.customerId}
              onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-brand-navy-900">Valor e condições</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="totalValue">Valor total (R$)</Label>
            <Input
              id="totalValue"
              type="text"
              inputMode="decimal"
              value={form.totalValue}
              onChange={(e) => setForm((p) => ({ ...p, totalValue: maskMoney(e.target.value) }))}
              placeholder="0,00"
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
        </CardContent>
      </Card>

      {status && (
        <p className={status.startsWith("Falha") ? "text-sm text-red-600" : "text-sm text-brand-navy-600"}>
          {status}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">Salvar</Button>
        <Link href="/contracts">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
      </div>
    </form>
  );
}
