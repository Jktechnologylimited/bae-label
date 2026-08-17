export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="h-4 w-40 animate-pulse bg-black/10" />
      <div className="mt-3 h-10 w-72 animate-pulse bg-black/10" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] w-full bg-black/10" />
            <div className="mt-3 h-4 w-2/3 bg-black/10" />
            <div className="mt-2 h-3 w-1/3 bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
