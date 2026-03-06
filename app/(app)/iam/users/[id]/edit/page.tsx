"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ModuleForm } from "@/components/module-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type Role = { id: string; name: string };
type UserRole = { roleId: string; role: Role; companyId: string | null };
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive?: boolean | null;
  roles?: UserRole[];
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isActive: true,
    roleId: "",
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch(`/api/users/${id}`).then((r) => r.json()),
      apiFetch("/api/roles").then((r) => r.json()),
    ])
      .then(([userData, rolesData]) => {
        if (!mounted) return;
        setUser(userData);
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        const companyId =
          typeof window !== "undefined" ? localStorage.getItem("companyId") : null;
        const currentRole = (userData.roles ?? []).find(
          (r: UserRole) => r.companyId === companyId,
        );
        const roleId = currentRole?.roleId ?? (userData.roles?.[0] as UserRole)?.roleId ?? "";
        setForm({
          name: userData.name ?? "",
          email: userData.email ?? "",
          password: "",
          phone: userData.phone ?? "",
          isActive: userData.isActive ?? true,
          roleId,
        });
      })
      .catch(() => setStatus("Falha ao carregar usuário"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStatus(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        isActive: form.isActive,
        roleId: form.roleId || undefined,
      };
      if (form.password.trim()) {
        payload.password = form.password;
      }
      const response = await apiFetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text();
        setStatus(`Falha ao salvar: ${response.status} ${errText || response.statusText}`);
        return;
      }
      setStatus("Salvo com sucesso");
      router.push("/iam/users");
    } catch (err) {
      setStatus(`Erro: ${err instanceof Error ? err.message : "Falha ao salvar"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ModuleForm title="Editar Usuário" description="Carregando...">
        <div className="text-sm text-brand-navy-600">Carregando...</div>
      </ModuleForm>
    );
  }

  if (!user) {
    return (
      <ModuleForm title="Editar Usuário" description="Usuário não encontrado">
        <Link href="/iam/users" className="text-brand-orange hover:underline">
          Voltar para usuários
        </Link>
      </ModuleForm>
    );
  }

  return (
    <ModuleForm
      title="Editar Usuário"
      description="Altere os dados e o perfil (role) do usuário"
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleSubmit(e);
          return false;
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nome completo"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Nova senha (deixe em branco para manter)</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="roleId">Perfil (Role)</Label>
          <select
            id="roleId"
            className="flex h-9 w-full rounded-md border border-brand-navy-300 bg-white px-3 py-1.5 text-sm text-brand-navy-800 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            value={form.roleId}
            onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
          >
            <option value="">Selecione o perfil...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
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
          <div className="text-sm text-brand-navy-600">{status}</div>
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
