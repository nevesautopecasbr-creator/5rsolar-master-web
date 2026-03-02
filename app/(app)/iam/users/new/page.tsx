import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Usuário"
      description="Criar usuário e definir acesso"
      endpoint="/api/users"
      onSuccessRedirect="/iam/users"
      fields={[
        { name: 'name', label: 'Nome', type: 'text', placeholder: 'Nome completo' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'email@empresa.com' },
        { name: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 6 caracteres' },
        { name: 'isActive', label: 'Usuário ativo', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}