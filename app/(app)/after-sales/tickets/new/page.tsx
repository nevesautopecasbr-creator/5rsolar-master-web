import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Ticket"
      description="Abrir chamado"
      endpoint="/api/tickets"
      onSuccessRedirect="/after-sales/tickets"
      fields={[
        { name: 'subject', label: 'Assunto', type: 'text' },
        { name: 'description', label: 'Descrição', type: 'text' },
        { name: 'customerId', label: 'Cliente', type: 'text', placeholder: 'ID do cliente' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'assignedToId', label: 'Responsável', type: 'text', placeholder: 'ID do usuário' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'OPEN, IN_PROGRESS...' },
        { name: 'priority', label: 'Prioridade', type: 'text', placeholder: 'LOW, MEDIUM, HIGH' },
      ]}
    />
  );
}