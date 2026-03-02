import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Produto"
      description="Cadastro de itens"
      endpoint="/api/products"
      onSuccessRedirect="/cadastros/products"
      fields={[
        { name: 'name', label: 'Nome', type: 'text' },
        { name: 'sku', label: 'SKU', type: 'text' },
        { name: 'unit', label: 'Unidade', type: 'text' },
        { name: 'cost', label: 'Custo', type: 'number' },
        { name: 'price', label: 'Preço', type: 'number' },
        { name: 'isActive', label: 'Produto ativo', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}