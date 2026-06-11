import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import RecommendationCard from "./recommendations/RecommendationCards";
import type { useFetchActivities } from "../data/FetchData";

const PAGE_SIZE = 12;

type ActivitiesPanelProps = {
  data: ReturnType<typeof useFetchActivities>["data"];
  loading: boolean;
  error: Error | null;
};

export default function ActivitiesPanel({ data, loading, error }: ActivitiesPanelProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [data]);

  if (loading)
    return <div className="px-6 py-5 text-sm text-muted-foreground">Loading activities...</div>;
  if (error)
    return <div className="px-6 py-5 text-sm text-destructive">Error: {error.message}</div>;

  const visibleActivities = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, data.length));
  };

  return (
    <>
      <div className="flex items-end justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recommended places loaded from the backend.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-gradient-pill px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-pill">
          {data.length} spots
        </span>
      </div>

      <InfiniteScroll
        dataLength={visibleActivities.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="px-6 py-5 text-sm text-muted-foreground">
            Loading more activities...
          </div>
        }
        endMessage={
          <div className="px-6 py-5 text-sm text-muted-foreground">
            You have reached the end of the activity list.
          </div>
        }
        style={{ overflow: "visible" }}
      >
        <div className="grid gap-6 px-6 py-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleActivities.map((activity) => (
            <RecommendationCard
              key={activity.id}
              name={activity.name}
              category={activity.type}
              rating={activity.rating}
              phone={activity.phone_number}
              latitude={activity.latitude}
              longitude={activity.longitude}
              workingHours={activity.working_hours} // Pass down
              userRatingCount={activity.user_rating_count} // Pass down
              isOpen={(activity as any).is_open} // Pass down
            />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
}
