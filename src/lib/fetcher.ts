const BASE = "https://api.spacexdata.com/v4";

type RevalidateOpt = {
  revalidate?: number;
};

const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffMs(retry: number) {
  return INITIAL_BACKOFF_MS * 2 ** retry;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  opts?: RevalidateOpt,
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const finalInit: RequestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  };

  if (opts?.revalidate !== undefined) {
    (
      finalInit as RequestInit & {
        next?: { revalidate: number };
      }
    ).next = {
      revalidate: opts.revalidate,
    };
  }

  for (let retry = 0; retry <= MAX_RETRIES; retry++) {
    try {
      const res = await fetch(url, finalInit);

      const shouldRetry =
        (res.status === 429 || res.status >= 500) && retry < MAX_RETRIES;

      if (!res.ok) {
        if (shouldRetry) {
          await sleep(getBackoffMs(retry));
          continue;
        }

        throw new Error(`${res.status} ${res.statusText}`);
      }

      return res.json() as Promise<T>;
    } catch (error) {
      // Retry only network-related fetch failures
      if (!(error instanceof TypeError) || retry === MAX_RETRIES) {
        throw error;
      }

      await sleep(getBackoffMs(retry));
    }
  }

  throw new Error("Request failed");
}

export function apiGet<T>(path: string, opts?: RevalidateOpt): Promise<T> {
  return request<T>(
    path,
    {
      method: "GET",
    },
    opts,
  );
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  opts?: RevalidateOpt,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    },
    opts,
  );
}

const api = {
  get: apiGet,
  post: apiPost,
};

export default api;
