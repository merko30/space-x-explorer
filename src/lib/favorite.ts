import { Launch } from "./types";

// helpers to save and load favorites from localStorage
export const FAVORITES_KEY = "spacex_favorites";

export function saveFavorite(launch: Launch) {
  if (typeof window === "undefined") return;
  const favorites = loadFavorites();
  if (!favorites.includes(launch.id)) {
    favorites.push(launch.id);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
    emitFavoritesChange();
  }
}

export function removeFavorite(launchId: string) {
  if (typeof window === "undefined") return;
  const favorites = loadFavorites();
  const index = favorites.findIndex((id) => id === launchId);
  if (index !== -1) {
    favorites.splice(index, 1);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
    emitFavoritesChange();
  }
}

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isFavorite(launchId: string): boolean {
  const favorites = loadFavorites();
  return favorites.includes(launchId);
}

export function toggleFavorite(launch: Launch) {
  if (typeof window === "undefined") return;
  if (isFavorite(launch.id)) {
    removeFavorite(launch.id);
  } else {
    saveFavorite(launch);
  }
}

export function clearFavorites() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch {
    // ignore
  }
  emitFavoritesChange();
}

function emitFavoritesChange() {
  if (typeof window === "undefined") return;
  try {
    const ids = loadFavorites();
    const ev = new CustomEvent("spacex:favorites-changed", { detail: ids });
    window.dispatchEvent(ev);
  } catch {
    // ignore in non-browser environments
  }
}

export function subscribeFavoritesChange(cb: (ids: string[]) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as string[] | undefined;
    cb(detail || []);
  };
  window.addEventListener("spacex:favorites-changed", handler as EventListener);
  return () =>
    window.removeEventListener(
      "spacex:favorites-changed",
      handler as EventListener,
    );
}
