import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Solicitação"
      description="Solicitar itens"
      endpoint="/api/purchase-requests"
      onSuccessRedirect="/purchases/requests"
      fields={[
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'OPEN, APPROVED...' },
        { name: 'notes', label: 'Observações', type: 'text' },
      ]}
    />
  );
}