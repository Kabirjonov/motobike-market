import type { LucideIcon } from "lucide-react";

export function DashboardEmptyState({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <Icon aria-hidden="true" className="text-muted-foreground size-8" />
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        {description}
      </p>
    </div>
  );
}
