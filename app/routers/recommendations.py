from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models import Activity, User

from app.helper.recommendation_handler import rank_nearby_recommendations

# --- Router Setup ---
router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def _build_recommendation_response(base_response: dict) -> dict:
    return base_response


# --- Endpoints ---

@router.get("")
def get_recommendations_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="User latitude"),
    lon: float = Query(..., ge=-180, le=180, description="User longitude"),
    radius_km: float = Query(1.0, gt=0, description="Search radius in km"),
    context: str = Query("lunch", description="Recommendation context"),
    db: Session = Depends(get_db),
):
    activities = db.execute(
        select(Activity).options(selectinload(Activity.working_hours))
    ).scalars().all()
    try:
        nearby, response_timestamp = rank_nearby_recommendations(
            activities,
            lat,
            lon,
            radius_km,
            context,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _build_recommendation_response({
        "user_location": {"latitude": lat, "longitude": lon},
        "radius_km": radius_km,
        "context": context,
        "response_timestamp": response_timestamp,
        "results_count": len(nearby),
        "activities": nearby,
    })

# recommendations based on user id, using user's stored location to find nearby activities
@router.get("/{user_id}")
def get_recommendations_by_user(
    user_id: int,
    radius_km: float = Query(1.0, gt=0, description="Search radius in km"),
    context: str = Query("lunch", description="Recommendation context"),
    db: Session = Depends(get_db),
):
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")

    activities = db.execute(
        select(Activity).options(selectinload(Activity.working_hours))
    ).scalars().all()
    try:
        nearby, response_timestamp = rank_nearby_recommendations(
            activities,
            user.latitude,
            user.longitude,
            radius_km,
            context,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _build_recommendation_response({
        "user_id": user_id,
        "user_location": {"latitude": user.latitude, "longitude": user.longitude},
        "radius_km": radius_km,
        "context": context,
        "response_timestamp": response_timestamp,
        "results_count": len(nearby),
        "activities": nearby,
    })