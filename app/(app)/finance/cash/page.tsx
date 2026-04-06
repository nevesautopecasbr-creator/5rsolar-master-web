"use client";

import { useState, useCallback } from "react";
import { DataPage } from "@/components/data-page";
import { Modal } from "@/components/ui/modal";
import { CashMovementForm } from "@/components/finance/cash-movement-form";
import { formatAmountFromApi } from "@/lib/masks";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <DataPage
        key={refreshKey}
        title="Caixa/Bancos"
        description="Movimentações e conciliação"
        newHref="/finance/cash/new"
        newLabel="Nova movimentação"
        onNewClick={() => setModalOpen(true)}
        endpoint="/api/cash-movements"
        columns={[
          { key: "Conta", label: "Conta" },
          { key: "Direção", label: "Direção" },
          { key: "Valor", label: "Valor" },
          { key: "Data", label: "Data" },
        ]}
        mapRow={(row) => ({
          Conta: String(row.cashAccountId ?? "-"),
          Direção: String(row.direction ?? "-"),
          Valor: formatAmountFromApi(row.amount),
          Data: String(row.movementDate ?? "-"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Movimentação"
        description="Registrar movimento de caixa"
        size="md"
      >
        <CashMovementForm inline onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}