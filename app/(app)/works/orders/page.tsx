"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => ({
    'Título': String(row.title ?? '-'),
    'Projeto': String(row.projectId ?? '-'),
    'Status': String(row.status ?? '-'),
    'Prazo': String(row.scheduledEnd ?? '-'),
  });

  return (
    <DataPage
      title="Ordens de Serviço"
      description="Checklist, fotos e diário"
      newHref="/works/orders/new"
      endpoint="/api/work-orders"
      columns={[
        { key: 'Título', label: 'Título' },
        { key: 'Projeto', label: 'Projeto' },
        { key: 'Status', label: 'Status' },
        { key: 'Prazo', label: 'Prazo' },
      ]}
      mapRow={mapRow}
    />
  );
}