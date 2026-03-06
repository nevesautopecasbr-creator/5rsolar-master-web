"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModuleForm } from "@/components/module-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { COMPANY_CONTEXT_UPDATED } from "@/lib/session";

type Role = { id: string; name: string };

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isActive: true,
    roleId: "",
  });

  useEffect(() => {
    const sync = () => setCompanyId(typeof window !== "undefined" ? localStorage.getItem("companyId") : null);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(COMPANY_CONTEXT_UPDATED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(COMPANY_CONTEXT_UPDATED, sync);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setRolesLoading(true);
    apiFetch("/api/roles")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setRoles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setRoles([]);
      })
      .finally(() => {
        if (mounted) setRolesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStatus(null);

    if (!companyId) {
      setStatus(
        "Sua empresa não está definida no contexto. Faça logout e login novamente.",
      );
      return;
    }

    if (!form.roleId.trim()) {
      setStatus("Selecione um perfil (role) para o usuário.");
      return;
    }

    if (form.password.length < 6) {
      setStatus("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        isActive: form.isActive,
        roleId: form.roleId,
      };
      const response = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg =
          errBody?.message ||
          (Array.isArray(errBody?.message) ? errBody.message.join(", ") : null) ||
          errBody?.error ||
          response.statusText;
        setStatus(`Falha ao salvar (${response.status}): ${msg}`);
        return;
      }
      router.push("/iam/users");
    } catch (err) {
      setStatus(
        `Erro: ${err instanceof Error ? err.message : "Falha ao salvar"}`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModuleForm
      title="Novo Usuário"
      description="Criar usuário e definir acesso. O usuário será vinculado à sua empresa (definida no login)."
    >
      {!companyId && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Atenção:</strong> Sua empresa não está definida. Faça logout e login novamente para carregar o contexto da empresa.
        </div>
      )}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nome completo"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@empresa.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
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
        <div className="grid gap-2">
          <Label htmlFor="roleId">Perfil (Role) *</Label>
          <select
            id="roleId"
            required
            className="flex h-9 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-1.5 text-sm text-brand-navy-800 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            value={form.roleId}
            onChange={(e) =>
              setForm((p) => ({ ...p, roleId: e.target.value }))
            }
          >
            <option value="">Selecione o perfil...</option>
            {rolesLoading ? (
              <option disabled>Carregando...</option>
            ) : (
              roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))
            )}
          </select>
          {!companyId && roles.length === 0 && !rolesLoading && (
            <p className="text-sm text-amber-600">
              Faça logout e login novamente para carregar os perfis da sua empresa.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-navy-700">
          <Input
            type="checkbox"
            className="h-4 w-4"
            checked={form.isActive}
            onChange={(e) =>
              setForm((p) => ({ ...p, isActive: e.target.checked }))
            }
          />
          Usuário ativo
        </label>
        {status ? (
          <div
            className={`text-sm ${status.startsWith("Falha") || status.startsWith("Erro") ? "text-red-600" : "text-amber-600"}`}
          >
            {status}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Link href="/iam/users">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </ModuleForm>
  );
}
