import MapView from "./MapView";
import type { MapMarker, ViewMode } from "./mapTypes";

type MapPanelProps = {
  view: ViewMode;
  recommendationMode: boolean;
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
};

export default function MapPanel({
  view,
  recommendationMode,
  markers,
  loading,
  error,
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
    <div className="border-b border-slate-200/80 px-5 py-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
        <MapView markers={markers} loading={loading} error={error} />
      </div>
    </div>
  );
}