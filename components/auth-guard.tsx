"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setUserCompanyContext } from "@/lib/session";

/** Cookie definido pela API após login (auth.controller) */
const ACCESS_TOKEN_COOKIE = "access_token";

function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${ACCESS_TOKEN_COOKIE}=`);
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasSessionCookie()) {
      setAllowed(true);
    } else {
      const from = pathname ? `?from=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${from}`);
    }
  }, [router, pathname]);

  // Sincroniza empresa do usuário (contexto) ao entrar na app
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    apiFetch("/api/auth/me", { method: "GET" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { companyId?: string | null; companyName?: string | null } | null) => {
        if (cancelled || !data) return;
        setUserCompanyContext(data.companyId ?? null, data.companyName ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  if (allowed !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy-50">
        <p className="text-brand-navy-600">Redirecionando para o login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
