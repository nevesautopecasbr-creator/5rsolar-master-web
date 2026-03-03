"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type DataTableProps = {
  title: string;
  description: string;
  newHref: string;
  newLabel?: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string>>;
};

export function DataTable({
  title,
  description,
  newHref,
  newLabel = "Novo",
  columns,
  rows,
}: DataTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (aVal === bVal) return 0;
      const result = aVal > bVal ? 1 : -1;
      return sortDir === "asc" ? result : -result;
    });
  }, [rows, sortKey, sortDir]);

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
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-md text-brand-navy-900">{title}</h1>
          <p className="text-sm text-brand-navy-600">{description}</p>
        </div>
        <Link href={newHref} className="flex-shrink-0">
          <Button type="button">{newLabel}</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-brand-navy-600">
          <span>Total: <strong className="text-brand-navy-800">{rows.length}</strong></span>
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
                        return (
                          <td key={col.key} className="px-3 py-2.5">
                            <Link
                              className="font-medium text-brand-orange hover:underline"
                              href={value}
                            >
                              Acessar
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
  );
}
