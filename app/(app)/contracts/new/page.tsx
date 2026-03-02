import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Contrato"
      description="Configurar parcelas e condições"
      endpoint="/api/contracts"
      onSuccessRedirect="/contracts"
      fields={[
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'customerId', label: 'Cliente', type: 'text', placeholder: 'ID do cliente' },
        { name: 'templateId', label: 'Template', type: 'text', placeholder: 'ID do template' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'DRAFT, ACTIVE...' },
        { name: 'totalValue', label: 'Valor total', type: 'number' },
        { name: 'signedAt', label: 'Data assinatura', type: 'date' },
        { name: 'startDate', label: 'Data início', type: 'date' },
        { name: 'endDate', label: 'Data fim', type: 'date' },
        { name: 'installmentsCount', label: 'Qtd. parcelas', type: 'number' },
        { name: 'firstDueDate', label: '1º vencimento', type: 'date' },
        { name: 'intervalDays', label: 'Intervalo (dias)', type: 'number' },
        { name: 'receivableAccountId', label: 'Conta recebível', type: 'text' },
        { name: 'notes', label: 'Observações', type: 'text' },
      ]}
    />
  );
}