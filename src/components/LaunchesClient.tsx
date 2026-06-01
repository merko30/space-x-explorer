"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchLaunches, Launch } from "../lib/api";
import LaunchCard from "./LaunchCard";

type BoolFilter = "any" | "true" | "false";
type TimeFilter = "any" | "upcoming" | "past";
type SortBy = "date" | "name";

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

function SelectField<T extends string>(props: {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  className?: string;
}) {
  const { id, label, value, onChange, options, className } = props;
  const baseClasses =
    "w-full rounded-2xl border border-slate-700 bg-slate-950 pr-10 pl-4 py-3 text-sm text-slate-100 appearance-none outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-sm uppercase tracking-[0.24em] text-slate-400"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={baseClasses}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function LaunchesClient({
  initialLaunches,
  totalDocs,
}: {
  initialLaunches: Launch[];
  totalDocs: number;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [successFilter, setSuccessFilter] = useState<BoolFilter>("any");
  const [upcomingFilter, setUpcomingFilter] = useState<TimeFilter>("any");
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [searchInput]);

  const hasPendingDateRange =
    pendingStartDate !== startDate || pendingEndDate !== endDate;
  const canApplyDateRange = pendingStartDate !== "" && pendingEndDate !== "";

  const applyDateRange = () => {
    if (!canApplyDateRange) return;
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
  };

  const query = useInfiniteQuery({
    queryKey: [
      "launches",
      {
        search,
        successFilter,
        upcomingFilter,
        startDate,
        endDate,
        sortBy,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchLaunches({
        page: pageParam,
        limit: 10,
        search: search || undefined,
        success: successFilter === "any" ? undefined : successFilter === "true",
        upcoming:
          upcomingFilter === "any" ? undefined : upcomingFilter === "upcoming",
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
      }),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.docs.length, 0);
      return loaded < lastPage.totalDocs ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    initialData:
      search === "" &&
      successFilter === "any" &&
      upcomingFilter === "any" &&
      startDate === "" &&
      endDate === "" &&
      sortBy === "date"
        ? {
            pages: [{ docs: initialLaunches, totalDocs }],
            pageParams: [1],
          }
        : undefined,
  });

  const launches = query.data?.pages.flatMap((page) => page.docs) || [];
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

        <div className="grid gap-4">
          <div className="min-w-60">
            <label
              htmlFor="launch-search"
              className="mb-2 block text-sm uppercase tracking-[0.24em] text-slate-400"
            >
              Search missions
            </label>
            <input
              id="launch-search"
              placeholder="Search mission"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <SelectField
              id="launch-filter"
              label="Status"
              value={successFilter}
              onChange={(value) => setSuccessFilter(value as BoolFilter)}
              options={[
                { value: "any", label: "Any" },
                { value: "true", label: "Success" },
                { value: "false", label: "Failure" },
              ]}
              className="w-full flex-1 min-w-42.5"
            />

            <SelectField
              id="launch-upcoming"
              label="Time"
              value={upcomingFilter}
              onChange={(value) => setUpcomingFilter(value as TimeFilter)}
              options={[
                { value: "any", label: "Any" },
                { value: "upcoming", label: "Upcoming" },
                { value: "past", label: "Past" },
              ]}
              className="w-full flex-1 min-w-42.5"
            />

            <div className="w-full flex-1 min-w-57.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="block text-sm uppercase tracking-[0.24em] text-slate-400">
                  Date range
                </span>
                <button
                  type="button"
                  onClick={applyDateRange}
                  disabled={!canApplyDateRange || !hasPendingDateRange}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Apply
                </button>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor="launch-start-date" className="sr-only">
                    Start date
                  </label>
                  <input
                    id="launch-start-date"
                    type="date"
                    value={pendingStartDate}
                    onChange={(e) => setPendingStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="launch-end-date" className="sr-only">
                    End date
                  </label>
                  <input
                    id="launch-end-date"
                    type="date"
                    value={pendingEndDate}
                    onChange={(e) => setPendingEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20"
                  />
                </div>
              </div>
            </div>

            <SelectField
              id="launch-sort-by"
              label="Sort by"
              value={sortBy}
              onChange={(value) => setSortBy(value as SortBy)}
              options={[
                { value: "date", label: "Date" },
                { value: "name", label: "Name" },
              ]}
              className="w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {isLoading && <p className="text-center text-slate-300">Loading...</p>}
      {isError && (
        <p className="text-center text-rose-300">Error loading launches</p>
      )}

      <div className="grid gap-6">
        {launches.map((launch) => (
          <LaunchCard key={launch.id} launch={launch} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-4 shadow-inner shadow-slate-900/40 sm:flex-row sm:justify-center">
        <button
          onClick={() => query.fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetchingNextPage
            ? "Loading..."
            : hasNextPage
              ? "Load more"
              : "No more launches"}
        </button>
      </div>
    </section>
  );
}
