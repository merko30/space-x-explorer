import LaunchesClient from "@/components/LaunchesClient";
import { fetchLaunches } from "@/lib/api";

export default async function HomePage() {
  const initial = await fetchLaunches({ page: 1, limit: 10 });

  return (
    <div className="mx-auto max-w-7xl">
      <LaunchesClient
        initialLaunches={initial.docs}
        totalDocs={initial.totalDocs}
      />
    </div>
  );
}
