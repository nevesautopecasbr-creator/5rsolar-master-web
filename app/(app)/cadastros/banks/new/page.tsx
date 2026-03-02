import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Banco"
      description="Cadastro de bancos"
      endpoint="/api/banks"
      onSuccessRedirect="/cadastros/banks"
      fields={[
        { name: 'name', label: 'Banco', type: 'text' },
        { name: 'code', label: 'Código', type: 'text' },
        { name: 'agency', label: 'Agência', type: 'text' },
        { name: 'accountNumber', label: 'Conta', type: 'text' },
        { name: 'accountType', label: 'Tipo de conta', type: 'text' },
      ]}
    />
  );
}