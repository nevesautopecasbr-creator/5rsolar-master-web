"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => ({
    Nome: String(row.name ?? "-"),
    SKU: String(row.sku ?? "-"),
    Unidade: String(row.unit ?? "-"),
    Preço: row.price != null ? Number(row.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-",
    Editar: `/cadastros/products/${String(row.id ?? "")}/edit`,
  });

  return (
    <DataPage
      title="Produtos / Itens"
      description="Cadastro de produtos que podem ser adicionados aos orçamentos"
      newHref="/cadastros/products/new"
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
  );
}
