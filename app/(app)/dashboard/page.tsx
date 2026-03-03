"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressCard } from "@/components/progress-card";
import { IconSolarRays } from "@/components/icons/solar-icons";
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
      }),
    [],
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <IconSolarRays className="h-6 w-6 text-brand-orange" />
            <h1 className="text-display-md text-brand-navy-900">Dashboard</h1>
          </div>
          <p className="text-sm text-brand-navy-600">
            Visão geral dos projetos, fluxo de caixa e execução de obras.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/projects"
              className="rounded-xl border border-brand-navy-200/60 bg-white p-5 text-sm font-medium text-brand-navy-700 transition-all hover:border-brand-orange/30 hover:bg-brand-orange-50/50 hover:shadow-card-hover"
            >
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand-navy-500">Projetos ativos</span>
              <span className="mt-1 block text-xl font-bold text-brand-navy-900">
                {loading ? "..." : activeProjects}
              </span>
            </Link>
            <div className="rounded-xl border border-brand-navy-200/60 bg-white p-5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand-navy-500">Fluxo de caixa previsto</span>
              <span className="mt-1 block text-xl font-bold text-brand-navy-900">
                {loading || cashflowForecast === null ? "..." : currency.format(cashflowForecast)}
              </span>
            </div>
            <div className="rounded-xl border border-brand-navy-200/60 bg-white p-5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand-navy-500">Obras em atraso</span>
              <span className="mt-1 block text-xl font-bold text-brand-navy-900">
                {loading ? "..." : overdueWorkOrders}
              </span>
            </div>
            <div className="rounded-xl border border-brand-navy-200/60 bg-white p-5 text-brand-navy-500">
              <span className="block text-xs font-semibold uppercase tracking-wider">Margem média</span>
              <span className="mt-1 block text-sm">indisponível</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-display-md text-brand-navy-900">Progresso rápido</h2>
        <p className="text-sm text-brand-navy-600">
          Acompanhe as obras principais em tempo real.
        </p>
      </div>

      {progressCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <IconSolarRays className="h-10 w-10 text-brand-navy-300" />
            <p className="mt-3 text-sm text-brand-navy-500">
              Nenhuma obra com progresso registrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
