"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { IconSolarRays } from "@/components/icons/solar-icons";
import { getApiBaseUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const apiBase = getApiBaseUrl();
    const loginUrl = `${apiBase}/api/auth/login`;

    let response: Response;
    try {
      response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
    } catch {
      setError("Falha de conexão com a API");
      return;
    }

    if (!response.ok) {
      if (response.status === 401) {
        setError("Credenciais inválidas");
      } else if (response.status >= 500) {
        setError("Erro interno. Tente novamente.");
      } else {
        setError("Falha ao entrar. Tente novamente.");
      }
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-navy-50 p-4 md:p-6">
      <div className="mb-8 flex w-full max-w-md justify-center">
        <Logo href="/" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <IconSolarRays className="h-6 w-6 text-brand-orange" />
            <h1 className="text-xl font-bold text-brand-navy-900">Entrar</h1>
          </div>
          <p className="text-sm text-brand-navy-600">
            Acesse o sistema 5R Energia Solar
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
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
            <div className="grid gap-3 pt-2">
              <Button type="submit">Entrar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/register")}
              >
                Criar conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
