"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
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
    <main className="container flex min-h-[70svh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <p className="text-primary text-sm font-bold uppercase">Xatolik</p>
        <h1 className="mt-3 text-3xl font-black">
          Kutilmagan muammo yuz berdi
        </h1>
        <p className="text-muted-foreground mt-4">
          Sahifani qayta yuklashga urinib ko‘ring. Muammo takrorlansa, keyinroq
          qayting.
        </p>
        <Button className="mt-8" onClick={unstable_retry} type="button">
          Qayta urinish
        </Button>
      </div>
    </main>
  );
}
