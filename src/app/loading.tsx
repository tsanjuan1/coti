function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default function GlobalLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 md:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-[var(--line)] bg-[color:var(--surface)] p-5 shadow-sm lg:block">
          <div className="mb-8 rounded-[22px] bg-[color:var(--surface-alt)] p-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-40" />
            <SkeletonBlock className="mt-3 h-4 w-28" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-11 w-full" />
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section className="mb-6 rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-8 w-56" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
              <div className="flex gap-3">
                <SkeletonBlock className="h-11 w-36" />
                <SkeletonBlock className="h-11 w-28" />
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-4 h-10 w-72" />
              <SkeletonBlock className="mt-3 h-4 w-full max-w-3xl" />
              <SkeletonBlock className="mt-2 h-4 w-full max-w-2xl" />
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm"
                >
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="mt-4 h-8 w-32" />
                  <SkeletonBlock className="mt-4 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-3/4" />
                </div>
              ))}
            </section>

            <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-sm">
              <SkeletonBlock className="h-5 w-48" />
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-28 w-full" />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
