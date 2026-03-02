"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Pedidos de Compra"
      description="Pedidos e recebimentos"
      newHref="/purchases/orders/new"
      endpoint="/api/purchase-orders"
      columns={[
        { key: 'Fornecedor', label: 'Fornecedor' },
        { key: 'Projeto', label: 'Projeto' },
        { key: 'Total', label: 'Total' },
        { key: 'Status', label: 'Status' },
      ]}
      mapRow={(row) => ({
        'Fornecedor': String(row.supplierId ?? '-'),
        'Projeto': String(row.projectId ?? '-'),
        'Total': String(row.total ?? '-'),
        'Status': String(row.status ?? '-'),
      })}
    />
  );
}