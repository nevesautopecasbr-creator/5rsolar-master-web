"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { DynamicForm } from "@/components/dynamic-form";
import { formatAmountFromApi } from "@/lib/masks";

const CASH_MOVEMENT_FIELDS = [
  {
    name: "cashAccountId",
    label: "Conta caixa",
    type: "select" as const,
    optionsUrl: "/api/cash-accounts",
    optionValueKey: "id",
    optionLabelKey: "name",
    required: true,
  },
  {
    name: "direction",
    label: "Direção",
    type: "select" as const,
    defaultValue: "IN",
    required: true,
    options: [
      { value: "IN", label: "Entrada" },
      { value: "OUT", label: "Saída" },
    ],
  },
  { name: "amount", label: "Valor (R$)", type: "text" as const, mask: "money" as const, required: true },
  { name: "movementDate", label: "Data", type: "date" as const, required: true },
  { name: "description", label: "Descrição", type: "text" as const },
  {
    name: "projectId",
    label: "Projeto",
    type: "select" as const,
    optionsUrl: "/api/projects",
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "accountId",
    label: "Conta contábil",
    type: "select" as const,
    optionsUrl: "/api/chart-accounts",
    optionValueKey: "id",
    optionLabelKey: "name",
  },
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
          Valor: formatAmountFromApi(row.amount),
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