import { useState, useEffect } from 'react';


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
    email: string;
}

// TODO: Make filtering like in fastAPI, with query parameters. For example, you can have a function that takes a filter object and constructs the query string accordingly. This way, you can easily add more filters in the future without changing the function signature.



export function useActivities() {
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
export function FetchUsers() {
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

export function FetchRecommendation(id: number) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/users/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => { setData(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, []);

  return { data, loading, error };
}

