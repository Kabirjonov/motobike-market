"use client";

export function PublicFooter() {
  return (
    <footer className="border-border border-t">
      <div className="text-muted-foreground container flex flex-col gap-2 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Motobike Market</p>
        <p>Mototsikl olami uchun ishonchli market.</p>
      </div>
    </footer>
  );
}
