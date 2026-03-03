"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AppShell, useMenu } from "@/components/app-shell";

function LayoutContent({ children }: { children: ReactNode }) {
  const { menuOpen, setMenuOpen } = useMenu();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      {/* Overlay em mobile quando menu aberto */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-brand-navy-900/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
        />
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-brand-navy-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <LayoutContent>{children}</LayoutContent>
    </AppShell>
  );
}
