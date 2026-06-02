import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import MapPlaceholder from "./MapPlaceholder";
import type { MapMarker } from "./mapTypes";

const activityMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapViewProps = {
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
};

export default function MapView({ markers, loading, error }: MapViewProps) {
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