/**
 * Route-level loading state. The root layout is `force-dynamic` and every page
 * reads from Postgres, so navigations have a real wait — this gives the user
 * something better than a blank screen while the server responds.
 */
export default function Loading() {
  return (
    <div className="bg-ink">
      <div className="mx-auto flex min-h-[60vh] max-w-[1400px] items-center justify-center px-6 py-24 lg:px-10">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <span className="size-6 animate-spin rounded-full border-2 border-line border-t-gold" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Loading…</span>
        </div>
      </div>
    </div>
  );
}
