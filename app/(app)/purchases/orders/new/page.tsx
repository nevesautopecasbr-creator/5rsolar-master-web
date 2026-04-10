import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Pedido"
      description="Criar pedido de compra"
      endpoint="/api/purchase-orders"
      onSuccessRedirect="/purchases/orders"
      fields={[
        {
          name: 'supplierId',
          label: 'Fornecedor',
          type: 'select',
          optionsUrl: '/api/suppliers',
          optionValueKey: 'id',
          optionLabelKey: 'name',
        },
        {
          name: 'projectId',
          label: 'Projeto',
          type: 'select',
          optionsUrl: '/api/projects',
          optionValueKey: 'id',
          optionLabelKey: 'name',
        },
        {
          name: "quoteId",
          label: "Cotação",
          type: "select",
          optionsUrl: "/api/purchase-quotes",
          optionValueKey: "id",
          optionLabelKey: "label",
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'DRAFT',
          options: [
            { value: 'DRAFT', label: 'Rascunho' },
            { value: 'PENDING', label: 'Pendente' },
            { value: 'APPROVED', label: 'Aprovado' },
            { value: 'ORDERED', label: 'Pedido emitido' },
            { value: 'RECEIVED', label: 'Recebido' },
            { value: 'CANCELLED', label: 'Cancelado' },
          ],
        },
        { name: 'total', label: 'Total (R$)', type: 'text', mask: 'money' as const },
        { name: 'notes', label: 'Observações', type: 'text' },
        { name: 'payableDueDate', label: 'Vencimento', type: 'date' },
      ]}
    />
  );
}