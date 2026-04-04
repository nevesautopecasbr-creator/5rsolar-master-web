"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { DynamicForm } from "@/components/dynamic-form";
import { formatAmountFromApi } from "@/lib/masks";

const RECEIVABLE_FIELDS = [
  { name: "description", label: "Descrição", type: "text" as const, required: true },
  { name: "amount", label: "Valor (R$)", type: "text" as const, mask: "money" as const, required: true },
  { name: "dueDate", label: "Vencimento", type: "date" as const, required: true },
  {
    name: "projectId",
    label: "Projeto",
    type: "select" as const,
    optionsUrl: "/api/projects",
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "customerId",
    label: "Cliente",
    type: "select" as const,
    optionsUrl: "/api/customers",
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  { name: "contractId", label: "Contrato", type: "text" as const, placeholder: "ID do contrato" },
  {
    name: "accountId",
    label: "Conta contábil",
    type: "select" as const,
    optionsUrl: "/api/chart-accounts",
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    defaultValue: "OPEN",
    options: [
      { value: "OPEN", label: "Em aberto" },
      { value: "PAID", label: "Pago" },
      { value: "OVERDUE", label: "Vencido" },
      { value: "CANCELLED", label: "Cancelado" },
    ],
  },
  {
    name: "paymentMethod",
    label: "Forma de pagamento",
    type: "select" as const,
    options: [
      { value: "PIX", label: "PIX" },
      { value: "CARTAO", label: "Cartão" },
      { value: "BOLETO", label: "Boleto" },
      { value: "DINHEIRO", label: "Dinheiro" },
    ],
  },
  { name: "receivedAt", label: "Recebido em", type: "date" as const },
  { name: "installmentNo", label: "Parcela", type: "text" as const, mask: "number" as const },
  { name: "totalInstallments", label: "Total parcelas", type: "text" as const, mask: "number" as const },
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
        title="Contas a Receber"
        description="Parcelas e inadimplência"
        newHref="/finance/receivables/new"
        newLabel="Nova conta a receber"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/receivables"
        columns={[
          { key: "Descrição", label: "Descrição" },
          { key: "Projeto", label: "Projeto" },
          { key: "Valor", label: "Valor" },
          { key: "Vencimento", label: "Vencimento" },
        ]}
        mapRow={(row) => ({
          Descrição: String(row.description ?? "-"),
          Projeto: String(row.projectId ?? "-"),
          Valor: formatAmountFromApi(row.amount),
          Vencimento: String(row.dueDate ?? "-"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Conta a Receber"
        description="Registrar recebível"
        size="lg"
      >
        <DynamicForm
          title=""
          description=""
          endpoint="/api/receivables"
          fields={RECEIVABLE_FIELDS}
          onSuccess={handleSuccess}
          inline
        />
      </Modal>
    </>
  );
}