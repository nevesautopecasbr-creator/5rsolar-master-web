import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Conta a Pagar"
      description="Registrar pagamento"
      endpoint="/api/payables"
      onSuccessRedirect="/finance/payables"
      fields={[
        { name: 'description', label: 'Descrição', type: 'text', required: true },
        { name: 'amount', label: 'Valor (R$)', type: 'text', mask: 'money', required: true },
        { name: 'dueDate', label: 'Vencimento', type: 'date', required: true },
        { name: 'projectId', label: 'Projeto', type: 'select', optionsUrl: '/api/projects', optionValueKey: 'id', optionLabelKey: 'name' },
        { name: 'supplierId', label: 'Fornecedor', type: 'select', optionsUrl: '/api/suppliers', optionValueKey: 'id', optionLabelKey: 'name' },
        { name: 'purchaseOrderId', label: 'Pedido', type: 'text', placeholder: 'ID do pedido' },
        { name: 'accountId', label: 'Conta contábil', type: 'select', optionsUrl: '/api/chart-accounts', optionValueKey: 'id', optionLabelKey: 'name' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'EM_ABERTO',
          options: [
            { value: 'EM_ABERTO', label: 'Em aberto' },
            { value: 'PAGO', label: 'Pago' },
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
        { name: 'paidAt', label: 'Pagamento em', type: 'date' },
        { name: 'isDirectCost', label: 'Custo direto', type: 'checkbox' },
        {
          name: 'type',
          label: 'Tipo',
          type: 'select',
          options: [
            { value: 'MATERIAL', label: 'Material' },
            { value: 'SERVICE', label: 'Serviço' },
            { value: 'LABOR', label: 'Mão de obra' },
            { value: 'OTHER', label: 'Outro' },
          ],
        },
        { name: 'recurrenceRule', label: 'Recorrência', type: 'text' },
        { name: 'nextDueDate', label: 'Próximo vencimento', type: 'date' },
      ]}
    />
  );
}