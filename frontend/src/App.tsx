// import { createFileRoute } from ".tanstack/react-router";
import { useState } from "react";
import ActivitiesPanel from "./components/ActivitiesPanel";
import MapPanel from "./components/maps/MapPanel";
import RecommendationFilters from "./components/recommendations/RecommendationFilters";
import RecommendationsPanel from "./components/recommendations/RecommendationsPanel";
import {
  useFetchActivities,
  useFetchUsers,
  useRecommendations,
} from "./tests/FetchData";
import type { MapMarker, ViewMode } from "./components/maps/mapTypes";

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
  const recommendationMode =
    view === "activities" && (hasUserId || hasCoordinates);

  const selectedUser = usersResult.data.find(
    (u: any) => u.id?.toString() === userId,
  );

  const activityMarkers: MapMarker[] = activitiesResult.data.map(
    (activity) => ({
      latitude: activity.latitude,
      longitude: activity.longitude,
      popup: `<strong>${activity.name}</strong><br />${activity.type}<br />⭐ ${activity.rating ?? "n/a"}`,
    }),
  );

  const recommendationMarkers: MapMarker[] = recommendationsResult.data.map(
    (item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      popup: `<strong>${item.name}</strong><br />${item.category}<br />⭐ ${item.rating ?? "n/a"}<br />${item.distanceKm.toFixed(2)} km away`,
    }),
  );

  const userLocationMarker: MapMarker | null = selectedUser
    ? {
        latitude: selectedUser.latitude,
        longitude: selectedUser.longitude,
        popup: `<strong>${selectedUser.name} ${selectedUser.surname}</strong><br />Current Location`,
        isUserLocation: true,
      }
    : hasCoordinates
      ? {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          popup: `<strong>Selected Location</strong>`,
          isUserLocation: true,
        }
      : null;

  const mapMarkers = recommendationMode
    ? userLocationMarker
      ? [userLocationMarker, ...recommendationMarkers]
      : recommendationMarkers
    : activityMarkers;

  const mapLoading = recommendationMode
    ? recommendationsResult.loading
    : activitiesResult.loading;

  const mapError = recommendationMode
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
        </header>

        {/* Hero */}
        <div className="mb-8 flex flex-col gap-3 text-center md:text-left">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            Discover Local Activities
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Find great spots and fun activities right in your own neighborhood.
            Exploring these nearby places helps you enjoy where you live even
            more.
          </p>
        </div>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
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
              users={usersResult.data}
            />
          )}
          <div className="relative z-0 isolate">
            <MapPanel
              view={view}
              recommendationMode={recommendationMode}
              markers={mapMarkers}
              loading={mapLoading}
              error={mapError}
            />
          </div>

          {recommendationPanel}
        </section>

        <footer className="pb-6 text-center text-xs text-muted-foreground">
          Built with React, Tailwind, Leaflet & react-infinite-scroll-component.
        </footer>
      </div>
    </main>
  );
}

export default App;
