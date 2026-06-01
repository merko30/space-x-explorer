"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Launch } from "../lib/types";
import {
  toggleFavorite,
  isFavorite as checkIsFavorite,
  subscribeFavoritesChange,
} from "@/lib/favorite";
import ActionButton from "./ActionButton";

type LaunchCardProps = { launch: Launch };

export default function LaunchCard({ launch }: LaunchCardProps) {
  const date = new Date(launch.date_utc);
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const statusClass =
    launch.success === true
      ? "success"
      : launch.success === false
        ? "fail"
        : "unknown";
  const imageSrc = launch.image || "/rocket-placeholder.jpg";

  console.log(launch);

  // initialize false to match server render; read localStorage on mount
  const [internalFav, setInternalFav] = useState<boolean>(false);

  useEffect(() => {
    // on mount, sync with localStorage
    try {
      // defer setting state to avoid synchronous state update during effect
      Promise.resolve().then(() => setInternalFav(checkIsFavorite(launch.id)));
    } catch {
      // ignore
    }

    // subscribe to external changes so UI stays in sync
    const unsub = subscribeFavoritesChange((ids) => {
      setInternalFav(ids.includes(launch.id));
    });
    return unsub;
  }, [launch.id]);

  const effectiveIsFavorite = internalFav;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 shadow-[0_20px_70px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_25px_90px_rgba(59,130,246,0.28)]">
      <div className="absolute inset-0 bg-linear-to-br from-sky-500/10 via-violet-500/5 to-cyan-300/5" />
      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-900/80 ring-1 ring-slate-700 flex items-center justify-center overflow-hidden">
            <Image
              src={imageSrc}
              alt={launch.name}
              className="w-full h-full object-cover"
              width={80}
              height={80}
            />
          </div>
          <div className="flex-1">
            <h3
              id={`launch-${launch.id}-title`}
              className="text-lg font-semibold uppercase tracking-[0.22em] text-white"
            >
              {launch.name}
            </h3>
            <p className="mt-1 text-sm text-slate-300">{formattedDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusClass === "success"
                ? "bg-emerald-100/90 text-emerald-900"
                : statusClass === "fail"
                  ? "bg-rose-100/90 text-rose-900"
                  : "bg-slate-700/80 text-slate-100"
            }`}
          >
            {launch.success === true
              ? "Success"
              : launch.success === false
                ? "Failure"
                : "TBD"}
          </span>
          <span className="text-xs text-slate-400">Mission date</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/launches/${launch.id}`}
            className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-600"
          >
            View details
          </Link>
          <ActionButton
            isActive={effectiveIsFavorite}
            onClick={() => {
              setInternalFav((v) => !v);
              toggleFavorite(launch);
            }}
            ariaLabel={
              effectiveIsFavorite
                ? `Remove ${launch.name} from favorites`
                : `Save ${launch.name} to favorites`
            }
            className="px-4 py-2 text-sm"
          >
            {effectiveIsFavorite ? "Remove favorite" : "☆ Favorite"}
          </ActionButton>
        </div>
      </div>
    </article>
  );
}
