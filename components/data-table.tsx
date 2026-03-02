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
    if (!sortKey) {
      return rows;
    }
    return [...rows].sort((a, b) => {
      const aValue = a[sortKey] ?? "";
      const bValue = b[sortKey] ?? "";
      if (aValue === bValue) {
        return 0;
      }
      const result = aValue > bValue ? 1 : -1;
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
      <CardHeader className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <Link href={newHref}>
          <Button type="button">{newLabel}</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div>Total: {rows.length}</div>
          <label className="flex items-center gap-2">
            Itens por página
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer px-3 py-2 text-left font-semibold"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    {columns.map((col) => {
                      const value = row[col.key] ?? "-";
                      if (typeof value === "string" && value.startsWith("/")) {
                        return (
                          <td key={col.key} className="px-3 py-2">
                            <Link className="text-slate-700 underline" href={value}>
                              Acessar
                            </Link>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="px-3 py-2">
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
        <div className="mt-4 flex items-center justify-between text-sm">
          <div>
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
