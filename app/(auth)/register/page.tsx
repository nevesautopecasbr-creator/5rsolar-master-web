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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordHints, setPasswordHints] = useState<string[]>([]);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) {
      return digits;
    }
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 4) {
      return `(${ddd}) ${rest}`;
    }
    if (rest.length <= 8) {
      return `(${ddd}) ${rest.slice(0, 4)} ${rest.slice(4)}`;
    }
    return `(${ddd}) ${rest.slice(0, 5)} ${rest.slice(5)}`;
  }

  function validatePassword(value: string) {
    const hints: string[] = [];
    if (value.length < 8) hints.push("Mínimo de 8 caracteres.");
    if (!/[a-z]/.test(value)) hints.push("Pelo menos uma letra minúscula.");
    if (!/[A-Z]/.test(value)) hints.push("Pelo menos uma letra maiúscula.");
    if (!/[0-9]/.test(value)) hints.push("Pelo menos um número.");
    if (!/[^A-Za-z0-9]/.test(value)) hints.push("Pelo menos um caractere especial.");
    return hints;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPasswordHints([]);

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    const hints = validatePassword(password);
    if (hints.length > 0) {
      setPasswordHints(hints);
      setError("A senha não atende aos requisitos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    const apiBase = getApiBaseUrl();
    const registerUrl = `${apiBase}/api/auth/register`;

    let response: Response;
    try {
      response = await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
        credentials: "include",
      });
    } catch {
      setError("Falha de conexão com a API");
      return;
    }

    if (!response.ok) {
      if (response.status === 409) {
        setError("Email já cadastrado.");
      } else if (response.status >= 500) {
        setError("Erro interno. Tente novamente.");
      } else {
        setError("Falha ao criar conta. Tente novamente.");
      }
      return;
    }

    router.push("/login");
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
            <h1 className="text-xl font-bold text-brand-navy-900">Criar conta</h1>
          </div>
          <p className="text-sm text-brand-navy-600">
            Informe seus dados para criar uma conta no sistema 5R
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              <Label htmlFor="phone">Telefone (DDD)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={(e) => setPhone(formatPhone(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPhone(formatPhone(e.currentTarget.value));
                  }
                }}
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
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {passwordHints.length > 0 ? (
              <div className="rounded-lg bg-brand-navy-50 px-3 py-2 text-sm text-brand-navy-700">
                {passwordHints.map((hint) => (
                  <div key={hint}>• {hint}</div>
                ))}
              </div>
            ) : null}
            <Button type="submit" className="mt-2">
              Criar conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
