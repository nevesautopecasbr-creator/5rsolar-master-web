import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Pedido"
      description="Criar pedido de compra"
      endpoint="/api/purchase-orders"
      onSuccessRedirect="/purchases/orders"
      fields={[
        { name: 'supplierId', label: 'Fornecedor', type: 'text', placeholder: 'ID do fornecedor' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'quoteId', label: 'Cotação', type: 'text', placeholder: 'ID da cotação' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'OPEN, APPROVED...' },
        { name: 'total', label: 'Total', type: 'number' },
        { name: 'notes', label: 'Observações', type: 'text' },
        { name: 'payableDueDate', label: 'Vencimento', type: 'date' },
      ]}
    />
  );
}