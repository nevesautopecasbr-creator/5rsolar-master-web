"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => {
    const project = row.project as { id?: string; name?: string } | undefined;
    const customer = row.customer as { id?: string; name?: string } | undefined;
    return {
      Projeto: project?.name ?? "—",
      Cliente: customer?.name ?? "—",
      "Valor total":
        row.totalValue != null
          ? Number(row.totalValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—",
      Status: String(row.status ?? "—"),
      Editar: `/contracts/${String(row.id ?? "")}/edit`,
    };
  };

  return (
    <DataPage
      title="Contratos"
      description="Contratos derivados de projetos. Crie um contrato a partir de um projeto (em Operações → Projetos) para preencher cliente, endereço, consumo e valores."
      newHref="/contracts/new"
      newLabel="Novo contrato"
      endpoint="/api/contracts"
      columns={[
        { key: "Projeto", label: "Projeto" },
        { key: "Cliente", label: "Cliente" },
        { key: "Valor total", label: "Valor total" },
        { key: "Status", label: "Status" },
        { key: "Editar", label: "Editar" },
      ]}
      mapRow={mapRow}
    />
  );
}
