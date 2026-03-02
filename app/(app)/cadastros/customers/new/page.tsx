import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Cliente"
      description="Cadastro de cliente"
      endpoint="/api/customers"
      onSuccessRedirect="/cadastros/customers"
      fields={[
        { name: 'name', label: 'Nome', type: 'text' },
        { name: 'document', label: 'Documento', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Telefone', type: 'text' },
        { name: 'address', label: 'Endereço', type: 'text' },
        { name: 'city', label: 'Cidade', type: 'text' },
        { name: 'state', label: 'UF', type: 'text' },
        { name: 'zipCode', label: 'CEP', type: 'text' },
      ]}
    />
  );
}