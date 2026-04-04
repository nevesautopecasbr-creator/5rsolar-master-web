"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/data-table";

type DataPageProps = {
  title: string;
  description: string;
  newHref: string;
  newLabel?: string;
  /** Se definido, o botão "Novo" abre modal em vez de navegar (chama esta função) */
  onNewClick?: () => void;
  searchPlaceholder?: string;
  endpoint: string;
  columns: Array<{ key: string; label: string }>;
  mapRow: (row: Record<string, unknown>) => Record<string, string>;
};

export function DataPage({
  title,
  description,
  newHref,
  newLabel,
  onNewClick,
  searchPlaceholder,
  endpoint,
  columns,
  mapRow,
}: DataPageProps) {
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoadError(null);
    apiFetch(endpoint)
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          const msg =
            typeof (err as { message?: unknown }).message === "string"
              ? (err as { message: string }).message
              : response.statusText;
          throw new Error(msg || `HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.items ?? [];
        setRows(list.map(mapRow));
      })
      .catch((e) => {
        if (!mounted) return;
        setRows([]);
        setLoadError(e instanceof Error ? e.message : "Falha ao carregar dados.");
      });
    return () => {
      mounted = false;
    };
  }, [endpoint, mapRow]);

  return (
    <>
      {loadError ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}
      <DataTable
      title={title}
      description={description}
      newHref={newHref}
      newLabel={newLabel}
      onNewClick={onNewClick}
      searchPlaceholder={searchPlaceholder}
      columns={columns}
      rows={rows}
    />
    </>
  );
}
