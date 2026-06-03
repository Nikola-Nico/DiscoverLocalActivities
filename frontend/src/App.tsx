// import { createFileRoute } from ".tanstack/react-router";
import { useState } from "react";
import ActivitiesPanel from "./components/ActivitiesPanel";
import MapPanel from "./components/maps/MapPanel";
import RecommendationFilters from "./components/recommendations/RecommendationFilters";
import RecommendationsPanel from "./components/recommendations/RecommendationsPanel";
import UsersPanel from "./components/UsersPanel";
import {
  useFetchActivities,
  useFetchUsers,
  useRecommendations,
} from "./tests/FetchData";
import type { MapMarker, ViewMode } from "./components/maps/mapTypes";




function App() {
  const [view, setView] = useState<ViewMode>("activities");
  const [userId, setUserId] = useState("");
  const [userFullName, setUserFullName] = useState("");
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
    <ActivitiesPanel
      data={activitiesResult.data}
      loading={activitiesResult.loading}
      error={activitiesResult.error}
    />
  );

  return (
    <main className="min-h-screen bg-gradient-soft p-6 text-foreground">
      <div className="mx-auto max-w-6xl">
        {/* Top nav */}
        <header className="mb-10 flex items-center justify-between rounded-full border border-border bg-card/80 px-6 py-3 shadow-card backdrop-blur">
          <div className="text-xl font-extrabold">
            <span className="text-gradient-hubby">Hubby</span>
          </div>
          <nav className="hidden gap-8 text-sm font-medium text-foreground/80 md:flex">
            <a href="#" className="hover:text-foreground">Activities</a>
            <a href="#" className="hover:text-foreground">Map</a>
            <a href="#" className="hover:text-foreground">Help</a>
          </nav>
          <button className="rounded-full bg-gradient-pill px-5 py-2 text-sm font-semibold text-primary-foreground shadow-pill">
            Get the app
          </button>
        </header>

        {/* Hero */}
        <div className="mb-8 flex flex-col gap-3 text-center md:text-left">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            Recommended Activities
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Discover recommended local places, then explore them on a live Leaflet map.
          </p>
        </div>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-4">
            {(["activities", "users"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all ${
                  view === v
                    ? "bg-gradient-pill text-primary-foreground shadow-pill"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
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

          {view === "users" ? (
            <UsersPanel
              data={usersResult.data}
              loading={usersResult.loading}
              error={usersResult.error}
            />
          ) : (
            recommendationPanel
          )}
        </section>

        <footer className="pb-6 text-center text-xs text-muted-foreground">
          Built with React, Tailwind, Leaflet & react-infinite-scroll-component.
        </footer>
      </div>
    </main>
  );
}


export default App