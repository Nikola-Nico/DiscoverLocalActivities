import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import RecommendationCard from "./RecommendationCards";
import type { useRecommendations } from "../tests/FetchData.tsx";

const PAGE_SIZE = 12;

type RecommendationsPanelProps = {
  data: ReturnType<typeof useRecommendations>["data"];
  loading: boolean;
  error: Error | null;
};

export default function RecommendationsPanel({ data, loading, error }: RecommendationsPanelProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [data]);

  if (loading) return <div className="px-5 py-4 text-sm text-slate-600">Loading recommendations...</div>;
  if (error) return <div className="px-5 py-4 text-sm text-red-600">Error: {error.message}</div>;

  const visibleRecommendations = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount((currentCount) => Math.min(currentCount + PAGE_SIZE, data.length));
  };

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
        <InfiniteScroll
          dataLength={visibleRecommendations.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<div className="px-5 py-4 text-sm text-slate-600">Loading more recommendations...</div>}
          endMessage={<div className="px-5 py-4 text-sm text-slate-500">You have reached the end of the recommendations.</div>}
        >
          <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleRecommendations.map((item) => (
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
        </InfiniteScroll>
      )}
    </>
  );
}