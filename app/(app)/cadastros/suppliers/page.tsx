"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Fornecedores"
      description="Cadastro de fornecedores"
      newHref="/cadastros/suppliers/new"
      endpoint="/api/suppliers"
      columns={[
        { key: 'Nome', label: 'Nome' },
        { key: 'Documento', label: 'Documento' },
        { key: 'Cidade', label: 'Cidade' },
        { key: 'Status', label: 'Status' },
      ]}
      mapRow={(row) => ({
        'Nome': String(row.name ?? '-'),
        'Documento': String(row.document ?? '-'),
        'Cidade': String(row.city ?? '-'),
        'Status': String(row.isActive ?? '-'),
      })}
    />
  );
}