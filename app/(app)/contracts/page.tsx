"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mapRow = useCallback((row: Record<string, unknown>) => {
    const project = row.project as { id?: string; name?: string } | undefined;
    const customer = row.customer as { id?: string; name?: string } | undefined;
    return {
      __rowId: String(row.id ?? ""),
      Projeto: project?.name ?? "—",
      Cliente: customer?.name ?? "—",
      "Valor total":
        row.totalValue != null
          ? Number(row.totalValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—",
      Status: String(row.status ?? "—"),
      Editar: `/contracts/${String(row.id ?? "")}/edit`,
    };
  }, []);

  const rowActions = useMemo(
    () => [
      {
        label: "PDF",
        onClick: async (rowId: string) => {
          const r = await apiFetch(`/api/contracts/${rowId}/generate-pdf`, { method: "POST" });
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            window.alert(
              typeof (err as { message?: string }).message === "string"
                ? (err as { message: string }).message
                : "Não foi possível gerar o PDF do contrato.",
            );
            return;
          }
          const data = (await r.json()) as { contractPdfUrl?: string };
          if (data.contractPdfUrl) window.open(data.contractPdfUrl, "_blank");
        },
      },
    ],
    [],
  );

  const handleOpenNew = useCallback(() => setModalOpen(true), []);
  const handleGoToForm = useCallback(() => {
    setModalOpen(false);
    router.push("/contracts/new");
  }, [router]);

  return (
    <>
      <DataPage
        key={refreshKey}
        title="Contratos"
        description="Contratos derivados de projetos. Crie um contrato a partir de um projeto (em Operações → Projetos) para preencher cliente, endereço, consumo e valores."
        newHref="/contracts/new"
        newLabel="Novo contrato"
        onNewClick={handleOpenNew}
        endpoint="/api/contracts"
        columns={[
          { key: "Projeto", label: "Projeto" },
          { key: "Cliente", label: "Cliente" },
          { key: "Valor total", label: "Valor total" },
          { key: "Status", label: "Status" },
          { key: "Editar", label: "Editar" },
        ]}
        mapRow={mapRow}
        rowActions={rowActions}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Contrato"
        description="Contratos são criados a partir de projetos. Selecione o projeto para preencher cliente e valor."
        size="md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brand-navy-600">
            Abra o formulário completo para selecionar o projeto e preencher os dados do contrato.
          </p>
          <div className="flex gap-2">
            <Button type="button" onClick={handleGoToForm}>
              Abrir formulário de contrato
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
