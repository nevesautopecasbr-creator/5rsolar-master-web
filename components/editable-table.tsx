"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskMoney, maskMoneyFromNumber, parseMoney } from "@/lib/masks";

export type EditableTableColumn<Row> = {
  key: keyof Row | string;
  label: string;
  type?: "text" | "number" | "money" | "select" | "readonly";
  options?: Array<{ label: string; value: string }>;
  align?: "left" | "center" | "right";
  render?: (row: Row, index: number) => ReactNode;
  formatOnBlur?: (value: string) => string;
};

type EditableTableProps<Row> = {
  columns: Array<EditableTableColumn<Row>>;
  rows: Row[];
  onChange: (rows: Row[]) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  addLabel?: string;
};

export function EditableTable<Row>({
  columns,
  rows,
  onChange,
  onAddRow,
  onRemoveRow,
  addLabel = "Adicionar",
}: EditableTableProps<Row>) {
  function setValue(index: number, key: keyof Row | string, value: string) {
    const updated = rows.map((row, rowIndex) =>
      rowIndex === index ? ({ ...row, [key]: value } as Row) : row,
    );
    onChange(updated);
  }

  const alignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-navy-200 bg-brand-navy-50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-3 py-2 font-semibold ${alignClass(column.align)}`}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-6 text-center text-brand-navy-500"
                >
                  Nenhum registro.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="border-b border-brand-navy-100">
                  {columns.map((column) => {
                    const value = (row as Record<string, unknown>)[String(column.key)];
                    if (column.render) {
                      return (
                        <td key={String(column.key)} className="px-3 py-2">
                          {column.render(row, index)}
                        </td>
                      );
                    }
                    if (column.type === "readonly") {
                      return (
                        <td
                          key={String(column.key)}
                          className={`px-3 py-2 ${alignClass(column.align)}`}
                        >
                          {String(value ?? "")}
                        </td>
                      );
                    }
                    if (column.type === "select") {
                      return (
                        <td key={String(column.key)} className="px-3 py-2">
                          <select
                            className="h-9 w-full rounded-md border border-brand-navy-300 bg-white px-2 text-sm"
                            value={String(value ?? "")}
                            onChange={(event) =>
                              setValue(index, column.key, event.target.value)
                            }
                          >
                            {column.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    }
                    if (column.type === "money") {
                      const displayValue =
                        typeof value === "number"
                          ? maskMoneyFromNumber(value)
                          : value != null && value !== ""
                            ? maskMoneyFromNumber(Number(value))
                            : "";
                      return (
                        <td key={String(column.key)} className="px-3 py-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={displayValue}
                            className={`h-9 max-w-[140px] ${alignClass(column.align)}`}
                            onChange={(event) => {
                              const masked = maskMoney(event.target.value);
                              const num = parseMoney(masked);
                              setValue(index, column.key, String(num));
                            }}
                          />
                        </td>
                      );
                    }
                    const isNumber = column.type === "number";
                    const rawVal = String(value ?? "");
                    return (
                      <td key={String(column.key)} className="px-3 py-2">
                        <Input
                          type="text"
                          inputMode={isNumber ? "numeric" : undefined}
                          value={rawVal}
                          className={`h-9 max-w-[120px] ${alignClass(column.align)}`}
                          onChange={(event) => {
                            const v = event.target.value;
                            const next = isNumber ? v.replace(/\D/g, "") : v;
                            setValue(index, column.key, next);
                          }}
                          onBlur={(event) => {
                            if (!column.formatOnBlur) return;
                            const formatted = column.formatOnBlur(event.target.value);
                            setValue(index, column.key, formatted);
                          }}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onRemoveRow(index)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>
        <Button type="button" onClick={onAddRow}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
