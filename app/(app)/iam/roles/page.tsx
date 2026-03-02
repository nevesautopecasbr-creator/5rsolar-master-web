"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Perfis"
      description="Roles e permissões"
      newHref="/iam/roles/new"
      endpoint="/api/roles"
      columns={[
        { key: 'Nome', label: 'Nome' },
        { key: 'Descrição', label: 'Descrição' },
        { key: 'Permissões', label: 'Permissões' },
        { key: 'Ativo', label: 'Ativo' },
      ]}
      mapRow={(row) => ({
        'Nome': String(row.name ?? '-'),
        'Descrição': String(row.description ?? '-'),
        'Permissões': Array.isArray(row.grants) ? String(row.grants.length) : '-',
        'Ativo':
          row.isActive === true
            ? 'Sim'
            : row.isActive === false
              ? 'Não'
              : '-',
      })}
    />
  );
}