import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Conta a Receber"
      description="Registrar recebível"
      endpoint="/api/receivables"
      onSuccessRedirect="/finance/receivables"
      fields={[
        { name: 'description', label: 'Descrição', type: 'text', required: true },
        { name: 'amount', label: 'Valor (R$)', type: 'text', mask: 'money', required: true },
        { name: 'dueDate', label: 'Vencimento', type: 'date', required: true },
        { name: 'projectId', label: 'Projeto', type: 'select', optionsUrl: '/api/projects', optionValueKey: 'id', optionLabelKey: 'name' },
        { name: 'customerId', label: 'Cliente', type: 'select', optionsUrl: '/api/customers', optionValueKey: 'id', optionLabelKey: 'name' },
        { name: 'contractId', label: 'Contrato', type: 'select', optionsUrl: '/api/contracts', optionValueKey: 'id', optionLabelKey: 'title' },
        { name: 'accountId', label: 'Conta contábil', type: 'select', optionsUrl: '/api/chart-accounts', optionValueKey: 'id', optionLabelKey: 'name' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'OPEN',
          options: [
            { value: 'OPEN', label: 'Em aberto' },
            { value: 'PAID', label: 'Pago' },
            { value: 'OVERDUE', label: 'Vencido' },
            { value: 'CANCELLED', label: 'Cancelado' },
          ],
        },
        {
          name: 'paymentMethod',
          label: 'Forma de pagamento',
          type: 'select',
          options: [
            { value: 'PIX', label: 'PIX' },
            { value: 'CARTAO', label: 'Cartão' },
            { value: 'BOLETO', label: 'Boleto' },
            { value: 'DINHEIRO', label: 'Dinheiro' },
          ],
        },
        { name: 'receivedAt', label: 'Recebido em', type: 'date' },
        { name: 'installmentNo', label: 'Parcela', type: 'text', mask: 'number' },
        { name: 'totalInstallments', label: 'Total parcelas', type: 'text', mask: 'number' },
      ]}
    />
  );
}