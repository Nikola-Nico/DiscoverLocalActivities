import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import RecommendationCard from "./RecommendationCards";
import type { useRecommendations } from "../../tests/FetchData";

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

  if (loading)
    return <div className="px-6 py-5 text-sm text-muted-foreground">Loading recommendations...</div>;
  if (error)
    return <div className="px-6 py-5 text-sm text-destructive">Error: {error.message}</div>;

  const visibleRecommendations = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, data.length));
  };

  return (
    <>
      <div className="flex items-end justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recommendations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The list updates as you change the user ID, coordinates, context, or radius.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-gradient-pill px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-pill">
          {data.length} matches
        </span>
      </div>

      {data.length === 0 ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">
          No recommendations yet. Enter a user ID or a latitude/longitude pair to fetch results.
        </div>
      ) : (
        <InfiniteScroll
          dataLength={visibleRecommendations.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="px-6 py-5 text-sm text-muted-foreground">
              Loading more recommendations...
            </div>
          }
          endMessage={
            <div className="px-6 py-5 text-sm text-muted-foreground">
              You have reached the end of the recommendations.
            </div>
          }
          style={{ overflow: "visible" }}
        >
          <div className="grid gap-6 px-6 py-6 md:grid-cols-2 lg:grid-cols-3">
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
                latitude={item.latitude}
                longitude={item.longitude}
                // phone={item.phone}
                context={item.context}
                // userRatingCount={item.userRatingCount}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
}
