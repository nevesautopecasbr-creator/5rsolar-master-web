"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Solicitações de Compra"
      description="Fluxo de solicitações"
      newHref="/purchases/requests/new"
      endpoint="/api/purchase-requests"
      columns={[
        { key: 'Título', label: 'Título' },
        { key: 'Projeto', label: 'Projeto' },
        { key: 'Status', label: 'Status' },
        { key: 'Criado em', label: 'Criado em' },
      ]}
      mapRow={(row) => ({
        'Título': String(row.title ?? '-'),
        'Projeto': String(row.projectId ?? '-'),
        'Status': String(row.status ?? '-'),
        'Criado em': String(row.createdAt ?? '-'),
      })}
    />
  );
}