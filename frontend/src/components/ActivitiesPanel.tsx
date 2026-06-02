import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import RecommendationCard from "./recommendations/RecommendationCards";
import type { useFetchActivities } from "../tests/FetchData.tsx";

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

  if (loading) return <div className="px-5 py-4 text-sm text-slate-600">Loading activities...</div>;
  if (error) return <div className="px-5 py-4 text-sm text-red-600">Error: {error.message}</div>;

  const visibleActivities = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount((currentCount) => Math.min(currentCount + PAGE_SIZE, data.length));
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Activities</h2>
          <p className="text-sm text-slate-500">Recommended places loaded from the backend.</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
          {data.length} spots
        </span>
      </div>

      <InfiniteScroll
        dataLength={visibleActivities.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="px-5 py-4 text-sm text-slate-600">Loading more activities...</div>}
        endMessage={<div className="px-5 py-4 text-sm text-slate-500">You have reached the end of the activity list.</div>}
      >
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleActivities.map((activity) => (
            <RecommendationCard
              key={activity.id}
              name={activity.name}
              category={activity.type}
              rating={activity.rating}
              phone={activity.phone_number}
            />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
}