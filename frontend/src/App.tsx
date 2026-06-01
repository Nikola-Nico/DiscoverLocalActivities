import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RecommendationCard from "./components/RecommendationCards";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { FetchActivities, FetchUsers } from "./tests/FetchData.tsx";

type MapMarker = {
  latitude: number;
  longitude: number;
  popup: string;
};

const activityMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function App() {
  const [view, setView] = useState<"activities" | "users">("activities");

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-emerald-50 to-emerald-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Recommended Activities
          </h1>

          <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
            Discover recommended local places, then explore them on a live Leaflet map.
          </p>
        </div>

        <section className="mb-8 overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div id="filter" className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 px-5 py-4">
            <button
              type="button"
              onClick={() => setView("activities")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                view === "activities"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Activities
            </button>
            <button
              type="button"
              onClick={() => setView("users")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                view === "users"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Users
            </button>
          </div>

          <MapPanel view={view} />
          {view === "activities" ? <ActivitiesPanel /> : <UsersPanel />}
        </section>
      </div>
    </main>
  );
}

function MapPanel({ view }: { view: "activities" | "users" }) {
  const activitiesResult = FetchActivities();
  const usersResult = FetchUsers();

  const markers: MapMarker[] =
    view === "activities"
      ? activitiesResult.data.map((activity) => ({
          latitude: activity.latitude,
          longitude: activity.longitude,
          popup: `<strong>${activity.name}</strong><br />${activity.type}<br />⭐ ${activity.rating}`,
        }))
      : usersResult.data.map((user) => ({
          latitude: user.latitude,
          longitude: user.longitude,
          popup: `<strong>${user.name} ${user.surname}</strong><br />${user.destination}<br />${user.email}`,
        }));

  const loading = view === "activities" ? activitiesResult.loading : usersResult.loading;
  const error = view === "activities" ? activitiesResult.error : usersResult.error;

  return (
    <div className="border-b border-slate-200/80 px-5 py-4">
      <h2 className="text-lg font-semibold text-slate-900">
        {view === "activities" ? "Map overview" : "User locations"}
      </h2>
      <p className="text-sm text-slate-500">
        Leaflet tiles stay visible while the pins switch between activities and users.
      </p>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
        <MapView markers={markers} loading={loading} error={error} />
      </div>
    </div>
  );
}

function ActivitiesPanel() {
  const { data, loading, error } = FetchActivities();

  if (loading) return <div className="px-5 py-4 text-sm text-slate-600">Loading activities...</div>;
  if (error) return <div className="px-5 py-4 text-sm text-red-600">Error: {error.message}</div>;

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

      <div className="grid gap-4 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((activity) => (
          <RecommendationCard
            key={activity.name}
            name={activity.name}
            category={activity.type}
            rating={activity.rating}
            phone={activity.phone_number}
          />
        ))}
      </div>
    </>
  );
}

function MapView({
  markers,
  loading,
  error,
}: {
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || loading || error) return;

    const map = L.map(mapContainerRef.current).setView([41.9981, 21.4254], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markers.forEach(({ latitude, longitude, popup }) => {
      L.marker([latitude, longitude], { icon: activityMarkerIcon })
        .addTo(map)
        .bindPopup(popup);
    });

    return () => {
      map.remove();
    };
  }, [markers, loading, error]);

  if (loading) return <MapPlaceholder text="Loading map data..." />;
  if (error) return <MapPlaceholder text={`Error: ${error.message}`} error />;

  return <div ref={mapContainerRef} className="w-full" style={{ height: 420 }} />;
}

function MapPlaceholder({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      style={{ height: 420 }}
      className={`flex items-center justify-center text-sm ${error ? "text-red-600" : "text-slate-600"}`}
    >
      {text}
    </div>
  );
}

function UsersPanel() {
  const { data, loading, error } = FetchUsers();

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

export default App;