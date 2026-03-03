import { cn } from "@/lib/utils";

type Stage = {
  label: string;
  done: boolean;
};

type ProgressStageProps = {
  title: string;
  stages: Stage[];
};

export function ProgressStage({ title, stages }: ProgressStageProps) {
  return (
    <div className="rounded-lg border border-brand-navy-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                stage.done
                  ? "bg-emerald-500 text-white"
                  : "bg-brand-navy-200 text-brand-navy-500",
              )}
            >
              {stage.done ? "✓" : "•"}
            </span>
            <span className={stage.done ? "text-brand-navy-700" : "text-brand-navy-400"}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
