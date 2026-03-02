import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Conta a Pagar"
      description="Registrar pagamento"
      endpoint="/api/payables"
      onSuccessRedirect="/finance/payables"
      fields={[
        { name: 'description', label: 'Descrição', type: 'text' },
        { name: 'amount', label: 'Valor', type: 'number' },
        { name: 'dueDate', label: 'Vencimento', type: 'date' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'supplierId', label: 'Fornecedor', type: 'text', placeholder: 'ID do fornecedor' },
        { name: 'purchaseOrderId', label: 'Pedido', type: 'text', placeholder: 'ID do pedido' },
        { name: 'accountId', label: 'Conta contábil', type: 'text' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'OPEN, PAID...' },
        { name: 'paymentMethod', label: 'Forma de pagamento', type: 'text' },
        { name: 'paidAt', label: 'Pagamento em', type: 'date' },
        { name: 'isDirectCost', label: 'Custo direto', type: 'checkbox' },
        { name: 'type', label: 'Tipo', type: 'text', placeholder: 'FIXED, VARIABLE...' },
        { name: 'recurrenceRule', label: 'Recorrência', type: 'text' },
        { name: 'nextDueDate', label: 'Próximo vencimento', type: 'date' },
      ]}
    />
  );
}