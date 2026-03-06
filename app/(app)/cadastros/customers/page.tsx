"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => ({
    Nome: String(row.name ?? "-"),
    Documento: String(row.document ?? "-"),
    Cidade: String(row.city ?? "-"),
    Editar: `/cadastros/customers/${String(row.id ?? "")}/edit`,
  });

  return (
    <DataPage
      title="Clientes"
      description="Cadastro de clientes"
      newHref="/cadastros/customers/new"
      endpoint="/api/customers"
      columns={[
        { key: "Nome", label: "Nome" },
        { key: "Documento", label: "Documento" },
        { key: "Cidade", label: "Cidade" },
        { key: "Editar", label: "Editar" },
      ]}
      mapRow={mapRow}
    />
  );
}