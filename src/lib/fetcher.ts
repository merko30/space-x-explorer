const BASE = "https://api.spacexdata.com/v4";

type RevalidateOpt = { revalidate?: number };

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

  const res = await fetch(url, finalInit);
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    const msg = text || res.statusText;
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
