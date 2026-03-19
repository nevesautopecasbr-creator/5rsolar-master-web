"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setUserCompanyContext } from "@/lib/session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/auth/me", { method: "GET" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setAllowed(true);
          return res.json();
        }
        const from = pathname ? `?from=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${from}`);
      })
      .then((data: { companyId?: string | null; companyName?: string | null } | null) => {
        if (cancelled || !data) return;
        setUserCompanyContext(data.companyId ?? null, data.companyName ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          const from = pathname ? `?from=${encodeURIComponent(pathname)}` : "";
          router.replace(`/login${from}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (allowed !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy-50">
        <p className="text-brand-navy-600">Redirecionando para o login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
