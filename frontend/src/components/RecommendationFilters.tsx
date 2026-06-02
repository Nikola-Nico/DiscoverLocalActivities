const CONTEXT_OPTIONS = [
  "general",
  "breakfast",
  "coffee",
  "lunch",
  "dinner",
  "nightlife",
  "culture",
  "travel",
  "family",
  "outdoors",
  "shopping",
  "wellness",
] as const;

type RecommendationFiltersProps = {
  userId: string;
  setUserId: (value: string) => void;
  lat: string;
  setLat: (value: string) => void;
  lng: string;
  setLng: (value: string) => void;
  context: string;
  setContext: (value: string) => void;
  radiusKm: string;
  setRadiusKm: (value: string) => void;
  recommendationMode: boolean;
};

export default function RecommendationFilters({
  userId,
  setUserId,
  lat,
  setLat,
  lng,
  setLng,
  context,
  setContext,
  radiusKm,
  setRadiusKm,
  recommendationMode,
}: RecommendationFiltersProps) {
  return (
    <div className="border-b border-slate-200/80 px-5 py-4">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          User ID
          <input
            type="number"
            min="1"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Enter a user id"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Latitude
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder="45.815"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Longitude
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder="15.981"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Context
          <select
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Choose a context</option>
            {CONTEXT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Radius km
          <input
            type="number"
            min="0"
            step="0.1"
            value={radiusKm}
            onChange={(event) => setRadiusKm(event.target.value)}
            placeholder="1.0"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          {recommendationMode ? "Recommendation mode active" : "Activities stay visible by default"}
        </span>
        <span>Use a user ID for stored-location recommendations or latitude and longitude for direct coordinates.</span>
      </div>
    </div>
  );
}