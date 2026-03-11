"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconSolarRays } from "@/components/icons/solar-icons";
import { apiFetch } from "@/lib/api";
import { clearSessionCookie } from "@/lib/session";
import { useMenu } from "@/components/app-shell";
import { IconMenu, IconLogout, IconSearch, IconBell, IconHelp } from "@/components/icons/solar-icons";

export function Topbar() {
  const router = useRouter();
  const { menuOpen, setMenuOpen } = useMenu();
  const [searchOpen, setSearchOpen] = useState(false);

  async function handleLogout() {
    clearSessionCookie();
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-brand-navy-100 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-brand-navy-600 hover:bg-brand-navy-50 hover:text-brand-navy-800 lg:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <IconMenu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-white">
            <IconSolarRays className="h-5 w-5" />
          </span>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-brand-navy-800">5R Energia Solar</span>
            <span className="ml-1.5 text-sm text-brand-navy-500">| ERP</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          type="button"
          className="h-9 w-9 p-0 text-brand-navy-500 hover:bg-brand-navy-50 hover:text-brand-navy-700"
          aria-label="Pesquisar"
          onClick={() => setSearchOpen((o) => !o)}
        >
          <IconSearch className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          type="button"
          className="relative h-9 w-9 p-0 text-brand-navy-500 hover:bg-brand-navy-50 hover:text-brand-navy-700"
          aria-label="Notificações"
        >
          <IconBell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          type="button"
          className="hidden h-9 w-9 p-0 text-brand-navy-500 hover:bg-brand-navy-50 hover:text-brand-navy-700 md:flex"
          aria-label="Ajuda"
        >
          <IconHelp className="h-5 w-5" />
        </Button>
        <div className="ml-1 h-8 w-px bg-brand-navy-200" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-sm font-semibold text-white">
          U
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={handleLogout}
          className="ml-2 hidden gap-2 md:inline-flex"
        >
          <IconLogout className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
