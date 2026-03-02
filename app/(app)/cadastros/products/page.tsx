"use client";

import { DataPage } from "@/components/data-page";

export default function Page() {
  return (
    <DataPage
      title="Produtos/Itens"
      description="Cadastro de itens"
      newHref="/cadastros/products/new"
      endpoint="/api/products"
      columns={[
        { key: 'Nome', label: 'Nome' },
        { key: 'SKU', label: 'SKU' },
        { key: 'Preço', label: 'Preço' },
        { key: 'Ativo', label: 'Ativo' },
      ]}
      mapRow={(row) => ({
        'Nome': String(row.name ?? '-'),
        'SKU': String(row.sku ?? '-'),
        'Preço': String(row.price ?? '-'),
        'Ativo': String(row.isActive ?? '-'),
      })}
    />
  );
}