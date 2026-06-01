"use client";
import React from "react";

export type BoolFilter = "any" | "true" | "false";
export type TimeFilter = "any" | "upcoming" | "past";
export type SortBy = "date" | "name";

export interface LaunchFiltersState {
  searchInput: string;
  successFilter: BoolFilter;
  upcomingFilter: TimeFilter;
  sortBy: SortBy;
  pendingStartDate: string;
  pendingEndDate: string;
  startDate: string;
  endDate: string;
}

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

export interface LaunchFiltersProps {
  filters: LaunchFiltersState;
  onChange: <K extends keyof LaunchFiltersState>(
    field: K,
    value: LaunchFiltersState[K],
  ) => void;
  onApplyDateRange: () => void;
}

export default function LaunchFilters({
  filters,
  onChange,
  onApplyDateRange,
}: LaunchFiltersProps) {
  const hasPendingDateRange =
    filters.pendingStartDate !== filters.startDate ||
    filters.pendingEndDate !== filters.endDate;
  const canApplyDateRange =
    filters.pendingStartDate !== "" && filters.pendingEndDate !== "";

  return (
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
          value={filters.searchInput}
          onChange={(e) => onChange("searchInput", e.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          id="launch-filter"
          label="Status"
          value={filters.successFilter}
          onChange={(value) => onChange("successFilter", value)}
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
          value={filters.upcomingFilter}
          onChange={(value) => onChange("upcomingFilter", value)}
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
              onClick={onApplyDateRange}
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
                value={filters.pendingStartDate}
                onChange={(e) => onChange("pendingStartDate", e.target.value)}
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
                value={filters.pendingEndDate}
                onChange={(e) => onChange("pendingEndDate", e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
          </div>
        </div>

        <SelectField
          id="launch-sort-by"
          label="Sort by"
          value={filters.sortBy}
          onChange={(value) => onChange("sortBy", value)}
          options={[
            { value: "date", label: "Date" },
            { value: "name", label: "Name" },
          ]}
          className="w-full sm:w-56"
        />
      </div>
    </div>
  );
}
