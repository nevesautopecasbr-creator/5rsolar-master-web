"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Garantias"
      description="Gestão de garantias"
      newHref="/after-sales/warranties/new"
      endpoint="/api/warranties"
      columns={[
        { key: 'Cliente', label: 'Cliente' },
        { key: 'Projeto', label: 'Projeto' },
        { key: 'Início', label: 'Início' },
        { key: 'Fim', label: 'Fim' },
      ]}
      mapRow={(row) => ({
        'Cliente': String(row.customerId ?? '-'),
        'Projeto': String(row.projectId ?? '-'),
        'Início': String(row.startDate ?? '-'),
        'Fim': String(row.endDate ?? '-'),
      })}
    />
  );
}