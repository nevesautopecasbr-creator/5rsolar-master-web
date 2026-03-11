"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/data-table";

type DataPageProps = {
  title: string;
  description: string;
  newHref: string;
  newLabel?: string;
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
  searchPlaceholder,
  endpoint,
  columns,
  mapRow,
}: DataPageProps) {
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);

  useEffect(() => {
    let mounted = true;
    apiFetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.items ?? [];
        setRows(list.map(mapRow));
      })
      .catch(() => setRows([]));
    return () => {
      mounted = false;
    };
  }, [endpoint, mapRow]);

  return (
    <DataTable
      title={title}
      description={description}
      newHref={newHref}
      newLabel={newLabel}
      searchPlaceholder={searchPlaceholder}
      columns={columns}
      rows={rows}
    />
  );
}
