"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { DynamicForm } from "@/components/dynamic-form";

const BANK_FIELDS = [
  { name: "name", label: "Banco", type: "text", required: true },
  { name: "code", label: "Código", type: "text", mask: "number" as const, placeholder: "Apenas números" },
  { name: "agency", label: "Agência", type: "text", mask: "number" as const },
  { name: "accountNumber", label: "Conta", type: "text", mask: "number" as const },
  { name: "accountType", label: "Tipo de conta", type: "text", placeholder: "Ex: Corrente, Poupança" },
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
        title="Bancos"
        description="Cadastro de bancos"
        newHref="/cadastros/banks/new"
        newLabel="Novo banco"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/banks"
        columns={[
          { key: "Banco", label: "Banco" },
          { key: "Agência", label: "Agência" },
          { key: "Conta", label: "Conta" },
          { key: "Tipo", label: "Tipo" },
        ]}
        mapRow={(row) => ({
          Banco: String(row.name ?? "-"),
          Agência: String(row.agency ?? "-"),
          Conta: String(row.accountNumber ?? "-"),
          Tipo: String(row.accountType ?? "-"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Banco"
        description="Cadastro de bancos"
        size="md"
      >
        <DynamicForm
          title=""
          description=""
          endpoint="/api/banks"
          fields={BANK_FIELDS}
          onSuccess={handleSuccess}
          inline
        />
      </Modal>
    </>
  );
}