"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/cadastros/product-form";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mapRow = useCallback((row: Record<string, unknown>) => ({
    Nome: String(row.name ?? "-"),
    SKU: String(row.sku ?? "-"),
    Unidade: String(row.unit ?? "-"),
    Preço:
      row.price != null
        ? Number(row.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
        : "-",
    Editar: `/cadastros/products/${String(row.id ?? "")}/edit`,
  }), []);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <DataPage
        key={refreshKey}
        title="Produtos / Itens"
        description="Cadastro de produtos que podem ser adicionados aos orçamentos"
        newHref="/cadastros/products/new"
        newLabel="Novo produto"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/products"
        columns={[
          { key: "Nome", label: "Nome" },
          { key: "SKU", label: "SKU" },
          { key: "Unidade", label: "Unidade" },
          { key: "Preço", label: "Preço" },
          { key: "Editar", label: "Editar" },
        ]}
        mapRow={mapRow}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Produto"
        description="Cadastre o produto. Nome é obrigatório."
        size="lg"
      >
        <ProductForm
          inline
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  );
}
