import MapView from "./MapView";
import type { MapMarker, ViewMode } from "./mapTypes";

type MapPanelProps = {
  view: ViewMode;
  recommendationMode: boolean;
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
  userId: string,
};

export default function MapPanel({
  view,
  recommendationMode,
  markers,
  loading,
  error,
  userId,
}: MapPanelProps) {
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
    <div className="border-b border-border px-6 py-5">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-muted shadow-card">
        <MapView markers={markers} loading={loading} error={error} userId={userId}/>
      </div>
    </div>
  );
}
