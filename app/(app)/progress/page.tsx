"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgressCard } from "@/components/progress-card";
import { ProgressStage } from "@/components/progress-stage";
import { apiFetch } from "@/lib/api";

type Project = {
  id: string;
  name: string;
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
  milestones?: WorkMilestone[];
};

export default function ProgressPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const [projectsRes, worksRes] = await Promise.all([
        apiFetch("/api/projects"),
        apiFetch("/api/work-orders"),
      ]);

      if (!active) return;

      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const worksData = worksRes.ok ? await worksRes.json() : [];

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setWorkOrders(Array.isArray(worksData) ? worksData : []);
      setLoading(false);
    }

    load().catch(() => {
      if (!active) return;
      setProjects([]);
      setWorkOrders([]);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const progressCards = useMemo(() => {
    return workOrders.map((order) => {
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
      const project = projects.find((item) => item.id === order.projectId);

      return {
        id: order.id,
        title: order.title,
        subtitle: project?.name ?? order.projectId,
        percent,
        status: order.status ?? "",
        stages: milestones.map((milestone) => ({
          label: milestone.title,
          done: Boolean(milestone.completedAt),
        })),
      };
    });
  }, [projects, workOrders]);

  const stageBlock = useMemo(() => {
    return progressCards.find((card) => card.stages.length > 0);
  }, [progressCards]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Progresso</h1>
        <p className="text-sm text-brand-navy-600">
          Acompanhamento das obras com base em marcos registrados.
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-dashed border-brand-navy-200 p-6 text-sm text-brand-navy-600">
          Carregando progresso...
        </div>
      ) : progressCards.length === 0 ? (
        <div className="rounded-md border border-dashed border-brand-navy-200 p-6 text-sm text-brand-navy-600">
          Nenhuma obra cadastrada para acompanhamento.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
          {stageBlock ? (
            <div className="grid gap-4 md:grid-cols-2">
              <ProgressStage
                title={`Marcos · ${stageBlock.title}`}
                stages={stageBlock.stages}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
