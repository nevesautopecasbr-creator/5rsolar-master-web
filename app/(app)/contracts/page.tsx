"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Contratos"
      description="Contratos e aditivos"
      newHref="/contracts/new"
      endpoint="/api/contracts"
      columns={[
        { key: 'Cliente', label: 'Cliente' },
        { key: 'Projeto', label: 'Projeto' },
        { key: 'Valor', label: 'Valor' },
        { key: 'Status', label: 'Status' },
      ]}
      mapRow={(row) => ({
        'Cliente': String(row.customerId ?? '-'),
        'Projeto': String(row.projectId ?? '-'),
        'Valor': String(row.totalValue ?? '-'),
        'Status': String(row.status ?? '-'),
      })}
    />
  );
}