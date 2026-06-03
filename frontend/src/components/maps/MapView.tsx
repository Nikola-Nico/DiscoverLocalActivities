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
      const markerShadow = (
        await import("leaflet/dist/images/marker-shadow.png")
      ).default;

      if (cancelled || !mapContainerRef.current) return;

      const icon = L.divIcon({
        html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="#ff7453" d="M352 348.4C416.1 333.9 464 276.5 464 208C464 128.5 399.5 64 320 64C240.5 64 176 128.5 176 208C176 276.5 223.9 333.9 288 348.4L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 348.4zM328 160C297.1 160 272 185.1 272 216C272 229.3 261.3 240 248 240C234.7 240 224 229.3 224 216C224 158.6 270.6 112 328 112C341.3 112 352 122.7 352 136C352 149.3 341.3 160 328 160z"/></svg>        `,
        className: "",
        iconSize: [30, 30],
      });

      const userIcon = L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      map = L.map(mapContainerRef.current).setView([41.9981, 21.4254], 13);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      markers.forEach(({ latitude, longitude, popup, isUserLocation }) => {
        L.marker([latitude, longitude], {
          icon: isUserLocation ? userIcon : icon,
        })
          .addTo(map!)
          .bindPopup(popup);
      });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [markers, loading, error, mounted]);

  if (loading) return <MapPlaceholder text="Loading map data..." />;
  if (error) return <MapPlaceholder text={`Error: ${error.message}`} error />;

  return (
    <div ref={mapContainerRef} className="w-full" style={{ height: 420 }} />
  );
}
