"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AdminDashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error({ name: error.name, digest: error.digest });
  }, [error]);

  return (
    <section className="bg-card flex min-h-96 flex-col items-center justify-center rounded-xl border p-8 text-center">
      <AlertCircle aria-hidden="true" className="text-destructive size-10" />
      <h1 className="mt-5 text-2xl font-black">Dashboard yuklanmadi</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">
        Ma’lumotlar bazasi yoki server bilan vaqtinchalik muammo yuz berdi.
      </p>
      <Button className="mt-6" onClick={unstable_retry} type="button">
        Qayta urinish
      </Button>
    </section>
  );
}
