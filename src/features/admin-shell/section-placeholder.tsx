import type { LucideIcon } from "lucide-react";

export function AdminSectionPlaceholder({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section aria-labelledby="section-title">
      <h1 className="text-2xl font-black tracking-tight" id="section-title">
        {title}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
        {description}
      </p>
      <div className="bg-card mt-8 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <Icon aria-hidden="true" className="text-muted-foreground size-10" />
        <h2 className="mt-5 font-bold">Hozircha ma’lumot yo‘q</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Bo‘lim route’i va permission himoyasi tayyor. CRUD funksiyalari o‘z
          bosqichida to‘liq qo‘shiladi.
        </p>
      </div>
    </section>
  );
}
