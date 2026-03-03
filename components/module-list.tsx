import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ModuleListProps = {
  title: string;
  description: string;
  newHref: string;
};

export function ModuleList({ title, description, newHref }: ModuleListProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-brand-navy-600">{description}</p>
        </div>
        <Link href={newHref}>
          <Button type="button">Novo</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed border-brand-navy-300 p-6 text-center text-sm text-brand-navy-500">
          Listagem placeholder
        </div>
      </CardContent>
    </Card>
  );
}
