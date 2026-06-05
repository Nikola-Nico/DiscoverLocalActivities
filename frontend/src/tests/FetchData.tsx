import { useCallback, useEffect, useState } from "react";

export interface Recommendation {
  id: number;
  name: string;
  category: string;
  rating: number | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  recommendationScore: number;
  recommendationReason: string;
  isOpen: boolean;
  context: string;
  workingHours?: any[];
  userRatingCount?: number;
  phoneNumber?: string | null;
}
interface FetchOptions {
  id?: string;
  lat?: string;
  lng?: string;
  context?: string;
  radius_km?: string;
}

interface RecommendationApiActivity {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  distance_km: number;
  recommendation_score: number;
  is_open: boolean;
  context: string;
  user_rating_count: number;
  phone_number: string;
}

interface RecommendationApiResponse {
  user_id?: number;
  user_location: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
  context: string;
  response_timestamp: string;
  results_count: number;
  activities: RecommendationApiActivity[];
  phone_number: string;
}
interface WorkingHours {
  id: number;
  activity_id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  break_hour_start: string | null;
  break_hour_end: string | null;
  is_open_24h: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

interface Activity {
  name: string;
  type: string;
  phone_number: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_rating_count: number;
  id: number;
  created_at: string;
  updated_at: string;
  working_hours: WorkingHours[]; // array of objects, not strings
}

interface User {
  name: string;
  surname: string;
  email: string;
  destination: string;
  latitude: number;
  longitude: number;
}

// TODO: Make filtering like in fastAPI, with query parameters. For example, you can have a function that takes a filter object and constructs the query string accordingly. This way, you can easily add more filters in the future without changing the function signature.

export function useFetchActivities() {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/activities")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

//
export function useFetchUsers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/users")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

export function useRecommendations({
  id,
  lat,
  lng,
  context,
  radius_km,
}: FetchOptions) {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const normalizedId = id?.trim();
  const normalizedLat = lat?.trim();
  const normalizedLng = lng?.trim();
  const normalizedContext = context?.trim();
  const normalizedRadius = radius_km?.trim();
  const hasUserId = Boolean(normalizedId);
  const hasCoordinates = Boolean(normalizedLat && normalizedLng);
  const shouldFetch = hasUserId || hasCoordinates;

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!shouldFetch) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const query = new URLSearchParams();
    if (normalizedContext) query.append("context", normalizedContext);
    if (normalizedRadius) query.append("radius_km", normalizedRadius);

    let url = "";
    if (hasUserId) {
      url = `http://localhost:8000/recommendations/${normalizedId}`;
    } else if (hasCoordinates) {
      query.append("lat", normalizedLat!);
      query.append("lon", normalizedLng!);
      url = "http://localhost:8000/recommendations";
    }

    const queryString = query.toString();
    const requestUrl = `${url}${queryString ? `?${queryString}` : ""}`;

    setLoading(true);
    setError(null);

    fetch(requestUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        return res.json();
      })
      .then(async (response: RecommendationApiResponse) => {
        // First pass: map the recommendation data
        const mapped = response.activities.map(
          (activity: RecommendationApiActivity) => ({
            id: activity.id,
            name: activity.name,
            category: activity.type,
            rating: activity.rating,
            latitude: activity.latitude,
            longitude: activity.longitude,
            distanceKm: activity.distance_km,
            recommendationScore: activity.recommendation_score,
            recommendationReason: activity.is_open
              ? `Open now and ranked for the ${response.context} context.`
              : `Ranked for the ${response.context} context.`,
            isOpen: activity.is_open,
            context: activity.context,
            userRatingCount: activity.user_rating_count,
            workingHours: undefined as WorkingHours[] | undefined,
            phoneNumber: undefined as string | null | undefined, 
          }),
        );

        // Second pass: batch fetch working hours for all activities in parallel
        const enriched = await Promise.all(
          mapped.map(async (rec) => {
            try {
              const res = await fetch(
                `http://localhost:8000/activities/${rec.id}`,
              );
              if (!res.ok) return rec; // graceful fallback: skip if it fails
              const detail: Activity = await res.json();
              // console.log(`Activity ${rec.id} detail:`, detail.phone_number); // add this
              return { ...rec, workingHours: detail.working_hours, phoneNumber: detail.phone_number };
            } catch {
              return rec; // graceful fallback
            }
          }),
        );

        setData(enriched);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
        setLoading(false); // This is fine because it happens ASYNCHRONOUSLY later
      });
  }, [
    hasCoordinates,
    hasUserId,
    normalizedContext,
    normalizedId,
    normalizedLat,
    normalizedLng,
    normalizedRadius,
    refreshTrigger,
    shouldFetch,
  ]);

  return { data, loading, error, refresh };
}
