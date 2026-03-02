import { DynamicForm } from "@/components/dynamic-form";

export default function Page() {
  return (
    <DynamicForm
      title="Novo Perfil"
      description="Criar role e permissões"
      endpoint="/api/roles"
      onSuccessRedirect="/iam/roles"
      fields={[
        { name: 'name', label: 'Nome', type: 'text', placeholder: 'Ex: Administrador' },
        { name: 'description', label: 'Descrição', type: 'text', placeholder: 'Resumo do perfil' },
        { name: 'isActive', label: 'Perfil ativo', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}