"use client";

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { IconSolarRays } from "@/components/icons/solar-icons";
import { getApiBaseUrl } from "@/lib/api";
import { setSessionCookie, setUserCompanyContext } from "@/lib/session";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const apiBase = getApiBaseUrl();
    const loginUrl = `${apiBase}/api/auth/login`;

    let response: Response;
    try {
      response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });
    } catch {
      setError("Falha de conexão com a API");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (!response.ok) {
      if (response.status === 401) {
        setError("Email ou senha incorretos.");
      } else if (response.status >= 500) {
        setError("Erro interno. Tente novamente.");
      } else {
        setError("Falha ao entrar. Tente novamente.");
      }
      return;
    }

    try {
      const body = (await response.json()) as {
        user?: { companyId?: string | null; companyName?: string | null };
      };
      setUserCompanyContext(body.user?.companyId ?? null, body.user?.companyName ?? null);
    } catch {
      // segue só com cookie de sessão; AuthGuard preenche empresa via /api/auth/me
    }

    // Mantém sessão também no domínio do frontend para evitar loop de redirecionamento
    setSessionCookie();
    const redirectTo = searchParams.get("from") || "/dashboard";
    window.location.href = redirectTo;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-navy-50 p-4 py-8 md:p-6">
      <div className="mb-6 flex w-full max-w-md justify-center">
        <Logo href="/" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <IconSolarRays className="h-6 w-6 text-brand-orange" />
            <h1 className="text-xl font-bold text-brand-navy-900">Entrar</h1>
          </div>
          <p className="text-sm text-brand-navy-600">
            Use seu email e senha para acessar o sistema 5R
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="mt-2" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-brand-navy-600">
            Não tem conta?{" "}
            <Link href="/register" className="font-medium text-brand-orange hover:underline">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-brand-navy-50 p-4">
          <p className="text-brand-navy-600">Carregando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
