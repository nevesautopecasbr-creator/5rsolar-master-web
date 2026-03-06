import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { LayoutShell } from "@/components/layout-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <LayoutShell>{children}</LayoutShell>
    </AuthGuard>
  );
}
