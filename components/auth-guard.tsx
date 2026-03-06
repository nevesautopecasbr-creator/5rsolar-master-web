"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const SESSION_COOKIE_NAME = "app_session";

function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${SESSION_COOKIE_NAME}=`);
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

  if (allowed !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy-50">
        <p className="text-brand-navy-600">Redirecionando para o login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
