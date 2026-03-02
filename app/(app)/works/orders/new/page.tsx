"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleForm } from "@/components/module-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export default function Page() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [multiDay, setMultiDay] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch("/api/projects")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!active) return;
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const endDateInvalid = useMemo(() => {
    if (!multiDay || !taskDate || !endDate) return false;
    return new Date(endDate) < new Date(taskDate);
  }, [multiDay, taskDate, endDate]);

  async function handleSubmit() {
    if (endDateInvalid) {
      setMessage("A data final não pode ser menor que a data da tarefa.");
      return;
    }
    setSaving(true);
    setMessage(null);

    const payload = {
      projectId,
      title,
      description: description || undefined,
      status: status || undefined,
      scheduledStart: taskDate || undefined,
      scheduledEnd: multiDay ? endDate || undefined : undefined,
    };

    const response = await apiFetch("/api/work-orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Falha ao criar tarefa.");
      setSaving(false);
      return;
    }

    setMessage("Tarefa criada com sucesso.");
    window.location.href = "/works/orders";
  }

  return (
    <ModuleForm title="Nova tarefa" description="Criar ordem de serviço">
      <div className="grid gap-2">
        <Label>Projeto</Label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">Selecione um projeto</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label>Título</Label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Descrição</Label>
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label>Status</Label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Selecione um status</option>
          <option value="OPEN">Planejamento</option>
          <option value="IN_PROGRESS">Em progresso</option>
          <option value="COMPLETED">Concluída</option>
        </select>
      </div>

      <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-100/60 p-4">
        <div className="grid gap-2">
          <Label>Data da tarefa</Label>
          <Input
            type="date"
            value={taskDate}
            onChange={(event) => setTaskDate(event.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={multiDay}
            onChange={(event) => setMultiDay(event.target.checked)}
          />
          Tarefa de vários dias
        </label>
        {multiDay ? (
          <div className="grid gap-2 rounded-md border border-amber-200 bg-amber-50/70 p-3">
            <Label>Data final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            {endDateInvalid ? (
              <div className="text-sm text-red-600">
                A data final não pode ser menor que a data da tarefa.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="text-sm text-slate-600">{message}</div>
      ) : null}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={saving || !projectId || !title || !taskDate || endDateInvalid}
      >
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </ModuleForm>
  );
}