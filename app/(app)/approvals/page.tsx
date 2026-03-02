"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

type ApprovalRequest = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  status: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
  requestedBy?: { id: string; name: string; email: string } | null;
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadApprovals() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch("/api/approvals?status=PENDING");
      const data = res.ok ? await res.json() : [];
      setApprovals(Array.isArray(data) ? data : []);
      if (selected) {
        const updated = (Array.isArray(data) ? data : []).find((item) => item.id === selected.id);
        setSelected(updated ?? null);
      }
    } catch {
      setStatus("Falha ao carregar aprovações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  async function loadDetails(id: string) {
    setStatus(null);
    try {
      const res = await apiFetch(`/api/approvals/${id}`);
      if (!res.ok) {
        setStatus("Não foi possível carregar detalhes.");
        return;
      }
      const data = await res.json();
      setSelected(data);
    } catch {
      setStatus("Não foi possível carregar detalhes.");
    }
  }

  async function decide(decision: "APPROVE" | "REJECT") {
    if (!selected) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch(`/api/approvals/${selected.id}/decide`, {
        method: "POST",
        body: JSON.stringify({ decision, note: note || undefined }),
      });
      if (!res.ok) {
        setStatus("Não foi possível registrar decisão.");
        return;
      }
      setNote("");
      await loadApprovals();
      setSelected(null);
    } catch {
      setStatus("Não foi possível registrar decisão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Central de Aprovações</h1>
          <p className="text-sm text-slate-600">Pendências que aguardam decisão.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loading ? <div className="text-sm text-slate-600">Carregando...</div> : null}
          {approvals.length === 0 ? (
            <div className="text-sm text-slate-600">Nenhuma aprovação pendente.</div>
          ) : (
            <div className="grid gap-2">
              {approvals.map((approval) => (
                <button
                  key={approval.id}
                  className="flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={() => loadDetails(approval.id)}
                >
                  <div>
                    <div className="font-medium text-slate-700">{approval.action}</div>
                    <div className="text-xs text-slate-500">
                      {approval.entityType} • {approval.entityId}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(approval.createdAt).toLocaleString("pt-BR")}
                  </div>
                </button>
              ))}
            </div>
          )}

          {status ? <div className="text-sm text-slate-600">{status}</div> : null}
        </CardContent>
      </Card>

      {selected ? (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Detalhes</h2>
            <p className="text-sm text-slate-600">
              {selected.action} • {selected.entityType} • {selected.entityId}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
              <pre className="whitespace-pre-wrap text-slate-700">
                {JSON.stringify(selected.payload ?? {}, null, 2)}
              </pre>
            </div>
            <div className="grid gap-2">
              <Input
                placeholder="Nota da decisão (opcional)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => decide("APPROVE")} disabled={loading}>
                Aprovar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => decide("REJECT")}
                disabled={loading}
              >
                Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
