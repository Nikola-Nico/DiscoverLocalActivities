from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
import math

from app.db import get_db
from app.models import Activity, User

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two GPS coordinates."""
    R = 6371  # Earth radius in km
    lat1_r, lon1_r, lat2_r, lon2_r = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2_r - lat1_r
    dlon = lon2_r - lon1_r
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def filter_nearby_activities(
    user_lat: float,
    user_lon: float,
    activities: list[Activity],
    radius_km: float = 1.0,
) -> list[dict]:
    nearby = []
    for activity in activities:
        distance = calculate_haversine(user_lat, user_lon, activity.latitude, activity.longitude)
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
    return nearby


@router.get("")
def get_recommendations_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="User latitude"),
    lon: float = Query(..., ge=-180, le=180, description="User longitude"),
    radius_km: float = Query(1.0, gt=0, description="Search radius in km"),
    db: Session = Depends(get_db),
):
    activities = db.execute(select(Activity)).scalars().all()
    nearby = filter_nearby_activities(lat, lon, activities, radius_km)
    return {
        "user_location": {"latitude": lat, "longitude": lon},
        "radius_km": radius_km,
        "results_count": len(nearby),
        "activities": nearby,
    }


@router.get("/{user_id}")
def get_recommendations_by_user(
    user_id: int,
    radius_km: float = Query(1.0, gt=0, description="Search radius in km"),
    db: Session = Depends(get_db),
):
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")

    activities = db.execute(select(Activity)).scalars().all()
    nearby = filter_nearby_activities(user.latitude, user.longitude, activities, radius_km)
    return {
        "user_id": user_id,
        "user_location": {"latitude": user.latitude, "longitude": user.longitude},
        "radius_km": radius_km,
        "results_count": len(nearby),
        "activities": nearby,
    }