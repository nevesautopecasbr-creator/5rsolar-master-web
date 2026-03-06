"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  const mapRow = (row: Record<string, unknown>) => {
    const roles = (row.roles as Array<{ role?: { name?: string } }>) ?? [];
    const roleName = roles[0]?.role?.name ?? "-";
    return {
      Nome: String(row.name ?? "-"),
      Email: String(row.email ?? "-"),
      Perfil: String(roleName),
      Ativo:
        row.isActive === true
          ? "Sim"
          : row.isActive === false
            ? "Não"
            : "-",
      Ações: `/iam/users/${row.id}/edit`,
    };
  };

  return (
    <DataPage
      title="Usuários"
      description="Gestão de usuários e acessos"
      newHref="/iam/users/new"
      endpoint="/api/users"
      columns={[
        { key: "Nome", label: "Nome" },
        { key: "Email", label: "Email" },
        { key: "Perfil", label: "Perfil" },
        { key: "Ativo", label: "Ativo" },
        { key: "Ações", label: "Ações" },
      ]}
      mapRow={mapRow}
    />
  );
}