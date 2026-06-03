import { useEffect, useRef, useState } from "react";
import MapPlaceholder from "./MapPlaceholder";
import type { MapMarker } from "./mapTypes";

type MapViewProps = {
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
};

export default function MapView({ markers, loading, error }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || loading || error) return;

    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      const markerIcon = (await import("leaflet/dist/images/marker-icon.png")).default;
      const markerIcon2x = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
      const markerShadow = (await import("leaflet/dist/images/marker-shadow.png")).default;

      if (cancelled || !mapContainerRef.current) return;

      const icon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      map = L.map(mapContainerRef.current).setView([41.9981, 21.4254], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      markers.forEach(({ latitude, longitude, popup }) => {
        L.marker([latitude, longitude], { icon }).addTo(map!).bindPopup(popup);
      });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [markers, loading, error, mounted]);

  if (loading) return <MapPlaceholder text="Loading map data..." />;
  if (error) return <MapPlaceholder text={`Error: ${error.message}`} error />;

  return <div ref={mapContainerRef} className="w-full" style={{ height: 420 }} />;
}
