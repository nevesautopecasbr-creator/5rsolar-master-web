import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Fornecedor"
      description="Cadastro de fornecedor"
      endpoint="/api/suppliers"
      onSuccessRedirect="/cadastros/suppliers"
      fields={[
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'document', label: 'CPF/CNPJ', type: 'text', mask: 'cpfCnpj', required: true },
        { name: 'email', label: 'E-mail', type: 'email' },
        { name: 'phone', label: 'Telefone', type: 'text', mask: 'phone' },
        { name: 'address', label: 'Endereço', type: 'text' },
        { name: 'city', label: 'Cidade', type: 'text' },
        { name: 'state', label: 'UF', type: 'text', placeholder: 'Ex: SP' },
        { name: 'zipCode', label: 'CEP', type: 'text', mask: 'cep' },
      ]}
    />
  );
}