"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Bancos"
      description="Cadastro de bancos"
      newHref="/cadastros/banks/new"
      endpoint="/api/banks"
      columns={[
        { key: 'Banco', label: 'Banco' },
        { key: 'Agência', label: 'Agência' },
        { key: 'Conta', label: 'Conta' },
        { key: 'Tipo', label: 'Tipo' },
      ]}
      mapRow={(row) => ({
        'Banco': String(row.name ?? '-'),
        'Agência': String(row.agency ?? '-'),
        'Conta': String(row.accountNumber ?? '-'),
        'Tipo': String(row.accountType ?? '-'),
      })}
    />
  );
}