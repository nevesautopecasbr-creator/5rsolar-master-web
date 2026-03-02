import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";

type ProgressCardProps = {
  title: string;
  subtitle: string;
  percent: number;
  status: string;
};

export function ProgressCard({
  title,
  subtitle,
  percent,
  status,
}: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progresso</span>
          <span>{percent}%</span>
        </div>
        <ProgressBar value={percent} />
      </CardContent>
    </Card>
  );
}
