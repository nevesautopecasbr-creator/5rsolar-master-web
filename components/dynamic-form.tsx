"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleForm } from "@/components/module-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import {
  maskCpfCnpj,
  maskPhone,
  maskCep,
  maskMoney,
  maskOnlyNumbers,
  parseMoney,
  unmaskDocument,
  unmaskPhone,
} from "@/lib/masks";

export type FormFieldMask = "cpfCnpj" | "phone" | "cep" | "money" | "number" | "decimal";

export type FormField = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | boolean;
  /** Campo obrigatório para validação e habilitação do botão Salvar */
  required?: boolean;
  /** Máscara: cpfCnpj, phone, cep, money, number (apenas dígitos), decimal */
  mask?: FormFieldMask;
  /** Para type "select": URL para buscar opções (ex: /api/roles) */
  optionsUrl?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  /** Para type "select": opções estáticas (quando não vier da API) */
  options?: Array<{ value: string; label: string }>;
};

type DynamicFormProps = {
  title: string;
  description: string;
  endpoint: string;
  method?: "POST" | "GET";
  fields: FormField[];
  onSuccessRedirect?: string;
  /** Chamado após salvar com sucesso (ex: fechar modal e atualizar lista) */
  onSuccess?: () => void;
  /** Se true, não renderiza ModuleForm (útil dentro de Modal) */
  inline?: boolean;
};

type ProductOption = {
  id: string;
  name?: string | null;
  price?: number | string | null;
  isActive?: boolean | null;
};

type ProductSelection = {
  productId: string;
  name: string;
  price: number | null;
};

function applyMask(value: string, mask?: FormFieldMask): string {
  if (!mask) return value;
  switch (mask) {
    case "cpfCnpj":
      return maskCpfCnpj(value);
    case "phone":
      return maskPhone(value);
    case "cep":
      return maskCep(value);
    case "money":
      return maskMoney(value);
    case "number":
      return maskOnlyNumbers(value);
    case "decimal": {
      const allowed = value.replace(/[^\d.,]/g, "");
      const parts = allowed.split(/[.,]/);
      if (parts.length <= 1) return allowed;
      return parts[0] + "." + parts.slice(1).join("");
    }
    default:
      return value;
  }
}

function getPayloadValue(name: string, value: string | boolean | ProductSelection[], field: FormField): unknown {
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "products") return value;
  const str = String(value ?? "").trim();
  if (field.mask === "cpfCnpj") return unmaskDocument(str) || undefined;
  if (field.mask === "phone") return unmaskPhone(str) || undefined;
  if (field.mask === "cep") return str.replace(/\D/g, "") || undefined;
  if (field.mask === "number") {
    const num = str.replace(/\D/g, "");
    return num ? Number(num) : undefined;
  }
  if (field.mask === "decimal") {
    const n = Number(str.replace(",", "."));
    return Number.isNaN(n) ? undefined : n;
  }
  if (field.mask === "money" || field.name === "amount" || field.name === "value" || field.name === "totalValue") return str ? parseMoney(str) : undefined;
  return str || undefined;
}

