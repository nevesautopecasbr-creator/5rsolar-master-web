"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type AllowedAction = {
  action: string;
  label: string;
  requiresReason: boolean;
  requiresApproval: boolean;
  payload?: Record<string, unknown>;
};

type AllowedActionsResponse = {
  status: string;
  version: number;
  isBlocked: boolean;
  blockedReason?: string | null;
  allowedActions: AllowedAction[];
  pendingApprovals?: Array<{
    id: string;
    action: string;
    status: string;
    createdAt: string;
  }>;
};

type AuditLog = {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  createdAt: string;
  actor?: { id: string; name: string; email: string } | null;
  payload?: {
    fromStatus?: string;
    toStatus?: string;
    reason?: string | null;
    reasonType?: string | null;
  } | null;
};

type Props = {
  entityType: "SALE" | "CONTRACT" | "CHECKLIST";
  entityId: string;
};

export function StatusActionsPanel({ entityType, entityId }: Props) {
  const [data, setData] = useState<AllowedActionsResponse | null>(null);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [selectedAction, setSelectedAction] = useState<AllowedAction | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const [allowedRes, auditRes] = await Promise.all([
        apiFetch(`/api/workflow/${entityType}/${entityId}/allowed-actions`),
        apiFetch(`/api/audit?entityType=${entityType}&entityId=${entityId}`),
      ]);
      const allowedJson = allowedRes.ok ? await allowedRes.json() : null;
      const auditJson = auditRes.ok ? await auditRes.json() : [];
      setData(allowedJson);
      setAudit(Array.isArray(auditJson) ? auditJson : []);
    } catch {
      setStatusMessage("Falha ao carregar ações.");
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function performTransition(action: AllowedAction, reason?: string) {
    if (!data) return;
    setStatusMessage(null);
    setBanner(null);
    try {
      const response = await apiFetch(`/api/workflow/${entityType}/${entityId}/transition`, {
        method: "POST",
        body: JSON.stringify({
          action: action.action,
          reason,
          payload: action.payload,
          version: data.version,
        }),
      });
      if (response.status === 202) {
        const body = await response.json().catch(() => null);
        setBanner(
          `Pendente de aprovação${body?.approvalRequestId ? ` (#${body.approvalRequestId})` : ""}.`,
        );
      } else if (response.status === 409) {
        setStatusMessage("Atualização conflitante, recarregue.");
      } else if (!response.ok) {
        setStatusMessage("Não foi possível executar a ação.");
      }
      await loadData();
    } catch {
      setStatusMessage("Não foi possível executar a ação.");
    }
  }

  function handleActionClick(action: AllowedAction) {
    if (action.requiresReason) {
      setSelectedAction(action);
      setModalReason("");
      setModalOpen(true);
      return;
    }
    performTransition(action);
  }

  function handleModalConfirm() {
    if (!selectedAction) return;
    const reason = modalReason.trim();
    if (!reason) {
      setStatusMessage("Informe o motivo.");
      return;
    }
    setModalOpen(false);
    performTransition(selectedAction, reason);
  }

  const pendingApproval = data?.pendingApprovals?.length ? data.pendingApprovals[0] : null;

  return (
    <div className="grid gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-navy-100 px-3 py-1 text-xs uppercase text-brand-navy-600">
          {data?.status ?? "-"}
        </span>
        {data?.isBlocked ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs uppercase text-red-700">
            Bloqueado
          </span>
        ) : null}
      </div>

      {data?.isBlocked ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {data.blockedReason ?? "Checklist bloqueado."}
        </div>
      ) : null}

      {pendingApproval ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Aprovação pendente para {pendingApproval.action}.{" "}
          <a className="underline" href="/approvals">
            Ver central de aprovações
          </a>
          .
        </div>
      ) : null}

      {banner ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          {banner}{" "}
          <a className="underline" href="/approvals">
            Ver central de aprovações
          </a>
          .
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {loading ? (
          <span className="text-xs text-brand-navy-500">Carregando ações...</span>
        ) : data?.allowedActions?.length ? (
          data.allowedActions.map((action) => (
            <Button
              key={action.action}
              type="button"
              variant="outline"
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </Button>
          ))
        ) : (
          <span className="text-xs text-brand-navy-500">Nenhuma ação disponível.</span>
        )}
      </div>

      {statusMessage ? <div className="text-xs text-brand-navy-600">{statusMessage}</div> : null}

      <div className="grid gap-2">
        <div className="text-xs font-semibold text-brand-navy-700">Histórico</div>
        <div className="grid gap-2">
          {audit.length === 0 ? (
            <div className="text-xs text-brand-navy-500">Sem eventos.</div>
          ) : (
            audit.map((entry) => (
              <div key={entry.id} className="rounded-md border border-brand-navy-200 p-2 text-xs">
                <div className="text-brand-navy-700">
                  {entry.action}
                  {entry.payload?.fromStatus && entry.payload?.toStatus
                    ? ` (${entry.payload.fromStatus} → ${entry.payload.toStatus})`
                    : ""}
                </div>
                {entry.payload?.reason ? (
                  <div className="text-brand-navy-500">Motivo: {entry.payload.reason}</div>
                ) : null}
                <div className="text-brand-navy-400">
                  {entry.actor?.name ?? "Sistema"} •{" "}
                  {new Date(entry.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy-900/40 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-4 shadow-lg">
            <div className="text-sm font-semibold text-brand-navy-700">Informe o motivo</div>
            <textarea
              className="mt-3 h-28 w-full rounded-md border border-brand-navy-300 p-2 text-sm"
              value={modalReason}
              onChange={(event) => setModalReason(event.target.value)}
              placeholder="Descreva o motivo da ação."
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleModalConfirm}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
