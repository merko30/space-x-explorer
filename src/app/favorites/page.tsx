"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import LaunchCard from "@/components/LaunchCard";
import { fetchLaunchById } from "@/lib/api";
import {
  clearFavorites,
  loadFavorites,
  subscribeFavoritesChange,
} from "@/lib/favorite";
const LoadingButton = dynamic(() => import("@/components/LoadingButton"), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      className="rounded-full border border-rose-500 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200"
    >
      Clear all
    </button>
  ),
});
import type { Launch, SpaceXLaunch } from "@/lib/types";

function getLaunchImage(launch: SpaceXLaunch): string | null {
  const missionPatchSmall = launch.links?.mission_patch_small;
  if (typeof missionPatchSmall === "string" && missionPatchSmall.length > 0) {
    return missionPatchSmall;
  }

  const missionPatch = launch.links?.mission_patch;
  if (typeof missionPatch === "string" && missionPatch.length > 0) {
    return missionPatch;
  }

  const originalFlickr = launch.links?.flickr?.original;
  if (Array.isArray(originalFlickr)) {
    const first = originalFlickr.find(
      (src): src is string => typeof src === "string" && src.length > 0,
    );
    if (first) return first;
  }

  const patchSmall = launch.links?.patch?.small;
  if (typeof patchSmall === "string" && patchSmall.length > 0) {
    return patchSmall;
  }

  return null;
}

function normalizeLaunch(launch: SpaceXLaunch): Launch {
  return {
    id: launch.id,
    name: launch.name,
    date_utc: launch.date_utc,
    success: launch.success,
    image: getLaunchImage(launch),
  };
}

export default function FavoritesPage() {
  const [favoriteLaunches, setFavoriteLaunches] = useState<Launch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFavoritesList() {
      const ids = loadFavorites();
      if (ids.length === 0) {
        setFavoriteLaunches([]);
        setIsLoading(false);
        return;
      }

      try {
        const launches = await Promise.all(
          ids.map(async (id) => {
            const launch = await fetchLaunchById(id);
            return launch ? normalizeLaunch(launch) : null;
          }),
        );

        setFavoriteLaunches(
          launches.filter((item): item is Launch => item !== null),
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load saved favorites.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFavoritesList();
    const unsub = subscribeFavoritesChange(() => {
      loadFavoritesList();
    });

    return unsub;
  }, []);

  const handleClearFavorites = () => {
    clearFavorites();
    setFavoriteLaunches([]);
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.55)]">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-800/95 p-5 shadow-inner shadow-slate-900/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Favorites
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Saved launches
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Bookmarked launches are stored in LocalStorage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Back to launches
          </Link>
          {favoriteLaunches.length > 0 ? (
            <LoadingButton
              onClick={handleClearFavorites}
              className="bg-rose-500/10 border-rose-500 text-rose-200 hover:bg-rose-500/15"
            >
              Clear all
            </LoadingButton>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-slate-300">Loading favorites...</p>
      ) : error ? (
        <p className="text-center text-rose-300">{error}</p>
      ) : favoriteLaunches.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No favorites yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Add a launch to your favorites from the launch list.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {favoriteLaunches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      )}
    </section>
  );
}
