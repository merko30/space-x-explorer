const BASE = "https://api.spacexdata.com/v4";

type RevalidateOpt = { revalidate?: number };

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Calculate exponential backoff with jitter
 * retry 0: 1000ms, retry 1: 2000ms, retry 2: 4000ms, etc.
 */
function getBackoffMs(retryCount: number): number {
  const baseDelay = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.1 * baseDelay; // 0-10% jitter
  return baseDelay + jitter;
}

async function request<T = any>(
  path: string,
  init?: RequestInit,
  opts?: RevalidateOpt,
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const finalInit: RequestInit = { ...init };
  if (opts?.revalidate !== undefined)
    (finalInit as any).next = { revalidate: opts.revalidate };

  for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
    try {
      const res = await fetch(url, finalInit);

      // Check if we should retry
      const shouldRetry =
        (res.status === 429 || res.status >= 500) && retryCount < MAX_RETRIES;

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        const msg = text || res.statusText;

        if (shouldRetry) {
          const backoffMs = getBackoffMs(retryCount);
          console.warn(
            `[API] Retry ${retryCount + 1}/${MAX_RETRIES} for ${res.status} after ${backoffMs}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw new Error(`${res.status} ${msg}`);
      }

      // Try parse JSON, but allow empty responses
      const txt = await res.text();
      if (!txt) return null as unknown as T;
      try {
        return JSON.parse(txt) as T;
      } catch (e) {
        return txt as unknown as T;
      }
    } catch (err) {
      // On last retry, throw the error
      if (retryCount === MAX_RETRIES) {
        throw err;
      }

      // For network errors, retry with backoff
      const backoffMs = getBackoffMs(retryCount);
      console.warn(
        `[API] Network error, retry ${retryCount + 1}/${MAX_RETRIES} after ${backoffMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  // Failsafe (should not reach here)
  throw new Error("Max retries exceeded");
}

export async function apiGet<T = any>(
  path: string,
  opts?: RevalidateOpt,
): Promise<T> {
  return request<T>(
    path,
    { method: "GET", headers: { "Content-Type": "application/json" } },
    opts,
  );
}

export async function apiPost<T = any>(
  path: string,
  body?: any,
  opts?: RevalidateOpt,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    },
    opts,
  );
}

export default { get: apiGet, post: apiPost };