export function DynamicForm({
  title,
  description,
  endpoint,
  method = "POST",
  fields,
  onSuccessRedirect,
  onSuccess,
  inline = false,
}: DynamicFormProps) {
  const initial = fields.reduce<Record<string, string | boolean | ProductSelection[]>>(
    (acc, field) => {
    if (field.defaultValue !== undefined) {
      acc[field.name] = field.defaultValue;
      return acc;
    }
    if (field.type === "checkbox") {
      acc[field.name] = false;
      return acc;
    }
    if (field.type === "products") {
      acc[field.name] = [];
      return acc;
    }
    acc[field.name] = "";
    return acc;
  }, {});

  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectOptions, setSelectOptions] = useState<
    Record<string, Array<{ value: string; label: string }>>
  >({});
  const [selectLoading, setSelectLoading] = useState<Record<string, boolean>>({});

  const hasProductsField = useMemo(
    () => fields.some((field) => field.type === "products"),
    [fields],
  );

  const requiredFields = useMemo(() => fields.filter((f) => f.required), [fields]);

  const allRequiredFilled = useMemo(() => {
    return requiredFields.every((field) => {
      const val = form[field.name];
      if (field.type === "checkbox") return true;
      if (field.type === "products") return Array.isArray(val) && val.length > 0;
      const str = String(val ?? "").trim();
      if (str === "") return false;
      // Campo monetário: considerar preenchido se tiver ao menos um dígito
      if (field.mask === "money" || field.name === "amount" || field.name === "value" || field.name === "totalValue") {
        return str.replace(/\D/g, "").length > 0;
      }
      // Campo data: considerar preenchido se tiver formato de data (ex: YYYY-MM-DD = 10 chars)
      if (field.type === "date") {
        return str.length >= 8;
      }
      return true;
    });
  }, [form, requiredFields]);

  const selectFields = useMemo(
    () => fields.filter((f) => f.type === "select" && f.optionsUrl),
    [fields],
  );

  useEffect(() => {
    if (selectFields.length === 0) return;
    let isActive = true;
    for (const field of selectFields) {
      if (!field.optionsUrl) continue;
      setSelectLoading((prev) => ({ ...prev, [field.name]: true }));
      apiFetch(field.optionsUrl)
        .then((r) => r.json())
        .then((data: Array<Record<string, unknown>>) => {
          if (!isActive) return;
          const valKey = field.optionValueKey ?? "id";
          const labelKey = field.optionLabelKey ?? "name";
          const options = (Array.isArray(data) ? data : []).map((item) => ({
            value: String(item[valKey] ?? ""),
            label: String(item[labelKey] ?? item[valKey] ?? "-"),
          }));
          setSelectOptions((prev) => ({ ...prev, [field.name]: options }));
        })
        .catch(() => {
          if (isActive) setSelectOptions((prev) => ({ ...prev, [field.name]: [] }));
        })
        .finally(() => {
          if (isActive) setSelectLoading((prev) => ({ ...prev, [field.name]: false }));
        });
    }
    return () => { isActive = false; };
  }, [selectFields]);

  useEffect(() => {
    if (!hasProductsField) {
      return;
    }
    let isActive = true;
    setProductsError(null);
    setProductsLoading(true);
    apiFetch("/api/products")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Falha ao carregar produtos");
        }
        const data = (await response.json()) as ProductOption[];
        if (!Array.isArray(data)) {
          throw new Error("Resposta inválida da API de produtos");
        }
        if (isActive) {
          setProducts(data.filter((item) => item.isActive !== false));
          setProductsLoading(false);
        }
      })
      .catch((error) => {
        if (isActive) {
          setProductsError(error instanceof Error ? error.message : "Erro ao carregar produtos");
          setProductsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [hasProductsField]);

  const formatPrice = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    const numericValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : value;
    if (Number.isNaN(numericValue)) {
      return "-";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
  };

  async function handleSubmit() {
    setStatus(null);
    const isGet = method === "GET";
    const payload: Record<string, unknown> = isGet
      ? Object.fromEntries(
          Object.entries(form).map(([key, value]) => [key, String(value ?? "")]),
        ) as Record<string, unknown>
      : fields.reduce<Record<string, unknown>>((acc, field) => {
          const raw = (form as Record<string, string | boolean | ProductSelection[]>)[field.name];
          acc[field.name] = getPayloadValue(field.name, raw, field);
          return acc;
        }, {} as Record<string, unknown>);
    const params = isGet ? new URLSearchParams(payload as Record<string, string>) : undefined;
    const url = isGet ? `${endpoint}?${params?.toString()}` : endpoint;
    const response = await apiFetch(url, {
      method,
      ...(isGet ? {} : { body: JSON.stringify(payload) }),
    });
    if (!response.ok) {
      // Exibe detalhes de validação/erro retornados pela API (NestJS costuma retornar { message, statusCode, error })
      let msg: string | null = null;
      try {
        const err = await response.json();
        const rawMessage = (err as any)?.message;
        if (Array.isArray(rawMessage)) {
          msg = rawMessage.join(" • ");
        } else if (typeof rawMessage === "string") {
          msg = rawMessage;
        } else if (typeof (err as any)?.error === "string") {
          msg = (err as any).error;
        } else {
          msg = null;
        }
      } catch {
        // Body não é JSON
      }

      const fallback = response.statusText || `HTTP ${response.status}`;
      setStatus(`Falha ao salvar: ${msg ?? fallback}`);
      return;
    }
    setStatus("Salvo com sucesso");
    onSuccess?.();
    if (onSuccessRedirect) {
      window.location.href = onSuccessRedirect;
    }
  }

  const content = (
    <div className={inline ? "space-y-4" : "grid gap-6"}>
      {fields.map((field) => (
        <div key={field.name} className="grid gap-2">
          {field.type === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm text-brand-navy-700">
              <Input
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(form[field.name])}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    [field.name]: event.target.checked,
                  }))
                }
              />
              {field.label}
            </label>
          ) : (
            <>
              <Label>{field.label}</Label>
              {field.type === "products" ? (
                <div className="grid gap-2 rounded-md border border-brand-navy-200 p-3">
                  {productsError ? (
                    <div className="text-sm text-red-600">{productsError}</div>
                  ) : null}
                  {productsLoading ? (
                    <div className="text-sm text-brand-navy-600">Carregando produtos...</div>
                  ) : null}
                  {!productsError && !productsLoading && products.length === 0 ? (
                    <div className="text-sm text-brand-navy-600">
                      Nenhum produto disponível.
                    </div>
                  ) : null}
                  {products.map((product) => {
                    const selections = Array.isArray(form[field.name])
                      ? (form[field.name] as ProductSelection[])
                      : [];
                    const isChecked = selections.some(
                      (item) => item.productId === product.id,
                    );
                    const parsedPrice =
                      typeof product.price === "string"
                        ? Number(product.price.replace(",", "."))
                        : product.price ?? null;
                    const safePrice = Number.isNaN(parsedPrice) ? null : parsedPrice;
                    return (
                      <label
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-brand-navy-100 px-3 py-2 text-sm text-brand-navy-700"
                      >
                        <span className="flex items-center gap-2">
                          <Input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={isChecked}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setForm((prev) => {
                                const previousSelections = Array.isArray(prev[field.name])
                                  ? (prev[field.name] as ProductSelection[])
                                  : [];
                                if (!checked) {
                                  return {
                                    ...prev,
                                    [field.name]: previousSelections.filter(
                                      (item) => item.productId !== product.id,
                                    ),
                                  };
                                }
                                if (
                                  previousSelections.some(
                                    (item) => item.productId === product.id,
                                  )
                                ) {
                                  return prev;
                                }
                                return {
                                  ...prev,
                                  [field.name]: [
                                    ...previousSelections,
                                    {
                                      productId: product.id,
                                      name: product.name ?? "Produto",
                                      price: safePrice,
                                    },
                                  ],
                                };
                              });
                            }}
                          />
                          <span>{product.name ?? "Produto"}</span>
                        </span>
                        <span className="text-brand-navy-500">{formatPrice(parsedPrice)}</span>
                      </label>
                    );
                  })}
                </div>
              ) : field.type === "select" ? (
                <>
                  {field.optionsUrl && selectLoading[field.name] ? (
                    <div className="text-sm text-brand-navy-600">Carregando...</div>
                  ) : (
                    <select
                      className="flex h-9 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-1.5 text-sm text-brand-navy-800 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      value={String(form[field.name] ?? "")}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {((field.optionsUrl ? (selectOptions[field.name] ?? []) : (field.options ?? []))).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              ) : (
                <Input
                  type={field.mask === "money" || field.type === "number" ? "text" : (field.type ?? "text")}
                  inputMode={field.mask === "money" || field.mask === "number" ? "numeric" : undefined}
                  placeholder={field.placeholder ?? field.label}
                  value={String(form[field.name] ?? "")}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const next = field.mask ? applyMask(raw, field.mask) : raw;
                    setForm((prev) => ({ ...prev, [field.name]: next }));
                  }}
                  required={field.required}
                  className="max-w-md"
                />
              )}
            </>
          )}
        </div>
      ))}
      {status ? <div className="text-sm text-brand-navy-600">{status}</div> : null}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={requiredFields.length > 0 && !allRequiredFilled}
      >
        Salvar
      </Button>
    </div>
  );

  return inline ? content : (
    <ModuleForm title={title} description={description}>
      {content}
    </ModuleForm>
  );
}
