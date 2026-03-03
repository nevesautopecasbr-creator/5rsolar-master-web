"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleForm } from "@/components/module-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export type FormField = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | boolean;
};

type DynamicFormProps = {
  title: string;
  description: string;
  endpoint: string;
  method?: "POST" | "GET";
  fields: FormField[];
  onSuccessRedirect?: string;
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

export function DynamicForm({
  title,
  description,
  endpoint,
  method = "POST",
  fields,
  onSuccessRedirect,
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

  const hasProductsField = useMemo(
    () => fields.some((field) => field.type === "products"),
    [fields],
  );

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
    const params = new URLSearchParams(
      Object.entries(form).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value ?? "");
        return acc;
      }, {}),
    );
    const url = isGet
      ? `${endpoint}?${params.toString()}`
      : endpoint;
    const response = await apiFetch(url, {
      method,
      ...(isGet ? {} : { body: JSON.stringify(form) }),
    });
    if (!response.ok) {
      setStatus("Falha ao salvar");
      return;
    }
    setStatus("Salvo com sucesso");
    if (onSuccessRedirect) {
      window.location.href = onSuccessRedirect;
    }
  }

  return (
    <ModuleForm title={title} description={description}>
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
              ) : (
                <Input
                  type={field.type ?? "text"}
                  placeholder={field.placeholder ?? field.label}
                  value={String(form[field.name] ?? "")}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                />
              )}
            </>
          )}
        </div>
      ))}
      {status ? <div className="text-sm text-brand-navy-600">{status}</div> : null}
      <Button type="button" onClick={handleSubmit}>
        Salvar
      </Button>
    </ModuleForm>
  );
}
