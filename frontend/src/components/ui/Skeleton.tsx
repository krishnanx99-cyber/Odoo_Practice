import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[0.75rem] bg-surface-container-high ${className}`}
    />
  );
}

interface SkeletonCardGridProps {
  count?: number;
  label?: string;
}

function SkeletonCardGrid({ count = 6, label }: SkeletonCardGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      role={label ? "status" : undefined}
      aria-live={label ? "polite" : undefined}
    >
      {label ? <p className="sr-only">{label}</p> : null}
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 overflow-hidden rounded-[1rem] border-2 border-on-background bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-[0.5rem]" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="mt-auto flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonRow({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-4 ${className}`} />;
}

function SkeletonList({ rows = 3, label }: { rows?: number; label?: string }) {
  return (
    <div
      className="flex flex-col gap-4"
      role={label ? "status" : undefined}
      aria-live={label ? "polite" : undefined}
    >
      {label ? <p className="sr-only">{label}</p> : null}
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-[1rem] border-2 border-on-background bg-surface p-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-[0.5rem]" />
          <div className="flex flex-col gap-2">
            <SkeletonRow className="w-40" />
            <SkeletonRow className="w-24" />
          </div>
          <Skeleton className="ml-auto h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCardGrid, SkeletonList, SkeletonRow };
export type { SkeletonProps, ReactNode };