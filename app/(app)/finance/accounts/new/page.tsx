"use client";

import { useRouter } from "next/navigation";
import { ModuleForm } from "@/components/module-form";
import { NewAccountForm } from "@/components/finance/new-account-form";

export default function NewFinanceAccountPage() {
  const router = useRouter();

  return (
    <ModuleForm
      title="Nova conta"
      description="Cadastre uma conta caixa/banco ou uma conta contábil do plano de contas."
    >
      <NewAccountForm
        onSubmitted={() => {
          router.push("/finance/cash");
        }}
        submitLabel="Salvar e voltar ao caixa"
      />
    </ModuleForm>
  );
}
