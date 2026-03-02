import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Relatório"
      description="Parâmetros de relatório"
      endpoint="/api/finance/reports/cashflow"
      method="GET"
      onSuccessRedirect="/finance/reports"
      fields={[
        { name: "start", label: "Data inicial", type: "date" },
        { name: "end", label: "Data final", type: "date" },
        { name: "projectId", label: "Projeto", type: "text" },
      ]}
    />
  );
}