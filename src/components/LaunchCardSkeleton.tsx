"use client";

export default function LaunchCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.35)] animate-pulse">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-20 w-20 rounded-3xl bg-slate-800" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 rounded-full bg-slate-800" />
          <div className="h-4 w-1/2 rounded-full bg-slate-800" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded-full bg-slate-800" />
        <div className="h-4 w-5/6 rounded-full bg-slate-800" />
        <div className="h-4 w-2/3 rounded-full bg-slate-800" />
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="h-9 w-28 rounded-full bg-slate-800" />
        <div className="h-9 w-24 rounded-full bg-slate-800" />
      </div>
    </article>
  );
}
