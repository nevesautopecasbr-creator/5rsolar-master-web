"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconSearch } from "@/components/icons/solar-icons";

type DataTableProps = {
  title: string;
  description: string;
  newHref: string;
  newLabel?: string;
  searchPlaceholder?: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string>>;
};

export function DataTable({
  title,
  description,
  newHref,
  newLabel = "Novo",
  searchPlaceholder,
  columns,
  rows,
}: DataTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (aVal === bVal) return 0;
      const result = aVal > bVal ? 1 : -1;
      return sortDir === "asc" ? result : -result;
    });
  }, [filteredRows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy-900 md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-brand-navy-500">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={newHref}>
            <Button type="button" className="gap-1.5">
              <span className="text-lg leading-none">+</span>
              {newLabel}
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-1.5"
          >
            Atualizar
          </Button>
        </div>
        {searchPlaceholder !== undefined && (
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-navy-400" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-brand-navy-200 bg-white pl-9 pr-3 text-sm text-brand-navy-800 placeholder:text-brand-navy-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-5">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-brand-navy-600">
          <span>Total: <strong className="text-brand-navy-800">{sortedRows.length}</strong></span>
          <label className="flex items-center gap-2">
            Itens por página
            <select
              className="rounded-lg border border-brand-navy-300 bg-white px-3 py-1.5 text-sm text-brand-navy-800 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-brand-navy-200 bg-brand-navy-50/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer px-3 py-3 text-left font-semibold text-brand-navy-700 hover:text-brand-orange transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="ml-1 text-brand-orange">{sortDir === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-8 text-center text-brand-navy-500"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-brand-navy-100 transition-colors hover:bg-brand-navy-50/50"
                  >
                    {columns.map((col) => {
                      const value = row[col.key] ?? "-";
                      if (typeof value === "string" && value.startsWith("/")) {
                        const label = value.includes("/edit") ? "Editar" : "Acessar";
                        return (
                          <td key={col.key} className="px-3 py-2.5">
                            <Link
                              className="font-medium text-brand-orange hover:underline"
                              href={value}
                            >
                              {label}
                            </Link>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-brand-navy-800">
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-brand-navy-600">
          <span>
            Página <strong className="text-brand-navy-800">{page}</strong> de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Próxima
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
