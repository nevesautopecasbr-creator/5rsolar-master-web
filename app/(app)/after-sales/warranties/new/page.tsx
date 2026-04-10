import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Nova Garantia"
      description="Registrar garantia"
      endpoint="/api/warranties"
      onSuccessRedirect="/after-sales/warranties"
      fields={[
        {
          name: "customerId",
          label: "Cliente",
          type: "select",
          optionsUrl: "/api/customers",
          optionValueKey: "id",
          optionLabelKey: "name",
        },
        {
          name: "projectId",
          label: "Projeto",
          type: "select",
          optionsUrl: "/api/projects",
          optionValueKey: "id",
          optionLabelKey: "name",
        },
        { name: "startDate", label: "Início", type: "date", required: true },
        { name: "endDate", label: "Fim", type: "date", required: true },
        { name: "terms", label: "Termos", type: "text" },
      ]}
    />
  );
}
