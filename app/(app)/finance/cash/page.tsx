"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { DynamicForm } from "@/components/dynamic-form";

const CASH_MOVEMENT_FIELDS = [
  { name: "cashAccountId", label: "Conta caixa", type: "text", required: true },
  { name: "direction", label: "Direção", type: "text", placeholder: "IN ou OUT", required: true },
  { name: "amount", label: "Valor (R$)", type: "text", mask: "money" as const, required: true },
  { name: "movementDate", label: "Data", type: "date", required: true },
  { name: "description", label: "Descrição", type: "text" },
  { name: "projectId", label: "Projeto", type: "text" },
  { name: "accountId", label: "Conta contábil", type: "text" },
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <DataPage
        key={refreshKey}
        title="Caixa/Bancos"
        description="Movimentações e conciliação"
        newHref="/finance/cash/new"
        newLabel="Nova movimentação"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/cash-movements"
        columns={[
          { key: "Conta", label: "Conta" },
          { key: "Direção", label: "Direção" },
          { key: "Valor", label: "Valor" },
          { key: "Data", label: "Data" },
        ]}
        mapRow={(row) => ({
          Conta: String(row.cashAccountId ?? "-"),
          Direção: String(row.direction ?? "-"),
          Valor: String(row.amount ?? "-"),
          Data: String(row.movementDate ?? "-"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Movimentação"
        description="Registrar movimento de caixa"
        size="md"
      >
        <DynamicForm
          title=""
          description=""
          endpoint="/api/cash-movements"
          fields={CASH_MOVEMENT_FIELDS}
          onSuccess={handleSuccess}
          inline
        />
      </Modal>
    </>
  );
}