import React from "react";

const CONTEXT_OPTIONS = [
  "general",
  "breakfast",
  "coffee",
  "lunch",
  "dinner",
  "nightlife",
  "culture",
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
  users: any[];
};

const fieldLabel =
  "flex min-w-36 flex-1 flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const fieldInput =
  "w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring";

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
  users,
}: RecommendationFiltersProps) {
  
  // 1. Handle User Selection
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setUserId(selectedId);

    // If a valid user is selected, auto-fill their coordinates
    if (selectedId) {
      const selectedUser = users.find((u) => u.id?.toString() === selectedId);
      if (selectedUser) {
        setLat(selectedUser.latitude.toString());
        setLng(selectedUser.longitude.toString());
      }
    }
  };

  // 2. Handle Coordinate Changes manually
  const handleLatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLat(event.target.value);
    // Unselect the user if the coordinates are manually changed
    if (userId !== "") setUserId("");
  };

  const handleLngChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLng(event.target.value);
    // Unselect the user if the coordinates are manually changed
    if (userId !== "") setUserId("");
  };

  return (
    <div className="border-b border-border px-6 py-5">
      <div className="mb-4 grid gap-4 md:grid-cols-5">
        <label className={fieldLabel}>
          User
          <select
            value={userId}
            onChange={handleUserChange}
            className={fieldInput}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} className="rounded-2xl">
                {user.name} {user.surname}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldLabel}>
          Latitude
          <input
            type="number"
            step="any"
            value={lat}
            onChange={handleLatChange}
            placeholder="45.815"
            className={fieldInput}
          />
        </label>
        <label className={fieldLabel}>
          Longitude
          <input
            type="number"
            step="any"
            value={lng}
            onChange={handleLngChange}
            placeholder="15.981"
            className={fieldInput}
          />
        </label>
        <label className={fieldLabel}>
          Context
          <select
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className={fieldInput}
          >
            <option value="">Choose a context</option>
            {CONTEXT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldLabel}>
          Radius km
          <input
            type="number"
            min="0"
            step="0.1"
            value={radiusKm}
            onChange={(event) => setRadiusKm(event.target.value)}
            placeholder="1.0"
            className={fieldInput}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            recommendationMode
              ? "bg-gradient-pill text-primary-foreground shadow-pill"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {recommendationMode ? "Recommendation mode active" : "Activities stay visible by default"}
        </span>
        <span>
          Use a user ID for stored-location recommendations or latitude and longitude for direct
          coordinates.
        </span>
      </div>
    </div>
  );
}