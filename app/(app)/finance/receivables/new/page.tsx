import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Conta a Receber"
      description="Registrar recebível"
      endpoint="/api/receivables"
      onSuccessRedirect="/finance/receivables"
      fields={[
        { name: 'description', label: 'Descrição', type: 'text' },
        { name: 'amount', label: 'Valor', type: 'number' },
        { name: 'dueDate', label: 'Vencimento', type: 'date' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'customerId', label: 'Cliente', type: 'text', placeholder: 'ID do cliente' },
        { name: 'contractId', label: 'Contrato', type: 'text', placeholder: 'ID do contrato' },
        { name: 'accountId', label: 'Conta contábil', type: 'text' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'OPEN, RECEIVED...' },
        { name: 'paymentMethod', label: 'Forma de pagamento', type: 'text' },
        { name: 'receivedAt', label: 'Recebido em', type: 'date' },
        { name: 'installmentNo', label: 'Parcela', type: 'number' },
        { name: 'totalInstallments', label: 'Total parcelas', type: 'number' },
      ]}
    />
  );
}