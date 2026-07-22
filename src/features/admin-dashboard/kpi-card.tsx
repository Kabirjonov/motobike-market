import type { LucideIcon } from "lucide-react";

export function KpiCard({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <article className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>
        <span className="bg-primary/10 text-primary rounded-lg p-2.5">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="text-muted-foreground mt-4 text-xs leading-5">
        {description}
      </p>
    </article>
  );
}
