"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskCpfCnpj, maskPhone, maskCep } from "@/lib/masks";
import {
  fetchEstados,
  fetchMunicipiosByEstadoId,
  getEstadoIdBySigla,
  type Estado,
  type Municipio,
} from "@/lib/br-locations";

type ConsumerUnit = { consumerUnitCode: string; currentConsumptionKwh: string };

export default function NewCustomerPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
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

  function addConsumerUnit() {
    setConsumerUnits((prev) => [...prev, { consumerUnitCode: "", currentConsumptionKwh: "" }]);
  }

  function removeConsumerUnit(idx: number) {
    setConsumerUnits((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function updateConsumerUnit(idx: number, field: keyof ConsumerUnit, value: string) {
    setConsumerUnits((prev) =>
      prev.map((uc, i) => (i === idx ? { ...uc, [field]: value } : uc))
    );
  }

  useEffect(() => {
    let mounted = true;
    fetchEstados()
      .then((list) => {
        if (mounted) setEstados(list);
      })
      .finally(() => {
        if (mounted) setLoadingLocations(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.state.trim()) {
      setMunicipios([]);
      return;
    }
    const estadoId = getEstadoIdBySigla(estados, form.state);
    if (estadoId == null) {
      setMunicipios([]);
      return;
    }
    let mounted = true;
    fetchMunicipiosByEstadoId(estadoId).then((list) => {
      if (mounted) setMunicipios(list);
    });
    return () => {
      mounted = false;
    };
  }, [form.state, estados]);

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

    const response = await apiFetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg =
        err?.message ||
        (Array.isArray(err?.message) ? err.message.join(", ") : null) ||
        response.statusText;
      setStatus(`Falha ao salvar: ${msg}`);
      return;
    }

    setStatus("Cliente salvo com sucesso.");
    router.push("/cadastros/customers");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div>
        <h1 className="text-lg font-semibold">Novo Cliente</h1>
        <p className="text-sm text-brand-navy-600">
          Cadastre o cliente e as unidades consumidoras. CPF e telefone são obrigatórios.
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
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="email@exemplo.com"
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
            <Label htmlFor="state">Estado</Label>
            <select
              id="state"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.state}
              onChange={(e) =>
                setForm((p) => ({ ...p, state: e.target.value, city: "" }))
              }
              disabled={loadingLocations}
            >
              <option value="">Selecione o estado</option>
              {estados.map((e) => (
                <option key={e.id} value={e.sigla}>
                  {e.nome} ({e.sigla})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Cidade</Label>
            <select
              id="city"
              className="flex h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              disabled={!form.state || municipios.length === 0}
            >
              <option value="">Selecione a cidade</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
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
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium">Unidades Consumidoras</h2>
            <p className="text-sm text-brand-navy-600">
              O cliente pode ter mais de uma unidade. Adicione pelo menos uma.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addConsumerUnit}>
            + Adicionar UC
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
                    updateConsumerUnit(idx, "consumerUnitCode", e.target.value)
                  }
                  placeholder="Código na concessionária"
                />
              </div>
              <div className="grid flex-1 min-w-[120px] gap-2">
                <Label>Consumo (kWh)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={uc.currentConsumptionKwh}
                  onChange={(e) =>
                    updateConsumerUnit(idx, "currentConsumptionKwh", e.target.value)
                  }
                  placeholder="Ex: 500"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeConsumerUnit(idx)}
                disabled={consumerUnits.length === 1}
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
