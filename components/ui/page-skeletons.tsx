import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <Skeleton className="h-8 w-24" />
      <div className="w-80 rounded-2xl border border-border bg-card p-8 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stats bar */}
      <div className="flex gap-4 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-xl border border-border bg-card p-4 w-36 space-y-2"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-56 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Skeleton className="h-10 rounded-none border-b border-border" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      {/* Title card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      {/* Content */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="px-8 py-8 space-y-6">
      <Skeleton className="h-7 w-24" />
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-32 rounded-lg mt-4" />
      </div>
    </div>
  );
}
