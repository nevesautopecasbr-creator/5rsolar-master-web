"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Tickets"
      description="Chamados de pós-venda"
      newHref="/after-sales/tickets/new"
      endpoint="/api/tickets"
      columns={[
        { key: 'Assunto', label: 'Assunto' },
        { key: 'Cliente', label: 'Cliente' },
        { key: 'Status', label: 'Status' },
        { key: 'Prioridade', label: 'Prioridade' },
      ]}
      mapRow={(row) => ({
        'Assunto': String(row.subject ?? '-'),
        'Cliente': String(row.customerId ?? '-'),
        'Status': String(row.status ?? '-'),
        'Prioridade': String(row.priority ?? '-'),
      })}
    />
  );
}