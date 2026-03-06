"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export default function NewCustomerPage() {
  const router = useRouter();
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
    currentConsumptionKwh: "",
    consumerUnitCode: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const payload = {
      name: form.name,
      document: form.document || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zipCode: form.zipCode || undefined,
      currentConsumptionKwh: form.currentConsumptionKwh ? Number(form.currentConsumptionKwh.replace(",", ".")) : undefined,
      consumerUnitCode: form.consumerUnitCode || undefined,
    };

    const response = await apiFetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Falha ao salvar. Verifique os dados e tente novamente.");
      return;
    }

    setStatus("Cliente salvo com sucesso.");
    router.push("/projects");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div>
        <h1 className="text-lg font-semibold">Novo Cliente</h1>
        <p className="text-sm text-brand-navy-600">
          Cadastre o cliente e a unidade consumidora. Após salvar, o cliente ficará disponível para a etapa de Orçamento em Projetos.
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
            <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
            <Input
              id="document"
              value={form.document}
              onChange={(e) => setForm((p) => ({ ...p, document: e.target.value }))}
              placeholder="CPF ou CNPJ"
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
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
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
              onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))}
              placeholder="00000-000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium">Dados da Unidade Consumidora</h2>
          <p className="text-sm text-brand-navy-600">Informações técnicas para orçamento (concessionária)</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="consumerUnitCode">Unidade Consumidora (UC)</Label>
            <Input
              id="consumerUnitCode"
              value={form.consumerUnitCode}
              onChange={(e) => setForm((p) => ({ ...p, consumerUnitCode: e.target.value }))}
              placeholder="Código UC na concessionária"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="currentConsumptionKwh">Consumo atual (kWh)</Label>
            <Input
              id="currentConsumptionKwh"
              type="text"
              inputMode="decimal"
              value={form.currentConsumptionKwh}
              onChange={(e) => setForm((p) => ({ ...p, currentConsumptionKwh: e.target.value }))}
              placeholder="Ex: 500"
            />
          </div>
        </CardContent>
      </Card>

      {status && (
        <p className={`text-sm ${status.startsWith("Falha") ? "text-red-600" : "text-brand-navy-600"}`}>
          {status}
        </p>
      )}
      <Button type="submit">Salvar e ir para Projetos (Orçamento)</Button>
    </form>
  );
}
