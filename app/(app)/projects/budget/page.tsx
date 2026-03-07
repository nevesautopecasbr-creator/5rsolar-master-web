"use client";

import { DataPage } from "@/components/data-page";

function fmtNum(v: unknown): string {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isNaN(n) ? "—" : n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => ({
    Cliente: String(row.customerName ?? "—"),
    "Consumo (kWh)": fmtNum(row.consumptionKwh),
    UC: String(row.consumerUnitCode ?? "—"),
    "Potência (kWp)": fmtNum(row.systemPowerKwp),
    "Valor total":
      row.totalValue != null
        ? Number(row.totalValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
    "Criar projeto": `/projects/new?budgetId=${String(row.id ?? "")}`,
    Editar: `/projects/budget/${String(row.id ?? "")}/edit`,
  });

  return (
    <DataPage
      title="Orçamentos"
      description="Propostas comerciais com consumo, UC, potência e valores. Crie um projeto a partir de um orçamento."
      newHref="/projects/budget/new"
      endpoint="/api/project-budgets"
      columns={[
        { key: "Cliente", label: "Cliente" },
        { key: "Consumo (kWh)", label: "Consumo (kWh)" },
        { key: "UC", label: "UC" },
        { key: "Potência (kWp)", label: "Potência (kWp)" },
        { key: "Valor total", label: "Valor total" },
        { key: "Criar projeto", label: "Criar projeto" },
        { key: "Editar", label: "Editar" },
      ]}
      mapRow={mapRow}
    />
  );
}
