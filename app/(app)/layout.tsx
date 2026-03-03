import type { ReactNode } from "react";
import { LayoutShell } from "@/components/layout-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
