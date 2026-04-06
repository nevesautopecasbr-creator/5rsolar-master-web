"use client";

import { Modal } from "@/components/ui/modal";
import { NewAccountForm, type NewAccountKind } from "@/components/finance/new-account-form";

type NewAccountModalProps = {
  open: boolean;
  onClose: () => void;
  initialKind: NewAccountKind;
  /** Muda quando reabre o modal para outro tipo (força sincronizar abas) */
  openNonce?: number;
  onSuccess: (payload: { kind: NewAccountKind; id: string }) => void;
};

export function NewAccountModal({
  open,
  onClose,
  initialKind,
  openNonce = 0,
  onSuccess,
}: NewAccountModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova conta"
      description="Cadastre uma conta caixa/banco ou uma conta do plano contábil para usar nas movimentações."
      size="md"
    >
      <NewAccountForm
        initialKind={initialKind}
        kindKey={openNonce}
        onSubmitted={(payload) => {
          onSuccess(payload);
        }}
        onCancel={onClose}
        showCancel
        submitLabel="Salvar conta"
      />
    </Modal>
  );
}
