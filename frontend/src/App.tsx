import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RecommendationCard from "./components/RecommendationCards";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const activities = [
  {
    name: "Gluvo Kuče",
    category: "bar",
    rating: 4.6,
    phone: "+389 71 721 545",
    priceLevel: "Moderate",
    latitude: 41.9968,
    longitude: 21.4316,
  },
  {
    name: "Fitness House",
    category: "restaurant",
    rating: 3.9,
    phone: "+389 72 699 999",
    priceLevel: "Moderate",
    latitude: 41.9997,
    longitude: 21.4179,
  },
  {
    name: "Bar Kino Karpoš",
    category: "bar",
    rating: 4.5,
    phone: "+389 2 321 3515",
    priceLevel: "Moderate",
    latitude: 42.0021,
    longitude: 21.3972,
  },
  {
    name: "Cafe Bar Che",
    category: "coffee shop",
    rating: 4.7,
    phone: "+389 71 696 063",
    priceLevel: "Inexpensive",
    latitude: 41.9972,
    longitude: 21.4258,
  },
  {
    name: "The Brunch Cafe",
    category: "restaurant",
    rating: 4.7,
    phone: "+389 77 661 424",
    latitude: 41.9929,
    longitude: 21.4342,
  },
  {
    name: "Amigos Mexican Restaurant & Bar",
    category: "mexican restaurant",
    rating: 4.5,
    phone: "+389 71 230 315",
    priceLevel: "Moderate",
    latitude: 41.9937,
    longitude: 21.4227,
  },
];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current).setView([41.9981, 21.4254], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    activities.forEach((activity) => {
      L.marker([activity.latitude, activity.longitude])
        .addTo(map)
        .bindPopup(
          `<strong>${activity.name}</strong><br />${activity.category}<br />⭐ ${activity.rating}`,
        );
    });

    return () => {
      map.remove();
    };
  }, []);

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
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Map overview</h2>
              <p className="text-sm text-slate-500">Leaflet tiles and markers are loaded directly in React.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
              {activities.length} spots
            </span>
          </div>

          <div ref={mapContainerRef} className="w-full" style={{ height: 420 }} />
        </section>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <RecommendationCard
              key={activity.name}
              name={activity.name}
              category={activity.category}
              rating={activity.rating}
              phone={activity.phone}
              priceLevel={activity.priceLevel}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;