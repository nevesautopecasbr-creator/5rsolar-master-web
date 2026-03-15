"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { DynamicForm } from "@/components/dynamic-form";

const PAYABLE_FIELDS = [
  { name: "description", label: "Descrição", type: "text", required: true },
  { name: "amount", label: "Valor (R$)", type: "text", mask: "money" as const, required: true },
  { name: "dueDate", label: "Vencimento", type: "date", required: true },
  { name: "projectId", label: "Projeto", type: "text", placeholder: "ID do projeto" },
  { name: "supplierId", label: "Fornecedor", type: "text", placeholder: "ID do fornecedor" },
  { name: "accountId", label: "Conta contábil", type: "text" },
  { name: "status", label: "Status", type: "text", placeholder: "OPEN, PAID..." },
  { name: "paymentMethod", label: "Forma de pagamento", type: "text" },
  { name: "isDirectCost", label: "Custo direto", type: "checkbox" },
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
        title="Contas a Pagar"
        description="Pagamentos e aprovações"
        newHref="/finance/payables/new"
        newLabel="Nova conta a pagar"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/payables"
        columns={[
          { key: "Descrição", label: "Descrição" },
          { key: "Projeto", label: "Projeto" },
          { key: "Valor", label: "Valor" },
          { key: "Vencimento", label: "Vencimento" },
        ]}
        mapRow={(row) => ({
          Descrição: String(row.description ?? "-"),
          Projeto: String(row.projectId ?? "-"),
          Valor: String(row.amount ?? "-"),
          Vencimento: String(row.dueDate ?? "-"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Conta a Pagar"
        description="Registrar pagamento"
        size="lg"
      >
        <DynamicForm
          title=""
          description=""
          endpoint="/api/payables"
          fields={PAYABLE_FIELDS}
          onSuccess={handleSuccess}
          inline
        />
      </Modal>
    </>
  );
}