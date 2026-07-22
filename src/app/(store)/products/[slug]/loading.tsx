export default function ProductLoading() {
  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-2">
      <div className="bg-muted aspect-[4/3] animate-pulse rounded-2xl" />
      <div className="grid content-start gap-5">
        <div className="bg-muted h-10 animate-pulse rounded-xl" />
        <div className="bg-muted h-7 w-1/2 animate-pulse rounded-xl" />
        <div className="bg-muted h-28 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
