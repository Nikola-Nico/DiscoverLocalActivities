import { useState, useEffect , useCallback } from 'react';

export interface Recommendation {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  recommendationScore: number;
  workingHours: string;
  recommendationReason: string;
}

interface FetchOptions {
  id: number;
  lat?: string | number | null;
  lng?: string | number | null;
  context?: string;
  radius_km?: number;
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
  working_hours: WorkingHours[];  // array of objects, not strings
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
    fetch('http://localhost:8000/activities')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => { setData(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, []);

  return { data, loading, error };
}


// 
export function useFetchUsers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/users')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => { setData(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, []);

  return { data, loading, error };
}

export function useRecommendations({ id, lat, lng, context, radius_km }: FetchOptions) {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // 1. Keep track of the parameters from the previous render pass
  const [prevParams, setPrevParams] = useState({ id, lat, lng, context, radius_km, refreshTrigger });

  // 2. Check if any dependency changed. If so, adjust state immediately DURING render.
  if (
    id !== prevParams.id ||
    lat !== prevParams.lat ||
    lng !== prevParams.lng ||
    context !== prevParams.context ||
    radius_km !== prevParams.radius_km ||
    refreshTrigger !== prevParams.refreshTrigger
  ) {
    setPrevParams({ id, lat, lng, context, radius_km, refreshTrigger });
    setLoading(true);
    setError(null);
  }

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!id) return;

    // 🔴 NOTE: setLoading(true) and setError(null) have been removed from here!

    const query = new URLSearchParams();
    if (lat) query.append('lat', lat.toString());
    if (lng) query.append('lng', lng.toString());
    if (context) query.append('context', context);
    if (radius_km) query.append('radius_km', radius_km.toString());

    const queryString = query.toString();
    const url = `http://localhost:8000/recommendations/${id}${queryString ? `?${queryString}` : ''}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        return res.json();
      })
      .then((data: Recommendation[]) => {
        setData(data);
        setLoading(false); // This is fine because it happens ASYNCHRONOUSLY later
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setLoading(false); // This is fine because it happens ASYNCHRONOUSLY later
      });
      
  }, [id, lat, lng, context, radius_km, refreshTrigger]);

  return { data, loading, error, refresh };
}