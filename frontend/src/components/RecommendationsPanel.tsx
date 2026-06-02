import RecommendationCard from "./RecommendationCards";
import type { useRecommendations } from "../tests/FetchData.tsx";

type RecommendationsPanelProps = {
  data: ReturnType<typeof useRecommendations>["data"];
  loading: boolean;
  error: Error | null;
};

export default function RecommendationsPanel({ data, loading, error }: RecommendationsPanelProps) {
  if (loading) return <div className="px-5 py-4 text-sm text-slate-600">Loading recommendations...</div>;
  if (error) return <div className="px-5 py-4 text-sm text-red-600">Error: {error.message}</div>;

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recommendations</h2>
          <p className="text-sm text-slate-500">The list updates as you change the user ID, coordinates, context, or radius.</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
          {data.length} matches
        </span>
      </div>

      {data.length === 0 ? (
        <div className="px-5 py-6 text-sm text-slate-600">
          No recommendations yet. Enter a user ID or a latitude/longitude pair to fetch results.
        </div>
      ) : (
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <RecommendationCard
              key={item.id}
              name={item.name}
              category={item.category}
              rating={item.rating ?? 0}
              distanceKm={item.distanceKm}
              recommendationScore={item.recommendationScore}
              recommendationReason={item.recommendationReason}
              isOpen={item.isOpen}
            />
          ))}
        </div>
      )}
    </>
  );
}