"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => ({
    Nome: String(row.name ?? "—"),
    Código: String(row.code ?? "—"),
    Status: String(row.status ?? "—"),
    "Potência (kWp)":
      row.kWp != null
        ? Number(row.kWp).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        : "—",
    "Criar contrato": `/contracts/new?projectId=${String(row.id ?? "")}`,
  });

  return (
    <DataPage
      title="Projetos"
      description="Projetos criados a partir de orçamentos. Crie um contrato a partir de um projeto para preencher cliente, consumo, endereço e valores."
      newHref="/projects/budget"
      newLabel="Ver orçamentos (criar projeto)"
      endpoint="/api/projects"
      columns={[
        { key: "Nome", label: "Nome" },
        { key: "Código", label: "Código" },
        { key: "Status", label: "Status" },
        { key: "Potência (kWp)", label: "Potência (kWp)" },
        { key: "Criar contrato", label: "Criar contrato" },
      ]}
      mapRow={mapRow}
    />
  );
}
