"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { StatusActionsPanel } from "@/components/workflow/StatusActionsPanel";

type Checklist = {
  id: string;
  status: string;
  version: number;
  startedAt?: string | null;
  finishedAt?: string | null;
  contractId: string;
};

type Sale = {
  id: string;
  status: string;
  version: number;
};

type ChecklistItem = {
  id: string;
  title: string;
  description?: string | null;
  department: string;
  isRequired: boolean;
  status: string;
  dueDate?: string | null;
  notes?: string | null;
  assigneeUserId?: string | null;
  assignee?: { id: string; name: string } | null;
  evidences?: Array<{ id: string; fileUrl: string; fileName: string }>;
};

export default function ImplementationChecklistPage() {
  const params = useParams<{ saleId: string }>();
  const saleId = params.saleId;
  const [sale, setSale] = useState<Sale | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [filters, setFilters] = useState({
    department: "ALL",
    status: "ALL",
    assignee: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch(`/api/sales/${saleId}`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setSale(data);
      })
      .catch(() => {
        if (!active) return;
        setStatus("Falha ao carregar venda.");
      });

    apiFetch(`/api/sales/${saleId}/checklist`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setChecklist(data);
        if (data?.id) {
          return apiFetch(`/api/checklists/${data.id}/items`).then(async (res) =>
            res.ok ? res.json() : [],
          );
        }
        return [];
      })
      .then((itemsData) => {
        if (!active) return;
        setItems(Array.isArray(itemsData) ? itemsData : []);
      })
      .catch(() => {
        if (!active) return;
        setStatus("Falha ao carregar checklist.");
      });
    return () => {
      active = false;
    };
  }, [saleId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesDept =
        filters.department === "ALL" || item.department === filters.department;
      const matchesStatus = filters.status === "ALL" || item.status === filters.status;
      const matchesAssignee = filters.assignee
        ? item.assignee?.name?.toLowerCase().includes(filters.assignee.toLowerCase())
        : true;
      return matchesDept && matchesStatus && matchesAssignee;
    });
  }, [items, filters]);

  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    const done = items.filter((item) => item.status === "DONE").length;
    return Math.round((done / items.length) * 100);
  }, [items]);

  async function updateItemStatus(itemId: string, status: string) {
    const res = await apiFetch(`/api/checklist-items/${itemId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
    }
  }

  async function uploadEvidence(itemId: string, file: File) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64 = `data:${file.type};base64,${btoa(binary)}`;
    const res = await apiFetch(`/api/checklist-items/${itemId}/evidence`, {
      method: "POST",
      body: JSON.stringify({ fileBase64: base64, fileName: file.name }),
    });
    if (res.ok) {
      const evidence = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, evidences: [...(item.evidences ?? []), evidence] }
            : item,
        ),
      );
    }
  }

  async function assignItem(itemId: string, assigneeUserId: string) {
    const res = await apiFetch(`/api/checklist-items/${itemId}/assign`, {
      method: "PUT",
      body: JSON.stringify({
        assigneeUserId: assigneeUserId ? assigneeUserId : null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
    }
  }

  async function updateItemNotes(itemId: string, status: string, notes: string) {
    const res = await apiFetch(`/api/checklist-items/${itemId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Checklist de Implantação</h1>
          <p className="text-sm text-brand-navy-600">
            Acompanhe tarefas obrigatórias após assinatura do contrato.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
              <div className="font-semibold text-brand-navy-700">Ações da venda</div>
              <div className="mt-3">
                <StatusActionsPanel entityType="SALE" entityId={saleId} />
              </div>
              <div className="mt-2 text-xs text-brand-navy-500">
                Status: {sale?.status ?? "-"}
              </div>
            </div>
            {checklist ? (
              <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                <div className="font-semibold text-brand-navy-700">Ações do checklist</div>
                <div className="mt-3">
                  <StatusActionsPanel entityType="CHECKLIST" entityId={checklist.id} />
                </div>
                <div className="mt-2 text-xs text-brand-navy-500">
                  Status: {checklist.status}
                </div>
              </div>
            ) : null}
          </div>
          {!checklist ? (
            <div className="text-sm text-brand-navy-600">
              Nenhum checklist disponível. Assine o contrato para liberar.
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                  Status: {checklist.status}
                </div>
                <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                  Progresso: {progress}%
                </div>
                <div className="rounded-md border border-brand-navy-200 p-3 text-sm">
                  Início: {checklist.startedAt ? new Date(checklist.startedAt).toLocaleDateString("pt-BR") : "-"}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <select
                  className="h-10 rounded-md border border-brand-navy-300 bg-white px-2 text-sm"
                  value={filters.department}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, department: event.target.value }))
                  }
                >
                  <option value="ALL">Departamento</option>
                  <option value="COMMERCIAL">Comercial</option>
                  <option value="CONTRACTS">Contratos</option>
                  <option value="FINANCE">Financeiro</option>
                  <option value="TECHNICAL">Técnico</option>
                  <option value="OPERATIONS">Operações</option>
                </select>
                <select
                  className="h-10 rounded-md border border-brand-navy-300 bg-white px-2 text-sm"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="ALL">Status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="DONE">Concluído</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
                <Input
                  placeholder="Responsável"
                  value={filters.assignee}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, assignee: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-brand-navy-200 p-4 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-brand-navy-700">
                          {item.title}
                        </div>
                        <div className="text-brand-navy-500">{item.description}</div>
                        <div className="text-xs text-brand-navy-400">
                          Departamento: {item.department} | Obrigatório:{" "}
                          {item.isRequired ? "Sim" : "Não"}
                        </div>
                      </div>
                      <select
                        className="h-9 rounded-md border border-brand-navy-300 bg-white px-2 text-sm"
                        value={item.status}
                        onChange={(event) => updateItemStatus(item.id, event.target.value)}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="IN_PROGRESS">Em andamento</option>
                        <option value="DONE">Concluído</option>
                        <option value="BLOCKED">Bloqueado</option>
                      </select>
                    </div>
                    <div className="mt-2 text-xs text-brand-navy-500">
                      Prazo: {item.dueDate ? new Date(item.dueDate).toLocaleDateString("pt-BR") : "-"}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <Input
                        placeholder="Responsável (ID usuário)"
                        value={item.assigneeUserId ?? ""}
                        onChange={(event) => assignItem(item.id, event.target.value)}
                      />
                      <Input
                        placeholder="Observações"
                        value={item.notes ?? ""}
                        onChange={(event) =>
                          updateItemNotes(item.id, item.status, event.target.value)
                        }
                      />
                    </div>
                    <div className="mt-3 grid gap-2">
                      <input
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            uploadEvidence(item.id, file);
                          }
                        }}
                      />
                      {item.evidences?.length ? (
                        <div className="flex flex-wrap gap-2 text-xs text-brand-navy-600">
                          {item.evidences.map((evidence) => (
                            <a
                              key={evidence.id}
                              href={evidence.fileUrl}
                              className="underline"
                              target="_blank"
                            >
                              {evidence.fileName}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {status ? <span className="text-sm text-brand-navy-600">{status}</span> : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
