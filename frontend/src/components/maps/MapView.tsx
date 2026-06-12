import { useEffect, useRef, useState } from "react";
import MapPlaceholder from "./MapPlaceholder";
import type { MapMarker } from "./mapTypes";

type MapViewProps = {
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
  userId?: string; 
};

const DEFAULT_CENTER: [number, number] = [41.9981, 21.4254];
const DEFAULT_ZOOM = 13;
const USER_ZOOM = 14;

export default function MapView({ markers, loading, error, userId }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayersRef = useRef<import("leaflet").Marker[]>([]);
  const shadowUrlRef = useRef<string>("");
  const prevUserIdRef = useRef<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => setMounted(true), []);

  // Effect 1: init map once
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      const shadow = (await import("leaflet/dist/images/marker-shadow.png")).default;
      if (cancelled || !mapContainerRef.current) return;

      shadowUrlRef.current = shadow;
      mapRef.current = L.map(mapContainerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(mapRef.current);

      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayersRef.current = [];
      setMapReady(false);
    };
  }, [mounted]);

  // Effect 2: sync markers (no map recreation)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || loading || error) return;

    markerLayersRef.current.forEach((m) => map.removeLayer(m));
    markerLayersRef.current = [];

    (async () => {
      const L = (await import("leaflet")).default;

      const icon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#ff7453" d="M352 348.4C416.1 333.9 464 276.5 464 208C464 128.5 399.5 64 320 64C240.5 64 176 128.5 176 208C176 276.5 223.9 333.9 288 348.4L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 348.4zM328 160C297.1 160 272 185.1 272 216C272 229.3 261.3 240 248 240C234.7 240 224 229.3 224 216C224 158.6 270.6 112 328 112C341.3 112 352 122.7 352 136C352 149.3 341.3 160 328 160z"/></svg>`,
        className: "",
        iconSize: [30, 30],
      });

      const userIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: shadowUrlRef.current,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      markers.forEach(({ latitude, longitude, popup, isUserLocation }) => {
        const marker = L.marker([latitude, longitude], {
          icon: isUserLocation ? userIcon : icon,
        })
          .addTo(map)
          .bindPopup(popup);
        markerLayersRef.current.push(marker);
      });
    })();
  }, [markers, loading, error, mapReady]);

  // Effect 3: recenter only when userId actually changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (userId === prevUserIdRef.current) return;

    prevUserIdRef.current = userId;

    const userMarker = markers.find((m) => m.isUserLocation);
    if (userMarker) {
      map.setView([userMarker.latitude, userMarker.longitude], USER_ZOOM);
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [userId, markers, mapReady]);

  // if (loading) return <MapPlaceholder text="Loading map data..." />;
  // if (error) return <MapPlaceholder text={`Error: ${error.message}`} error />;

  return (
  <div style={{ height: 420 }} className="relative w-full">
    <div ref={mapContainerRef} className="h-full w-full" />

    {loading && (
      <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-card/90 text-sm text-muted-foreground">
        Loading map data...
      </div>
    )}

    {!loading && error && (
      <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-card/90 text-sm text-destructive">
        {`Error: ${error.message}`}
      </div>
    )}
  </div>
);
}