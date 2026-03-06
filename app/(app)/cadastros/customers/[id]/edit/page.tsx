"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskCpfCnpj, maskPhone, maskCep } from "@/lib/masks";

type ConsumerUnit = { id?: string; consumerUnitCode: string; currentConsumptionKwh: string };

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [consumerUnits, setConsumerUnits] = useState<ConsumerUnit[]>([
    { consumerUnitCode: "", currentConsumptionKwh: "" },
  ]);

  useEffect(() => {
    let mounted = true;
    apiFetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setForm({
          name: data.name ?? "",
          document: maskCpfCnpj(data.document ?? ""),
          email: data.email ?? "",
          phone: maskPhone(data.phone ?? ""),
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zipCode: maskCep(data.zipCode ?? ""),
        });
        const ucs = data.consumerUnits ?? [];
        if (ucs.length > 0) {
          setConsumerUnits(
            ucs.map((uc: { consumerUnitCode?: string; currentConsumptionKwh?: number }) => ({
              consumerUnitCode: String(uc.consumerUnitCode ?? ""),
              currentConsumptionKwh: uc.currentConsumptionKwh != null ? String(uc.currentConsumptionKwh) : "",
            })),
          );
        } else if (data.consumerUnitCode || data.currentConsumptionKwh != null) {
          setConsumerUnits([
            {
              consumerUnitCode: String(data.consumerUnitCode ?? ""),
              currentConsumptionKwh: data.currentConsumptionKwh != null ? String(data.currentConsumptionKwh) : "",
            },
          ]);
        }
      })
      .catch(() => setStatus("Falha ao carregar cliente"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const units = consumerUnits.filter((uc) => uc.consumerUnitCode.trim());
    if (units.length === 0) {
      setStatus("Adicione pelo menos uma unidade consumidora com código UC.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      document: form.document.replace(/\D/g, ""),
      email: form.email.trim() || undefined,
      phone: form.phone.replace(/\D/g, ""),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      zipCode: form.zipCode.replace(/\D/g, "") || undefined,
      consumerUnits: units.map((uc) => ({
        consumerUnitCode: uc.consumerUnitCode.trim(),
        currentConsumptionKwh: uc.currentConsumptionKwh
          ? Number(uc.currentConsumptionKwh.replace(",", "."))
          : undefined,
      })),
    };

    const response = await apiFetch(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.message ?? response.statusText;
      setStatus(`Falha ao salvar: ${msg}`);
      return;
    }

    setStatus("Cliente atualizado com sucesso.");
    router.push("/cadastros/customers");
  }

  function addConsumerUnit() {
    setConsumerUnits((prev) => [...prev, { consumerUnitCode: "", currentConsumptionKwh: "" }]);
  }

  function removeConsumerUnit(idx: number) {
    setConsumerUnits((prev) => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return (
      <div className="text-sm text-brand-navy-600">Carregando...</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div>
        <h1 className="text-lg font-semibold">Editar Cliente</h1>
        <p className="text-sm text-brand-navy-600">
          Altere os dados do cliente e das unidades consumidoras.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium">Dados do Cliente</h2>
          <p className="text-sm text-brand-navy-600">Informações pessoais e de contato</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nome completo ou razão social"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document">CPF/CNPJ *</Label>
            <Input
              id="document"
              required
              value={form.document}
              onChange={(e) =>
                setForm((p) => ({ ...p, document: maskCpfCnpj(e.target.value) }))
              }
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: maskPhone(e.target.value) }))
              }
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Rua, número, complemento"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="Cidade"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">UF</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              placeholder="UF"
              maxLength={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={form.zipCode}
              onChange={(e) =>
                setForm((p) => ({ ...p, zipCode: maskCep(e.target.value) }))
              }
              placeholder="00000-000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-base font-medium">Unidades Consumidoras</h2>
            <p className="text-sm text-brand-navy-600">
              O cliente pode ter mais de uma unidade consumidora
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addConsumerUnit}>
            Adicionar UC
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {consumerUnits.map((uc, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-4 rounded-lg border border-brand-navy-100 p-4"
            >
              <div className="grid flex-1 min-w-[200px] gap-2">
                <Label>Código UC</Label>
                <Input
                  value={uc.consumerUnitCode}
                  onChange={(e) =>
                    setConsumerUnits((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, consumerUnitCode: e.target.value } : p,
                      ),
                    )
                  }
                  placeholder="Código UC na concessionária"
                />
              </div>
              <div className="grid flex-1 min-w-[120px] gap-2">
                <Label>Consumo (kWh)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={uc.currentConsumptionKwh}
                  onChange={(e) =>
                    setConsumerUnits((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, currentConsumptionKwh: e.target.value } : p,
                      ),
                    )
                  }
                  placeholder="Ex: 500"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeConsumerUnit(idx)}
                disabled={consumerUnits.length <= 1}
              >
                Remover
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {status && (
        <p
          className={`text-sm ${
            status.startsWith("Falha") ? "text-red-600" : "text-brand-navy-600"
          }`}
        >
          {status}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">Salvar</Button>
        <Link href="/cadastros/customers">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
