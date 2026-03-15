"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { DynamicForm } from "@/components/dynamic-form";

const SUPPLIER_FIELDS = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "document", label: "CPF/CNPJ", type: "text", mask: "cpfCnpj" as const, required: true },
  { name: "email", label: "E-mail", type: "email" },
  { name: "phone", label: "Telefone", type: "text", mask: "phone" as const },
  { name: "address", label: "Endereço", type: "text" },
  { name: "city", label: "Cidade", type: "text" },
  { name: "state", label: "UF", type: "text", placeholder: "Ex: SP" },
  { name: "zipCode", label: "CEP", type: "text", mask: "cep" as const },
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
        title="Fornecedores"
        description="Cadastro de fornecedores"
        newHref="/cadastros/suppliers/new"
        newLabel="Novo fornecedor"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/suppliers"
        columns={[
          { key: "Nome", label: "Nome" },
          { key: "Documento", label: "Documento" },
          { key: "Cidade", label: "Cidade" },
          { key: "Status", label: "Status" },
        ]}
        mapRow={(row) => ({
          Nome: String(row.name ?? "-"),
          Documento: String(row.document ?? "-"),
          Cidade: String(row.city ?? "-"),
          Status: String(row.isActive ?? "-"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Fornecedor"
        description="Cadastro de fornecedor"
        size="lg"
      >
        <DynamicForm
          title=""
          description=""
          endpoint="/api/suppliers"
          fields={SUPPLIER_FIELDS}
          onSuccess={handleSuccess}
          inline
        />
      </Modal>
    </>
  );
}