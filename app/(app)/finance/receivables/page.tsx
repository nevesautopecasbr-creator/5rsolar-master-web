"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Contas a Receber"
      description="Parcelas e inadimplência"
      newHref="/finance/receivables/new"
      endpoint="/api/receivables"
      columns={[
        { key: 'Descrição', label: 'Descrição' },
        { key: 'Projeto', label: 'Projeto' },
        { key: 'Valor', label: 'Valor' },
        { key: 'Vencimento', label: 'Vencimento' },
      ]}
      mapRow={(row) => ({
        'Descrição': String(row.description ?? '-'),
        'Projeto': String(row.projectId ?? '-'),
        'Valor': String(row.amount ?? '-'),
        'Vencimento': String(row.dueDate ?? '-'),
      })}
    />
  );
}