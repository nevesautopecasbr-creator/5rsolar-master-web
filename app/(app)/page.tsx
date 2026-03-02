"use client";

import { Button } from "@/components/ui/button";
import { useMenu } from "@/components/app-shell";

export default function WelcomePage() {
  const { menuOpen, setMenuOpen } = useMenu();

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-lg font-semibold">Bem-vindo ao ERP Energia Solar</h1>
      <p className="text-sm text-slate-600">
        Selecione uma opção no menu principal para começar.
      </p>
      <Button type="button" onClick={() => setMenuOpen(true)} disabled={menuOpen}>
        {menuOpen ? "Menu principal aberto" : "Abrir menu principal"}
      </Button>
    </div>
  );
}
