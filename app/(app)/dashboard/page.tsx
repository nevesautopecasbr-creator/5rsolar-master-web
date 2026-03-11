"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressCard } from "@/components/progress-card";
import {
  IconSolarRays,
  IconUsers,
  IconTarget,
  IconDollar,
  IconTrendingUp,
  IconDocument,
} from "@/components/icons/solar-icons";
import { apiFetch } from "@/lib/api";

type Project = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  kWp?: number | string | null;
  status?: string | null;
};

type WorkMilestone = {
  id: string;
  title: string;
  completedAt?: string | null;
};

type WorkOrder = {
  id: string;
  title: string;
  status?: string | null;
  projectId: string;
  scheduledEnd?: string | null;
  milestones?: WorkMilestone[];
};

type CashflowReport = {
  forecast: { inflow: number; outflow: number };
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [cashflow, setCashflow] = useState<CashflowReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);

      const [projectsRes, worksRes, cashflowRes] = await Promise.all([
        apiFetch("/api/projects"),
        apiFetch("/api/work-orders"),
        apiFetch(
          `/api/finance/reports/cashflow?start=${start.toISOString()}&end=${end.toISOString()}`,
        ),
      ]);

      if (!active) return;

      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const worksData = worksRes.ok ? await worksRes.json() : [];
      const cashflowData = cashflowRes.ok ? await cashflowRes.json() : null;

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setWorkOrders(Array.isArray(worksData) ? worksData : []);
      setCashflow(cashflowData);
      setLoading(false);
    }

    load().catch(() => {
      if (!active) return;
      setProjects([]);
      setWorkOrders([]);
      setCashflow(null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.status !== "COMPLETED" && p.status !== "CANCELLED",
      ).length,
    [projects],
  );

  const overdueWorkOrders = useMemo(() => {
    const now = Date.now();
    return workOrders.filter((order) => {
      if (!order.scheduledEnd) return false;
      if (order.status === "COMPLETED" || order.status === "CANCELLED") return false;
      return new Date(order.scheduledEnd).getTime() < now;
    }).length;
  }, [workOrders]);

  const cashflowForecast = useMemo(() => {
    if (!cashflow) return null;
    return cashflow.forecast.inflow - cashflow.forecast.outflow;
  }, [cashflow]);

  const progressCards = useMemo(() => {
    const orderList = workOrders
      .filter((o) => o.status !== "CANCELLED")
      .slice(0, 3);

    return orderList.map((order) => {
      const milestones = order.milestones ?? [];
      const completed = milestones.filter((m) => m.completedAt).length;
      const percent =
        milestones.length > 0
          ? Math.round((completed / milestones.length) * 100)
          : order.status === "COMPLETED"
            ? 100
            : order.status === "IN_PROGRESS"
              ? 50
              : 0;
      const project = projects.find((p) => p.id === order.projectId);
      const subtitle = project
        ? `${project.city ?? ""}${project.city && project.state ? " · " : ""}${project.state ?? ""}`.trim() || project.name
        : order.projectId;

      return {
        id: order.id,
        title: order.title,
        subtitle,
        percent,
        status: order.status ?? "",
      };
    });
  }, [projects, workOrders]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Título e subtítulo no estilo do modelo */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy-900 md:text-3xl">
          Dashboard Solar
        </h1>
        <p className="mt-1 text-sm text-brand-navy-500">
          Gestão de projetos, fluxo de caixa e execução de obras.
        </p>
      </div>

      {/* Cartões KPI com barra lateral colorida (cores 5R) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/projects"
          className="group relative overflow-hidden rounded-xl border border-brand-navy-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-brand-green" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy-500">
                Projetos ativos
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-navy-900">
                {loading ? "..." : activeProjects}
              </p>
              <p className="mt-0.5 text-xs text-brand-navy-500">em andamento</p>
            </div>
            <IconUsers className="h-8 w-8 text-brand-navy-200 group-hover:text-brand-green" />
          </div>
        </Link>

        <div className="group relative overflow-hidden rounded-xl border border-brand-navy-100 bg-white p-5 shadow-sm">
          <div className="absolute left-0 top-0 h-full w-1 bg-brand-navy-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy-500">
                Obras em atraso
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-navy-900">
                {loading ? "..." : overdueWorkOrders}
              </p>
              <p className="mt-0.5 text-xs text-brand-navy-500">requerem atenção</p>
            </div>
            <IconTarget className="h-8 w-8 text-brand-navy-200" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-brand-navy-100 bg-white p-5 shadow-sm">
          <div className="absolute left-0 top-0 h-full w-1 bg-brand-orange" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy-500">
                Fluxo de caixa previsto
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-navy-900">
                {loading || cashflowForecast === null ? "..." : currency.format(cashflowForecast)}
              </p>
              <p className="mt-0.5 text-xs text-brand-navy-500">receita líquida</p>
            </div>
            <IconDollar className="h-8 w-8 text-brand-navy-200 group-hover:text-brand-orange" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-brand-navy-100 bg-white p-5 shadow-sm">
          <div className="absolute left-0 top-0 h-full w-1 bg-brand-green" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy-500">
                Economia / tendência
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-navy-900">—</p>
              <p className="mt-0.5 text-xs text-brand-navy-500">em breve</p>
            </div>
            <IconTrendingUp className="h-8 w-8 text-brand-navy-200 group-hover:text-brand-green" />
          </div>
        </div>
      </div>

      {/* Duas colunas: Atividades recentes + Principais oportunidades (projetos/obras) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-brand-navy-900">
              Atividades recentes
            </h2>
          </CardHeader>
          <CardContent>
            {progressCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconDocument className="h-10 w-10 text-brand-navy-200" />
                <p className="mt-2 text-sm text-brand-navy-500">
                  Nenhuma atividade recente.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {progressCards.map((card) => (
                  <li
                    key={card.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-navy-100 bg-brand-navy-50/30 px-3 py-2.5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/10">
                      <IconDocument className="h-4 w-4 text-brand-orange" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-navy-800">
                        {card.title}
                      </p>
                      <p className="text-xs text-brand-navy-500">{card.subtitle}</p>
                    </div>
                    <span className="text-sm font-semibold text-brand-orange">
                      {card.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-brand-navy-900">
              Progresso das obras
            </h2>
          </CardHeader>
          <CardContent>
            {progressCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconSolarRays className="h-10 w-10 text-brand-navy-200" />
                <p className="mt-2 text-sm text-brand-navy-500">
                  Nenhuma obra com progresso registrada.
                </p>
                <Link
                  href="/works/orders"
                  className="mt-2 text-sm font-medium text-brand-orange hover:underline"
                >
                  Ver ordens de serviço
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {progressCards.map((card) => (
                  <ProgressCard
                    key={card.id}
                    title={card.title}
                    subtitle={card.subtitle}
                    percent={card.percent}
                    status={card.status}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
