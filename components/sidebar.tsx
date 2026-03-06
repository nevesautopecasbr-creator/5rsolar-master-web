"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { useMenu } from "@/components/app-shell";
import { Logo } from "@/components/logo";
import { COMPANY_NAME_KEY, COMPANY_CONTEXT_UPDATED } from "@/lib/session";
import { IconChevronDown, IconChevronRight, IconSolarRays } from "@/components/icons/solar-icons";

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
      className="fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col border-r border-brand-navy-200/80 bg-white shadow-lg lg:relative lg:z-auto lg:w-64 lg:flex-shrink-0 lg:shadow-sm xl:w-72"
      aria-label="Menu principal"
    >
      {/* Nome da empresa no topo do menu */}
      {companyName ? (
        <div className="border-b border-brand-navy-100 bg-brand-navy-50/50 px-4 py-3">
          <p className="truncate text-sm font-semibold text-brand-navy-800" title={companyName}>
            {companyName}
          </p>
        </div>
      ) : null}
      {/* Logo 5R */}
      <div className="border-b border-brand-navy-100 px-5 py-5">
        <Logo href="/" variant="compact" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <button
              type="button"
              onClick={() =>
                setSectionOpen((prev) => ({
                  ...prev,
                  [section.title]: !prev[section.title],
                }))
              }
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-navy-500 transition-colors hover:bg-brand-orange-50 hover:text-brand-navy-700"
            >
              <span className="flex items-center gap-2">
                <IconSolarRays className="h-4 w-4 text-brand-orange" />
                {section.title}
              </span>
              <span className="text-brand-navy-400">
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
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-orange/10 text-brand-orange font-semibold"
                          : "text-brand-navy-600 hover:bg-brand-navy-50 hover:text-brand-navy-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
    </aside>
  );
}
