"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

type Project = {
  id: string;
  name: string;
};

type CashflowReport = {
  forecast: { inflow: number; outflow: number };
  realized: { inflow: number; outflow: number };
};

type MarginReport = {
  revenue: number;
  directCosts: number;
  laborCosts: number;
  grossMargin: number;
  netMargin: number;
};

function getMonthRange() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default function ProjectBudgetPage() {
  const { start, end } = getMonthRange();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(formatDateInput(start));
  const [endDate, setEndDate] = useState<string>(formatDateInput(end));
  const [cashflow, setCashflow] = useState<CashflowReport | null>(null);
  const [margin, setMargin] = useState<MarginReport | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleExportPdf() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  useEffect(() => {
    let active = true;
    apiFetch("/api/projects")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setProjects(list);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projects, projectId],
  );

  async function handleSubmit() {
    setStatus(null);
    setLoading(true);
    setCashflow(null);
    setMargin(null);

    const params = new URLSearchParams({
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      ...(projectId ? { projectId } : {}),
    });

    try {
      const cashflowRes = await apiFetch(
        `/api/finance/reports/cashflow?${params.toString()}`,
      );
      const cashflowData = cashflowRes.ok ? await cashflowRes.json() : null;
      setCashflow(cashflowData);

      if (projectId) {
        const marginRes = await apiFetch(
          `/api/finance/reports/margin?projectId=${projectId}`,
        );
        const marginData = marginRes.ok ? await marginRes.json() : null;
        setMargin(marginData);
      }

      setStatus("Relatório atualizado.");
    } catch {
      setStatus("Falha ao carregar dados do orçamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between gap-3 no-print">
          <div>
            <h1 className="text-lg font-semibold">Orçamento de Projetos</h1>
            <p className="text-sm text-slate-600">
              Consolide previsão de caixa e margem por período.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/projects/budget/new">
              <Button type="button">Novo orçamento</Button>
            </Link>
            <Button type="button" variant="outline" onClick={handleExportPdf}>
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 no-print">
          <div className="grid gap-2">
            <Label>Projeto</Label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="">Todos os projetos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Data inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Data final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
          {status ? (
            <div className="text-sm text-slate-600 md:col-span-2">{status}</div>
          ) : null}
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff;
          }
        }
      `}</style>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Fluxo de caixa</h2>
          <p className="text-sm text-slate-600">
            {selectedProject?.name ?? "Todos os projetos"}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Previsão de entradas:{" "}
            {cashflow ? currency.format(cashflow.forecast.inflow) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Previsão de saídas:{" "}
            {cashflow ? currency.format(cashflow.forecast.outflow) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Realizado entradas:{" "}
            {cashflow ? currency.format(cashflow.realized.inflow) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Realizado saídas:{" "}
            {cashflow ? currency.format(cashflow.realized.outflow) : "--"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Margem</h2>
          <p className="text-sm text-slate-600">
            {projectId
              ? selectedProject?.name ?? projectId
              : "Selecione um projeto para ver a margem."}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Receita: {margin ? currency.format(margin.revenue) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Custos diretos: {margin ? currency.format(margin.directCosts) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Custos mão de obra: {margin ? currency.format(margin.laborCosts) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Margem bruta: {margin ? currency.format(margin.grossMargin) : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Margem líquida: {margin ? currency.format(margin.netMargin) : "--"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
