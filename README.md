# SpaceX Explorer — Frontend

A Next.js (App Router) frontend for exploring SpaceX launches. Focused on clean UI, client caching, accessible filters, and pragmatic performance.

---

## How to run

Requires Node.js (16+/18+ recommended) on macOS.

- Install
  - npm: `npm install`
  - pnpm: `pnpm install`
  - yarn: `yarn install`

- Dev
  - `npm run dev` (or `pnpm dev` / `yarn dev`)
  - Open: http://localhost:3000

- Build / Production
  - `npm run build`
  - `npm run start`

---

## Architecture decisions

- Router: App Router (Next.js App) — chosen for server components, streaming and layout composition.
- Data layer: React Query (tanstack/react-query)
  - Provides caching, dedupe, background refresh, optimistic updates, infinite queries.
  - Custom fetcher lives in `src/lib/fetcher.ts` with retry/backoff for 429/5xx.
- Server/client split:
  - Pages that require fast server render use server components.
  - Interactive parts (filters, favorites, launch cards) are client components (`"use client"`).
  - localStorage access is guarded and only read in `useEffect` to prevent hydration mismatch.

Rationale: App Router + React Query balances SSR performance and client UX (background refresh, cache hydration).

---

## SpaceX API usage

- Base: `https://api.spacexdata.com/v4`
- Key endpoints:
  - `/launches/query` — complex queries with filters and pagination (server-side search)
  - `/launches/:id`, `/rockets/:id`, `/launchpads/:id` — detail fetches
- Query shape (example for `/launches/query`):
  - body contains `query` (filter object) and `options` (pagination, sort)
  - Example fields:
    - `name: { $regex: "falcon", $options: "i" }`
    - `upcoming: true` or `false`
    - `success: true` or `false`
    - `date_utc: { $gte: "...", $lte: "..." }`
- Pagination strategy:
  - Server-side pagination via `page` + `limit` returned as `totalDocs` and `docs`.
  - Client uses `useInfiniteQuery` (React Query) and "Load more" for incremental fetches.
  - Prefetch or seed detail cache from list items to avoid duplicate fetches on navigation.

---

## Data-layer improvements applied

- Central fetcher with exponential backoff + jitter for 429/5xx/network errors.
- React Query global defaults:
  - `staleTime`: ~2–5 minutes
  - `cacheTime`: ~30 minutes
  - `refetchOnWindowFocus`: true
  - dedupe via stable `queryKey` usage
- Date/search debouncing and explicit date-range Apply button to reduce unnecessary queries.

---

## UI / Performance & Accessibility considerations

Performance:

- next/image used with `fill` or explicit width/height + `sizes` to avoid loading large images.
- Skeleton cards shown during initial load.
- Keep per-page size small (10–20) to avoid fetching too much.
- Prefetch next page on user intent (optional).
- Recommendation: virtualize long lists (react-window) if results may be very large.

Accessibility:

- Filters are keyboard-focusable; pills/selects expose `aria-pressed` / labels.
- Buttons have `aria-label` and visible focus states.
- Avoid reading localStorage during SSR to prevent hydration mismatches — read in `useEffect`.
- Error and empty states provide clear messaging + keyboard-focusable retry controls.

---

## Tradeoffs & next steps (if more time)

Priority items to further improve UX and reliability:

1. Virtualize the launch list (react-window/react-virtual) — required for very large results.
2. Offline support:
   - Service worker caching for static assets & last known data.
3. More tests:
   - Unit tests for fetcher, favorites, and critical components; integration tests (Playwright).
4. Telemetry:
   - Track slow API endpoints and retry counts for observability.

---

## Known limitations / TODOs

- List virtualisation is not implemented — UI may become heavy with many items. It might be too much for this demo, but would be a good next step for large datasets.
- Rocket & launchpad fetches occur on detail page — could prefetch on hover for faster navigation.
- Retry/backoff is basic (max 3 retries). For production, adapt to API `Retry-After` headers.
- Add unit / e2e tests.

---

## Where to look in repo (high-level)

- `src/components/LaunchesClient.tsx` — main list + filters + load-more
- `src/components/LaunchFilters.tsx` — extracted filters UI
- `src/components/LaunchCard.tsx` — card UI and favorites handling
- `src/app/launches/[id]/page.tsx` — detail page (launch, rocket, launchpad)
- `src/lib/fetcher.ts` — fetch wrapper + retry/backoff
- `src/lib/api.ts` — API helpers
- `src/lib/favorite.ts` — localStorage favorites with subscription API

---

If you want, I can:

- Add a short CONTRIBUTING or developer quick-start with common dev commands.
- Implement list virtualization and update README with the tradeoffs/benchmarks.
