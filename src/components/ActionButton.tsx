"use client";

import React from "react";
import clsx from "clsx";

export default function ActionButton(props: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const {
    children,
    onClick,
    className = "",
    isActive = false,
    isLoading = false,
    disabled,
    ariaLabel,
  } = props;

  const base =
    "inline-flex items-center justify-center rounded-full border transition font-semibold cursor-pointer";
  const activeCls = isActive
    ? "border-rose-500 bg-rose-500/10 text-rose-200 hover:border-rose-400 hover:bg-rose-500/10"
    : "border-slate-700 bg-slate-900/90 text-slate-200 hover:border-slate-500 hover:bg-slate-800";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      className={clsx(base, activeCls, className)}
    >
      {isLoading ? (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin text-slate-200"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
