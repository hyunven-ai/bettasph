export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200/50 rounded-xl ${className}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-4">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
