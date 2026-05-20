from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db import get_db
from app.models import Activity, User

# Import helper functions for calculating distances and filtering nearby activities
from app.helper.calculate_haversine import calculate_haversine
from app.helper.filter_nearby_activities import filter_nearby_activities

# --- Router Setup ---
router = APIRouter(prefix="/recommendations", tags=["recommendations"])


# --- Endpoints ---

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

# recommendations based on user id, using user's stored location to find nearby activities
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