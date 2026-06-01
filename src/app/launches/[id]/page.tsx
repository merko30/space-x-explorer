import Image from "next/image";
import { notFound } from "next/navigation";
import type {
  SpaceXLaunch,
  SpaceXRocket,
  SpaceXLaunchpad,
} from "../../../lib/types";
import {
  fetchLaunchById,
  fetchRocketById,
  fetchLaunchpadById,
} from "../../../lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export default async function LaunchDetailPage({ params }: Props) {
  const { id } = await params;

  if (!id) return notFound();

  let launch: SpaceXLaunch | null = null;
  let rocket: SpaceXRocket | null = null;
  let launchpad: SpaceXLaunchpad | null = null;

  try {
    launch = await fetchLaunchById(id);
    if (!launch) return notFound();

    const [rocketResult, launchpadResult] = await Promise.all([
      launch.rocket ? fetchRocketById(launch.rocket) : Promise.resolve(null),
      launch.launchpad
        ? fetchLaunchpadById(launch.launchpad)
        : Promise.resolve(null),
    ]);

    rocket = rocketResult;
    launchpad = launchpadResult;
  } catch (err) {
    console.error(err);
    throw err;
  }

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

  const flickr = launch.links?.flickr?.original || [];

  const videoLink = launch.links?.webcast;
  const articleLink = launch.links?.article;
  const wikipediaLink = launch.links?.wikipedia;

  const links = [
    { label: "Watch", url: videoLink },
    { label: "Article", url: articleLink },
    { label: "Wikipedia", url: wikipediaLink },
  ].filter((link) => link.url) as Array<{ label: string; url: string }>;
  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-slate-950 px-6 py-6 text-white shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {launch.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{formattedDate}</p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200">
            {launch.upcoming ? "Upcoming launch" : "Past launch"}
          </div>
        </div>
        {launch.details ? (
          <p className="mt-4 max-w-3xl text-sm text-slate-300">
            {launch.details}
          </p>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-950 p-5 text-slate-200 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold">Rocket</h2>
          {rocket ? (
            <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
              {rocket.flickr_images && rocket.flickr_images.length > 0 ? (
                <Image
                  src={rocket.flickr_images[0]}
                  alt={`${rocket.name} image`}
                  width={320}
                  height={320}
                  sizes="220px"
                  className="h-64 w-full rounded-3xl object-cover md:h-full"
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 text-sm text-slate-500 md:h-full">
                  No rocket image available
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {rocket.name}
                  </p>
                  {rocket.type ? (
                    <p className="text-sm text-slate-400">{rocket.type}</p>
                  ) : null}
                </div>
                {rocket.description ? (
                  <p className="text-sm leading-7 text-slate-300">
                    {rocket.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    No description available.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-400">
              Rocket information is not available.
            </p>
          )}
          <div className="rounded-3xl bg-slate-950 p-5 text-slate-200 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold">Links</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                >
                  {link.label}
                </a>
              ))}
              {links.length === 0 && (
                <p className="text-sm text-slate-400">
                  No links available for this launch.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-5 text-slate-200 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold">Launchpad</h2>
            {launchpad ? (
              <div className="mt-5 space-y-3">
                <p className="text-lg font-semibold text-white">
                  {launchpad.name}
                </p>
                <p className="text-sm text-slate-400">
                  {launchpad.locality || "Unknown locality"},{" "}
                  {launchpad.region || "Unknown region"}
                </p>
                {launchpad.details ? (
                  <p className="text-sm leading-7 text-slate-300">
                    {launchpad.details}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    No launchpad details available.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-400">
                Launchpad information is not available.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100">Image gallery</h2>
        {flickr.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            No gallery images available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flickr.map((src, i) =>
              src ? (
                <Image
                  key={i}
                  src={src}
                  alt={`${launch.name} image ${i + 1}`}
                  width={420}
                  height={280}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-56 w-full rounded-3xl object-cover"
                />
              ) : null,
            )}
          </div>
        )}
      </section>
    </div>
  );
}
