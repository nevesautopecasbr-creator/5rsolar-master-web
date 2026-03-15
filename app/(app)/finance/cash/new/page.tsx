import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Movimentação"
      description="Registrar movimento de caixa"
      endpoint="/api/cash-movements"
      onSuccessRedirect="/finance/cash"
      fields={[
        { name: 'cashAccountId', label: 'Conta caixa', type: 'text', placeholder: 'ID da conta', required: true },
        { name: 'direction', label: 'Direção', type: 'text', placeholder: 'IN ou OUT', required: true },
        { name: 'amount', label: 'Valor (R$)', type: 'text', mask: 'money', required: true },
        { name: 'movementDate', label: 'Data', type: 'date', required: true },
        { name: 'description', label: 'Descrição', type: 'text' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'accountId', label: 'Conta contábil', type: 'text' },
        { name: 'payableId', label: 'Conta a pagar', type: 'text' },
        { name: 'receivableId', label: 'Conta a receber', type: 'text' },
      ]}
    />
  );
}