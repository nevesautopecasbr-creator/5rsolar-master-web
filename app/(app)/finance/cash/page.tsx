"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Caixa/Bancos"
      description="Movimentações e conciliação"
      newHref="/finance/cash/new"
      endpoint="/api/cash-movements"
      columns={[
        { key: 'Conta', label: 'Conta' },
        { key: 'Direção', label: 'Direção' },
        { key: 'Valor', label: 'Valor' },
        { key: 'Data', label: 'Data' },
      ]}
      mapRow={(row) => ({
        'Conta': String(row.cashAccountId ?? '-'),
        'Direção': String(row.direction ?? '-'),
        'Valor': String(row.amount ?? '-'),
        'Data': String(row.movementDate ?? '-'),
      })}
    />
  );
}