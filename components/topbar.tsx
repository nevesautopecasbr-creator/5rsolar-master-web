"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useMenu } from "@/components/app-shell";

export function Topbar() {
  const router = useRouter();
  const { menuOpen, setMenuOpen } = useMenu();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </Button>
        <button
          type="button"
          className="text-sm text-slate-600 hover:text-slate-900"
          onClick={() => router.push("/")}
        >
          Bem-vindo ao ERP
        </button>
      </div>
      <Button variant="outline" type="button" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  );
}
