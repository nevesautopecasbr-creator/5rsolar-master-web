"use client";

import { useCallback, useState } from "react";
import { DynamicForm, type FormFieldPatch } from "@/components/dynamic-form";
import { NewAccountModal } from "@/components/finance/new-account-modal";
import { CASH_MOVEMENT_FIELDS } from "@/lib/finance/cash-movement-fields";
import type { NewAccountKind } from "@/components/finance/new-account-form";

type CashMovementFormProps = {
  inline?: boolean;
  onSuccess?: () => void;
  onSuccessRedirect?: string;
};

export function CashMovementForm({ inline, onSuccess, onSuccessRedirect }: CashMovementFormProps) {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalKind, setAccountModalKind] = useState<NewAccountKind>("cash");
  const [accountModalNonce, setAccountModalNonce] = useState(0);
  const [selectOptionsRefreshKey, setSelectOptionsRefreshKey] = useState(0);
  const [fieldPatch, setFieldPatch] = useState<FormFieldPatch>({
    fieldName: "",
    value: "",
    version: 0,
  });

  const openNewAccount = useCallback((kind: NewAccountKind) => {
    setAccountModalKind(kind);
    setAccountModalNonce((n) => n + 1);
    setAccountModalOpen(true);
  }, []);

  const handleAccountCreated = useCallback(
    (payload: { kind: NewAccountKind; id: string }) => {
      setAccountModalOpen(false);
      setSelectOptionsRefreshKey((k) => k + 1);
      setFieldPatch({
        fieldName: payload.kind === "cash" ? "cashAccountId" : "accountId",
        value: payload.id,
        version: Date.now(),
      });
    },
    [],
  );

  return (
    <>
      <DynamicForm
        title={inline ? "" : "Nova Movimentação"}
        description={inline ? "" : "Registrar movimento de caixa"}
        endpoint="/api/cash-movements"
        fields={CASH_MOVEMENT_FIELDS}
        onSuccess={onSuccess}
        onSuccessRedirect={onSuccessRedirect}
        inline={inline}
        onRequestNewAccount={openNewAccount}
        selectOptionsRefreshKey={selectOptionsRefreshKey}
        fieldPatch={fieldPatch}
      />
      <NewAccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        initialKind={accountModalKind}
        openNonce={accountModalNonce}
        onSuccess={handleAccountCreated}
      />
    </>
  );
}
