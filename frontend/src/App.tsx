import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RecommendationCard from "./components/RecommendationCards";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useFetchActivities, useFetchUsers, useRecommendations } from "./tests/FetchData.tsx";

type MapMarker = {
  latitude: number;
  longitude: number;
  popup: string;
};

type ViewMode = "activities" | "users";

const CONTEXT_OPTIONS = [
  "general",
  "breakfast",
  "coffee",
  "lunch",
  "dinner",
  "nightlife",
  "culture",
  "travel",
  "family",
  "outdoors",
  "shopping",
  "wellness",
] as const;

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
  const [view, setView] = useState<ViewMode>("activities");
  const [userId, setUserId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [context, setContext] = useState("");
  const [radiusKm, setRadiusKm] = useState("");

  const activitiesResult = useFetchActivities();
  const usersResult = useFetchUsers();
  const recommendationsResult = useRecommendations({
    id: userId,
    lat,
    lng,
    context,
    radius_km: radiusKm,
  });

  const hasUserId = userId.trim().length > 0;
  const hasCoordinates = lat.trim().length > 0 && lng.trim().length > 0;
  const recommendationMode = view === "activities" && (hasUserId || hasCoordinates);

  const activityMarkers: MapMarker[] = activitiesResult.data.map((activity) => ({
    latitude: activity.latitude,
    longitude: activity.longitude,
    popup: `<strong>${activity.name}</strong><br />${activity.type}<br />⭐ ${activity.rating ?? "n/a"}`,
  }));

  const recommendationMarkers: MapMarker[] = recommendationsResult.data.map((item) => ({
    latitude: item.latitude,
    longitude: item.longitude,
    popup: `<strong>${item.name}</strong><br />${item.category}<br />⭐ ${item.rating ?? "n/a"}<br />${item.distanceKm.toFixed(2)} km away`,
  }));

  const userMarkers: MapMarker[] = usersResult.data.map((user) => ({
    latitude: user.latitude,
    longitude: user.longitude,
    popup: `<strong>${user.name} ${user.surname}</strong><br />${user.destination}<br />${user.email}`,
  }));

  const mapMarkers =
    view === "users"
      ? userMarkers
      : recommendationMode
        ? recommendationMarkers
        : activityMarkers;

  const mapLoading =
    view === "users"
      ? usersResult.loading
      : recommendationMode
        ? recommendationsResult.loading
        : activitiesResult.loading;

  const mapError =
    view === "users"
      ? usersResult.error
      : recommendationMode
        ? recommendationsResult.error
        : activitiesResult.error;

  const recommendationPanel = recommendationMode ? (
    <RecommendationsPanel data={recommendationsResult.data} loading={recommendationsResult.loading} error={recommendationsResult.error} />
  ) : (
    <ActivitiesPanel data={activitiesResult.data} loading={activitiesResult.loading} error={activitiesResult.error} />
  );

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

            {view === "activities" && (
              <RecommendationFilters
                userId={userId}
                setUserId={setUserId}
                lat={lat}
                setLat={setLat}
                lng={lng}
                setLng={setLng}
                context={context}
                setContext={setContext}
                radiusKm={radiusKm}
                setRadiusKm={setRadiusKm}
                recommendationMode={recommendationMode}
              />
            )}

            <MapPanel
              view={view}
              recommendationMode={recommendationMode}
              markers={mapMarkers}
              loading={mapLoading}
              error={mapError}
            />

            {view === "users" ? <UsersPanel data={usersResult.data} loading={usersResult.loading} error={usersResult.error} /> : recommendationPanel}
        </section>
      </div>
    </main>
  );
}

  function MapPanel({
    view,
    recommendationMode,
    markers,
    loading,
    error,
  }: {
    view: ViewMode;
    recommendationMode: boolean;
    markers: MapMarker[];
    loading: boolean;
    error: Error | null;
  }) {
    const title =
      view === "users"
        ? "User locations"
        : recommendationMode
          ? "Recommendation map"
          : "Activity map";
    const description =
      view === "users"
        ? "Leaflet tiles stay visible while the pins switch to user locations."
        : recommendationMode
          ? "Filtered recommendations are plotted using the active user ID or coordinate inputs."
          : "All fetched activities are plotted by default until you enter recommendation filters.";

    return (
      <div className="border-b border-slate-200/80 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          <MapView markers={markers} loading={loading} error={error} />
        </div>
      </div>
    );
}

  function ActivitiesPanel({
    data,
    loading,
    error,
  }: {
    data: ReturnType<typeof useFetchActivities>["data"];
    loading: boolean;
    error: Error | null;
  }) {
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
            key={activity.id}
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

function RecommendationsPanel({
  data,
  loading,
  error,
}: {
  data: ReturnType<typeof useRecommendations>["data"];
  loading: boolean;
  error: Error | null;
}) {
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

function RecommendationFilters({
  userId,
  setUserId,
  lat,
  setLat,
  lng,
  setLng,
  context,
  setContext,
  radiusKm,
  setRadiusKm,
  recommendationMode,
}: {
  userId: string;
  setUserId: (value: string) => void;
  lat: string;
  setLat: (value: string) => void;
  lng: string;
  setLng: (value: string) => void;
  context: string;
  setContext: (value: string) => void;
  radiusKm: string;
  setRadiusKm: (value: string) => void;
  recommendationMode: boolean;
}) {
  return (
    <div className="border-b border-slate-200/80 px-5 py-4">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          User ID
          <input
            type="number"
            min="1"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Enter a user id"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Latitude
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder="45.815"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Longitude
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder="15.981"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Context
          <select
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Choose a context</option>
            {CONTEXT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Radius km
          <input
            type="number"
            min="0"
            step="0.1"
            value={radiusKm}
            onChange={(event) => setRadiusKm(event.target.value)}
            placeholder="1.0"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          {recommendationMode ? "Recommendation mode active" : "Activities stay visible by default"}
        </span>
        <span>Use a user ID for stored-location recommendations or latitude and longitude for direct coordinates.</span>
      </div>
    </div>
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

function UsersPanel({
  data,
  loading,
  error,
}: {
  data: ReturnType<typeof useFetchUsers>["data"];
  loading: boolean;
  error: Error | null;
}) {
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