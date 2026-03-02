"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    if (value.length < 8) hints.push("Minimo de 8 caracteres.");
    if (!/[a-z]/.test(value)) hints.push("Pelo menos uma letra minuscula.");
    if (!/[A-Z]/.test(value)) hints.push("Pelo menos uma letra maiuscula.");
    if (!/[0-9]/.test(value)) hints.push("Pelo menos um numero.");
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
      setError("A senha nao atende aos requisitos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
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
        setError("Email já cadastrado");
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-lg font-semibold">Criar conta</h1>
          <p className="text-sm text-slate-600">
            Informe seu email e senha para criar uma conta.
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
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPhone(event.target.value)}
                onBlur={(event) => setPhone(formatPhone(event.target.value))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setPhone(formatPhone(event.currentTarget.value));
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
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {passwordHints.length > 0 ? (
              <div className="text-sm text-slate-600">
                {passwordHints.map((hint) => (
                  <div key={hint}>- {hint}</div>
                ))}
              </div>
            ) : null}
            <Button type="submit">Criar conta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
