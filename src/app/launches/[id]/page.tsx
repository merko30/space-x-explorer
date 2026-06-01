import { notFound } from "next/navigation";
import type { SpaceXLaunch } from "../../../lib/types";
import { fetchLaunchById } from "../../../lib/api";

type Props = {
  params: { id: string };
};

export default async function LaunchDetailPage({ params }: Props) {
  const { id } = await params;

  if (!id) return notFound();

  let launch: SpaceXLaunch | null = null;
  try {
    launch = await fetchLaunchById(id);
  } catch (err) {
    console.error(err);
    throw err;
  }

  console.log("Fetched launch:", launch);

  if (!launch) return notFound();

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{launch.name}</h1>
        <p className="text-sm text-slate-500">{formattedDate}</p>
        <p className="mt-2 text-sm">{launch.details}</p>
      </header>

      <section>
        <h2 className="text-lg font-medium">Image gallery</h2>
        {flickr.length === 0 ? (
          <p className="text-sm text-slate-500">No gallery images available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {flickr.map((src, i) =>
              src ? (
                <img
                  key={i}
                  src={src}
                  alt={`${launch.name} image ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : null,
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium">Links</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {launch.links?.webcast ? (
            <a
              href={launch.links.webcast}
              target="_blank"
              rel="noreferrer"
              className="text-sm px-3 py-1 rounded bg-slate-900 text-white"
            >
              Watch
            </a>
          ) : null}
          {launch.links?.article ? (
            <a
              href={launch.links.article}
              target="_blank"
              rel="noreferrer"
              className="text-sm px-3 py-1 rounded border"
            >
              Article
            </a>
          ) : null}
          {launch.links?.wikipedia ? (
            <a
              href={launch.links.wikipedia}
              target="_blank"
              rel="noreferrer"
              className="text-sm px-3 py-1 rounded border"
            >
              Wikipedia
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
