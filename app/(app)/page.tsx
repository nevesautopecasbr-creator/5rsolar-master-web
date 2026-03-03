"use client";

import { Button } from "@/components/ui/button";
import { useMenu } from "@/components/app-shell";
import { IconSolarRays } from "@/components/icons/solar-icons";

export default function WelcomePage() {
  const { menuOpen, setMenuOpen } = useMenu();

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-brand-orange/10 p-4">
        <IconSolarRays className="h-12 w-12 text-brand-orange" />
      </div>
      <div className="space-y-2">
        <h1 className="text-display-md text-brand-navy-900">
          Bem-vindo ao 5R Energia Solar
        </h1>
        <p className="text-brand-navy-600 max-w-md">
          Selecione uma opção no menu principal para começar a gerenciar seus projetos e operações.
        </p>
      </div>
      <Button
        type="button"
        onClick={() => setMenuOpen(true)}
        disabled={menuOpen}
        className="gap-2"
      >
        <IconSolarRays className="h-4 w-4" />
        {menuOpen ? "Menu principal aberto" : "Abrir menu principal"}
      </Button>
    </div>
  );
}
