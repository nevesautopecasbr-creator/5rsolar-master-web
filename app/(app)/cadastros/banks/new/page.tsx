import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Banco"
      description="Cadastro de bancos"
      endpoint="/api/banks"
      onSuccessRedirect="/cadastros/banks"
      fields={[
        { name: 'name', label: 'Banco', type: 'text', required: true },
        { name: 'code', label: 'Código', type: 'text', mask: 'number', placeholder: 'Apenas números' },
        { name: 'agency', label: 'Agência', type: 'text', mask: 'number' },
        { name: 'accountNumber', label: 'Conta', type: 'text', mask: 'number' },
        { name: 'accountType', label: 'Tipo de conta', type: 'text', placeholder: 'Ex: Corrente, Poupança' },
      ]}
    />
  );
}