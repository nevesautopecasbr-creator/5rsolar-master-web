import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Ticket"
      description="Abrir chamado"
      endpoint="/api/tickets"
      onSuccessRedirect="/after-sales/tickets"
      fields={[
        { name: 'subject', label: 'Assunto', type: 'text', required: true },
        { name: 'description', label: 'Descrição', type: 'text' },
        {
          name: 'customerId',
          label: 'Cliente',
          type: 'select',
          optionsUrl: '/api/customers',
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
          name: 'assignedToId',
          label: 'Responsável',
          type: 'select',
          optionsUrl: '/api/users',
          optionValueKey: 'id',
          optionLabelKey: 'name',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'OPEN',
          options: [
            { value: 'OPEN', label: 'Aberto' },
            { value: 'IN_PROGRESS', label: 'Em andamento' },
            { value: 'RESOLVED', label: 'Resolvido' },
            { value: 'CLOSED', label: 'Fechado' },
          ],
        },
        {
          name: 'priority',
          label: 'Prioridade',
          type: 'select',
          defaultValue: 'MEDIUM',
          options: [
            { value: 'LOW', label: 'Baixa' },
            { value: 'MEDIUM', label: 'Média' },
            { value: 'HIGH', label: 'Alta' },
            { value: 'URGENT', label: 'Urgente' },
          ],
        },
      ]}
    />
  );
}