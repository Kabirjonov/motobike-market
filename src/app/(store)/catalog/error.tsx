"use client";
export default function CatalogError({
  reset,
}: {
  error: Error;
  reset(): void;
}) {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-14 text-center">
      <div>
        <h1 className="text-2xl font-black">Katalogni yuklab bo‘lmadi</h1>
        <p className="text-muted-foreground mt-2">
          Server bilan aloqa vaqtincha uzildi.
        </p>
        <button
          className="bg-primary text-primary-foreground mt-5 rounded-lg px-4 py-2 font-bold"
          onClick={reset}
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
