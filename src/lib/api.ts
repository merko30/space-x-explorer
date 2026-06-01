import type {
  FetchOptions,
  FetchResult,
  Launch,
  LaunchQuery,
  SpaceXLaunch,
  SpaceXLaunchResponse,
} from "./types";

export type { Launch, FetchResult, FetchOptions } from "./types";
import fetcher from "./fetcher";

function buildQuery(opts: FetchOptions): LaunchQuery {
  const q: LaunchQuery = {};

  if (opts.upcoming === true) q.upcoming = true;
  if (opts.upcoming === false) q.upcoming = false;
  if (typeof opts.success === "boolean") q.success = opts.success;
  if (opts.search) q.name = { $regex: opts.search, $options: "i" };
  if (opts.startDate || opts.endDate) q.date_utc = {};
  if (opts.startDate) q.date_utc!.$gte = opts.startDate;
  if (opts.endDate) q.date_utc!.$lte = opts.endDate;

  return q;
}

export async function fetchLaunches(
  opts: FetchOptions = {},
): Promise<FetchResult> {
  const { page = 1, limit = 10 } = opts;
  const query = buildQuery(opts);

  const sortField = opts.sortBy === "name" ? "name" : "date_utc";
  const sortDirection = sortField === "name" ? "asc" : "desc";

  const json = await fetcher.post<SpaceXLaunchResponse>(
    "/launches/query",
    {
      query,
      options: {
        page,
        limit,
        sort: { [sortField]: sortDirection },
        select: {
          name: 1,
          date_utc: 1,
          success: 1,
          links: 1,
        },
      },
    },
    { revalidate: 60 },
  );

  const docs: Launch[] = (json.docs || []).map((d) => ({
    id: d.id,
    name: d.name,
    date_utc: d.date_utc,
    success: d.success,
    image: getLaunchImage(d),
  }));

  return { docs, totalDocs: json.totalDocs ?? docs.length };
}

export async function fetchLaunchById(
  id: string,
): Promise<SpaceXLaunch | null> {
  try {
    const json = await fetcher.get<SpaceXLaunch>(`/launches/${id}`, {
      revalidate: 60,
    });
    return json;
    // todo: fix
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith("404")) return null;
    throw err;
  }
}

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
