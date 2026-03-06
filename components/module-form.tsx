import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ModuleFormProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ModuleForm({ title, description, children }: ModuleFormProps) {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-brand-navy-600">{description}</p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
