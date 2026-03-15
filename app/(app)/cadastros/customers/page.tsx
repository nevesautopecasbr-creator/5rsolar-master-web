"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { CustomerForm } from "@/components/cadastros/customer-form";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mapRow = useCallback((row: Record<string, unknown>) => ({
    Nome: String(row.name ?? "-"),
    Documento: String(row.document ?? "-"),
    Cidade: String(row.city ?? "-"),
    Editar: `/cadastros/customers/${String(row.id ?? "")}/edit`,
  }), []);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <DataPage
        key={refreshKey}
        title="Clientes"
        description="Cadastro de clientes"
        newHref="/cadastros/customers/new"
        newLabel="Novo cliente"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/customers"
        columns={[
          { key: "Nome", label: "Nome" },
          { key: "Documento", label: "Documento" },
          { key: "Cidade", label: "Cidade" },
          { key: "Editar", label: "Editar" },
        ]}
        mapRow={mapRow}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Cliente"
        description="Cadastre o cliente e as unidades consumidoras."
        size="xl"
      >
        <CustomerForm
          inline
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  );
}