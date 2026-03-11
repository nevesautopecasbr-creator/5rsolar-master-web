"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { useMenu } from "@/components/app-shell";
import { COMPANY_NAME_KEY, COMPANY_CONTEXT_UPDATED } from "@/lib/session";
import {
  IconChevronDown,
  IconChevronRight,
  IconSolarRays,
  IconHome,
  IconDocument,
  IconChart,
  IconDollar,
  IconTarget,
  IconUsers,
} from "@/components/icons/solar-icons";

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Geral: IconHome,
  "Cadastros e Acesso": IconUsers,
  Operações: IconDocument,
  "Financeiro e Precificação": IconDollar,
  "Pós-venda": IconTarget,
};

export function Sidebar() {
  const { menuOpen } = useMenu();
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setCompanyName(localStorage.getItem(COMPANY_NAME_KEY));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(COMPANY_CONTEXT_UPDATED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(COMPANY_CONTEXT_UPDATED, sync);
    };
  }, []);

  const initialState = useMemo(
    () =>
      Object.fromEntries(navSections.map((section) => [section.title, true])),
    [],
  );
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>(initialState);

  if (!menuOpen) {
    return null;
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col bg-brand-navy-800 shadow-xl lg:relative lg:z-auto lg:w-64 lg:flex-shrink-0 xl:w-72"
      aria-label="Menu principal"
    >
      {/* Barra superior laranja 5R com logo */}
      <div className="flex shrink-0 items-center gap-2 bg-brand-orange px-5 py-4">
        <IconSolarRays className="h-8 w-8 text-white" />
        <span className="text-lg font-bold uppercase tracking-tight text-white">
          5R
        </span>
      </div>

      {/* Nome da empresa (opcional) */}
      {companyName ? (
        <div className="border-b border-brand-navy-600/60 px-4 py-2.5">
          <p className="truncate text-xs font-medium text-brand-navy-200" title={companyName}>
            {companyName}
          </p>
        </div>
      ) : null}

      {/* Navegação hierárquica */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 text-sm">
        {navSections.map((section) => {
          const SectionIcon = sectionIcons[section.title] ?? IconChart;
          return (
            <div key={section.title} className="space-y-0.5">
              <button
                type="button"
                onClick={() =>
                  setSectionOpen((prev) => ({
                    ...prev,
                    [section.title]: !prev[section.title],
                  }))
                }
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-brand-navy-200 transition-colors hover:bg-brand-navy-700/80 hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <SectionIcon className="h-4 w-4 text-brand-navy-400" />
                  <span className="font-medium">{section.title}</span>
                </span>
                <span className="text-brand-navy-500">
                  {sectionOpen[section.title] ? (
                    <IconChevronDown className="h-4 w-4" />
                  ) : (
                    <IconChevronRight className="h-4 w-4" />
                  )}
                </span>
              </button>
              {sectionOpen[section.title] ? (
                <div className="flex flex-col gap-0.5 pl-2">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 font-medium transition-colors ${
                          isActive
                            ? "border-brand-orange bg-brand-navy-700/90 text-white"
                            : "border-transparent text-brand-navy-300 hover:bg-brand-navy-700/60 hover:text-brand-navy-100"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
