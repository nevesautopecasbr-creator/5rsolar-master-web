"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => ({
    'Nome': String(row.name ?? '-'),
    'Email': String(row.email ?? '-'),
    'Ativo':
      row.isActive === true
        ? 'Sim'
        : row.isActive === false
          ? 'Não'
          : '-',
  });

  return (
    <DataPage
      title="Usuários"
      description="Gestão de usuários e acessos"
      newHref="/iam/users/new"
      endpoint="/api/users"
      columns={[
        { key: 'Nome', label: 'Nome' },
        { key: 'Email', label: 'Email' },
        { key: 'Ativo', label: 'Ativo' },
      ]}
      mapRow={mapRow}
    />
  );
}