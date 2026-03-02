"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type MenuContextValue = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used within AppShell");
  }
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcome = pathname === "/" || pathname === "/dashboard";
  const [menuOpen, setMenuOpen] = useState(!isWelcome);

  useEffect(() => {
    if (isWelcome) {
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
    }
  }, [isWelcome]);

  const value = useMemo(() => ({ menuOpen, setMenuOpen }), [menuOpen]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
