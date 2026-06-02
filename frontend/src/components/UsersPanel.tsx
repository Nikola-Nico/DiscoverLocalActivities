import type { useFetchUsers } from "../tests/FetchData.tsx";

type UsersPanelProps = {
  data: ReturnType<typeof useFetchUsers>["data"];
  loading: boolean;
  error: Error | null;
};

export default function UsersPanel({ data, loading, error }: UsersPanelProps) {
  if (loading) return <div className="px-5 py-4 text-sm text-slate-600">Loading users...</div>;
  if (error) return <div className="px-5 py-4 text-sm text-red-600">Error: {error.message}</div>;

  return (
    <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
      {data.map((user) => (
        <div
          key={`${user.name}-${user.email}`}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition hover:shadow-lg"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            {user.name} {user.surname}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          <p className="mt-1 text-sm text-slate-600">{user.destination}</p>
        </div>
      ))}
    </div>
  );
}