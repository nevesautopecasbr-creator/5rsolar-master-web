import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Garantia"
      description="Registrar garantia"
      endpoint="/api/warranties"
      onSuccessRedirect="/after-sales/warranties"
      fields={[
        { name: 'customerId', label: 'Cliente', type: 'text', placeholder: 'ID do cliente' },
        { name: 'projectId', label: 'Projeto', type: 'text', placeholder: 'ID do projeto' },
        { name: 'startDate', label: 'Início', type: 'date' },
        { name: 'endDate', label: 'Fim', type: 'date' },
        { name: 'terms', label: 'Termos', type: 'text' },
      ]}
    />
  );
}