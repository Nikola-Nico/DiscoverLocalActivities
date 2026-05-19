import math
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import UpdateUser, UserCreate, UserRead
from app.models import User

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# --- Haversine Helper Function ---
def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points 
    on the Earth's surface in kilometers.
    """
    # Earth's radius in kilometers
    R = 6371.0 

    # Convert degrees to radians
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Haversine formula
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

# --- Endpoints ---

@router.get("", response_model=List[UserRead])
async def get_users(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of returned users"),
    latitude: Optional[float] = Query(default=None, ge=-90.0, le=90.0, description="Latitude for geo filtering"),
    longitude: Optional[float] = Query(default=None, ge=-180.0, le=180.0, description="Longitude for geo filtering"),
    radius_km: Optional[float] = Query(default=None, ge=0.0, description="Max distance radius in km")
):
    # Validate that geo parameters are passed together
    geo_params = [latitude, longitude, radius_km]
    if any(geo_params) and not all(geo_params):
        raise HTTPException(
            status_code=400, 
            detail="To filter by location, you must provide latitude, longitude, AND radius_km."
        )

    query = select(User)
    result = db.execute(query)
    users = result.scalars().all()

    if all(geo_params):
        users = [
            u for u in users
            if calculate_haversine(latitude, longitude, u.latitude, u.longitude) <= radius_km
        ]

    return users[:limit]

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.execute(
        select(User).where(User.email == user.email)
    ).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: int, user: UpdateUser, db: Session = Depends(get_db)):
    db_user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in user.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)

    return db_user
    
