import { Skeleton } from "@/components/ui/skeleton";

export function InvoicesSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse">
      <div className="flex justify-between items-center py-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-[150px]" />
      </div>
      <div className="border rounded-md">
        <div className="p-4 border-b flex gap-4">
          <Skeleton className="h-6 w-1/6" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/6" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/12" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b flex gap-4">
            <Skeleton className="h-6 w-1/6" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/6" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/12" />
          </div>
        ))}
      </div>
    </div>
  );
}
