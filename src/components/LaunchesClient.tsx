"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchLaunches, Launch } from "../lib/api";
import LaunchCard from "./LaunchCard";
import LaunchFilters, { LaunchFiltersState } from "./LaunchFilters";
import LaunchCardSkeleton from "./LaunchCardSkeleton";

export default function LaunchesClient({
  initialLaunches,
  totalDocs,
}: {
  initialLaunches: Launch[];
  totalDocs: number;
}) {
  const [filters, setFilters] = useState<LaunchFiltersState>({
    searchInput: "",
    successFilter: "any",
    upcomingFilter: "any",
    sortBy: "date",
    pendingStartDate: "",
    pendingEndDate: "",
    startDate: "",
    endDate: "",
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setSearch(filters.searchInput.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [filters.searchInput]);

  const applyDateRange = useCallback(() => {
    if (!filters.pendingStartDate || !filters.pendingEndDate) return;
    setFilters((prev) => ({
      ...prev,
      startDate: prev.pendingStartDate,
      endDate: prev.pendingEndDate,
    }));
  }, [filters]);

  const query = useInfiniteQuery({
    queryKey: [
      "launches",
      {
        search,
        successFilter: filters.successFilter,
        upcomingFilter: filters.upcomingFilter,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy: filters.sortBy,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchLaunches({
        page: pageParam,
        limit: 10,
        search: search || undefined,
        success:
          filters.successFilter === "any"
            ? undefined
            : filters.successFilter === "true",
        upcoming:
          filters.upcomingFilter === "any"
            ? undefined
            : filters.upcomingFilter === "upcoming",
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
      }),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.docs.length, 0);
      return loaded < lastPage.totalDocs ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    initialData:
      search === "" &&
      filters.successFilter === "any" &&
      filters.upcomingFilter === "any" &&
      filters.startDate === "" &&
      filters.endDate === "" &&
      filters.sortBy === "date"
        ? {
            pages: [{ docs: initialLaunches, totalDocs }],
            pageParams: [1],
          }
        : undefined,
  });

  const onChangeFilters = useCallback(
    <K extends keyof LaunchFiltersState>(
      field: K,
      value: LaunchFiltersState[K],
    ) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const launches = useMemo(
    () => query.data?.pages.flatMap((page) => page.docs) || [],
    [query.data],
  );
  const isLoading = query.isLoading;
  const isError = query.isError;
  const hasNextPage = Boolean(query.hasNextPage);
  const isFetchingNextPage = query.isFetchingNextPage;

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.55)]">
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-800/95 p-5 shadow-inner shadow-slate-900/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Launches
          </p>
          <Link
            href="/favorites"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-pink-300 transition hover:bg-slate-900 hover:text-pink-200"
            aria-label="View favorites"
          >
            <span aria-hidden="true">♥</span>
            Favorites
          </Link>
        </div>

        <LaunchFilters
          filters={filters}
          onChange={onChangeFilters}
          onApplyDateRange={applyDateRange}
        />
      </div>

      {isError && (
        <div className="space-y-3 rounded-3xl border border-rose-600/20 bg-rose-950/80 p-6 text-center text-rose-100">
          <p className="text-sm font-semibold">Failed to load launches.</p>
          <p className="text-sm text-rose-300">
            Please try again or adjust your filters.
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex items-center justify-center rounded-full border border-rose-500 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-400 hover:bg-rose-500/15"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && launches.length === 0 ? (
        <div className="grid gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LaunchCardSkeleton key={index} />
          ))}
        </div>
      ) : launches.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No launches found.</p>
          <p className="mt-2 text-sm text-slate-400">
            Try a different search, adjust the filters, or clear the date range.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      )}

      {launches.length > 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-4 shadow-inner shadow-slate-900/40 sm:flex-row sm:justify-center">
          <button
            onClick={() => query.fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isFetchingNextPage || isLoading
              ? "Loading..."
              : hasNextPage
                ? "Load more"
                : "No more launches"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
