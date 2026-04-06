"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

function fmtNum(v: unknown): string {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isNaN(n) ? "—" : n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Page() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mapRow = useCallback((row: Record<string, unknown>) => ({
    __rowId: String(row.id ?? ""),
    Cliente: String(row.customerName ?? "—"),
    "Consumo (kWh)": fmtNum(row.consumptionKwh),
    UC: String(row.consumerUnitCode ?? "—"),
    "Potência (kWp)": fmtNum(row.systemPowerKwp),
    "Valor total":
      row.totalValue != null
        ? Number(row.totalValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
    "Criar projeto": `/projects/new?budgetId=${String(row.id ?? "")}`,
    Editar: `/projects/budget/${String(row.id ?? "")}/edit`,
  }), []);

  const rowActions = useMemo(
    () => [
      {
        label: "PDF proposta",
        onClick: async (rowId: string) => {
          const r = await apiFetch(`/api/project-budgets/${rowId}/generate-pdf`, { method: "POST" });
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            window.alert(
              typeof (err as { message?: string }).message === "string"
                ? (err as { message: string }).message
                : "Não foi possível gerar o PDF da proposta.",
            );
            return;
          }
          const data = (await r.json()) as { proposalPdfUrl?: string };
          if (data.proposalPdfUrl) window.open(data.proposalPdfUrl, "_blank");
        },
      },
    ],
    [],
  );

  const handleOpenNew = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleGoToFullForm = useCallback(() => {
    setModalOpen(false);
    router.push("/projects/budget/new");
  }, [router]);

  return (
    <>
      <DataPage
        key={refreshKey}
        title="Orçamentos"
        description="Propostas comerciais com consumo, UC, potência e valores. Crie um projeto a partir de um orçamento."
        newHref="/projects/budget/new"
        newLabel="Novo orçamento"
        onNewClick={handleOpenNew}
        searchPlaceholder="Pesquisar orçamentos..."
        endpoint="/api/project-budgets"
        columns={[
          { key: "Cliente", label: "Cliente" },
          { key: "Consumo (kWh)", label: "Consumo (kWh)" },
          { key: "UC", label: "UC" },
          { key: "Potência (kWp)", label: "Potência (kWp)" },
          { key: "Valor total", label: "Valor total" },
          { key: "Criar projeto", label: "Criar projeto" },
          { key: "Editar", label: "Editar" },
        ]}
        mapRow={mapRow}
        rowActions={rowActions}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Orçamento"
        description="O orçamento possui várias etapas (projeto, produtos, revisão). Use o formulário completo para preencher."
        size="md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brand-navy-600">
            Você será redirecionado para o formulário completo do orçamento.
          </p>
          <div className="flex gap-2">
            <Button type="button" onClick={handleGoToFullForm}>
              Abrir formulário de orçamento
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
