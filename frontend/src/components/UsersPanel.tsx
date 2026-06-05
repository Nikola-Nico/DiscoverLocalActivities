import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import type { useFetchUsers } from "../tests/FetchData";

const PAGE_SIZE = 12;

type UsersPanelProps = {
  data: ReturnType<typeof useFetchUsers>["data"];
  loading: boolean;
  error: Error | null;
};

export default function UsersPanel({ data, loading, error }: UsersPanelProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [data]);

  if (loading)
    return <div className="px-6 py-5 text-sm text-muted-foreground">Loading users...</div>;
  if (error)
    return <div className="px-6 py-5 text-sm text-destructive">Error: {error.message}</div>;

  const visibleUsers = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, data.length));
  };

  return (
    <InfiniteScroll
      dataLength={visibleUsers.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div className="px-6 py-5 text-sm text-muted-foreground">Loading more users...</div>
      }
      endMessage={
        <div className="px-6 py-5 text-sm text-muted-foreground">
          You have reached the end of the user list.
        </div>
      }
      style={{ overflow: "visible" }}
    >
      <div className="grid gap-6 px-6 py-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleUsers.map((user) => (
          <div
            key={`${user.name}-${user.email}`}
            className="rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-pill"
          >
            <h3 className="text-xl font-bold text-card-foreground">
              {user.name} {user.surname}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.destination}</p>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
