import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Solicitação"
      description="Solicitar itens"
      endpoint="/api/purchase-requests"
      onSuccessRedirect="/purchases/requests"
      fields={[
        { name: 'title', label: 'Título', type: 'text', required: true },
        {
          name: 'projectId',
          label: 'Projeto',
          type: 'select',
          optionsUrl: '/api/projects',
          optionValueKey: 'id',
          optionLabelKey: 'name',
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
        { name: 'notes', label: 'Observações', type: 'text' },
      ]}
    />
  );
}