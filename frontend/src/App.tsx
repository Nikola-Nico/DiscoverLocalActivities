import { useState } from "react";
import ActivitiesPanel from "./components/ActivitiesPanel";
import MapPanel from "./components/MapPanel";
import RecommendationFilters from "./components/RecommendationFilters";
import RecommendationsPanel from "./components/RecommendationsPanel";
import UsersPanel from "./components/UsersPanel";
import { useFetchActivities, useFetchUsers, useRecommendations } from "./tests/FetchData.tsx";
import type { MapMarker, ViewMode } from "./components/mapTypes";

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
    <RecommendationsPanel
      data={recommendationsResult.data}
      loading={recommendationsResult.loading}
      error={recommendationsResult.error}
    />
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
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 px-5 py-4">
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

          <MapPanel view={view} recommendationMode={recommendationMode} markers={mapMarkers} loading={mapLoading} error={mapError} />

          {view === "users" ? (
            <UsersPanel data={usersResult.data} loading={usersResult.loading} error={usersResult.error} />
          ) : (
            recommendationPanel
          )}
        </section>
      </div>
    </main>
  );
}

export default App;