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
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-brand-navy-900 truncate">{title}</h3>
            <p className="text-xs text-brand-navy-500 truncate">{subtitle}</p>
          </div>
          <span className="flex-shrink-0 rounded-full bg-brand-navy-100 px-2.5 py-1 text-xs font-medium text-brand-navy-700">
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-brand-navy-500">
          <span>Progresso</span>
          <span className="font-medium">{percent}%</span>
        </div>
        <ProgressBar value={percent} />
      </CardContent>
    </Card>
  );
}
