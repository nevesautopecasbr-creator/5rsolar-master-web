"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { apiFetch } from "@/lib/api";
import { useMenu } from "@/components/app-shell";
import { IconMenu, IconLogout } from "@/components/icons/solar-icons";

export function Topbar() {
  const router = useRouter();
  const { menuOpen, setMenuOpen } = useMenu();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-brand-navy-200/80 bg-white px-4 py-3 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 lg:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <IconMenu className="h-5 w-5 text-brand-navy-700" />
        </Button>
        {!menuOpen ? (
          <Logo href="/" variant="compact" className="md:ml-2" />
        ) : (
          <button
            type="button"
            className="hidden text-sm font-medium text-brand-navy-600 transition-colors hover:text-brand-orange md:block"
            onClick={() => router.push("/")}
          >
            5R Energia Solar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" type="button" onClick={handleLogout} className="gap-2">
          <IconLogout className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
