"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { useMenu } from "@/components/app-shell";

export function Sidebar() {
  const { menuOpen } = useMenu();
  const pathname = usePathname();
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
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-6 text-lg font-semibold">ERP Energia Solar</div>
      <nav className="space-y-6 overflow-y-auto pr-2 text-sm">
        {navSections.map((section) => (
          <div key={section.title}>
            <button
              type="button"
              onClick={() =>
                setSectionOpen((prev) => ({
                  ...prev,
                  [section.title]: !prev[section.title],
                }))
              }
              className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              <span>{section.title}</span>
              <span>{sectionOpen[section.title] ? "▾" : "▸"}</span>
            </button>
            {sectionOpen[section.title] ? (
              <div className="flex flex-col gap-2">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-md px-2 py-1 ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-100"
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
