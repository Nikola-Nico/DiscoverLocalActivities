from app.models import Activity
from app.helper.calculate_haversine import calculate_haversine

def filter_nearby_activities(
    user_lat: float,
    user_lon: float,
    activities: list[Activity],
    radius_km: float = 1.0,
) -> list[dict]:
    nearby = []
    for activity in activities:
        # Calculate distance from user location to activity location
        distance = calculate_haversine(
            user_lat, user_lon, activity.latitude, activity.longitude)
        
        # If the activity is within the specified radius, add it to the 
        # nearby list with distance info
        if distance <= radius_km:
            nearby.append({
                "id": activity.id,
                "name": activity.name,
                "type": activity.type,
                "latitude": activity.latitude,
                "longitude": activity.longitude,
                "rating": activity.rating,
                "user_rating_count": activity.user_rating_count,
                "distance_km": round(distance, 4),
            })
    nearby.sort(key=lambda x: x["distance_km"])
    
    return nearby
