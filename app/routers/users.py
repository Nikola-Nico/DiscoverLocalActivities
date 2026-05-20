from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import UpdateUser, UserCreate, UserRead
from app.models import User
from app.helper.calculate_haversine import calculate_haversine


router = APIRouter(
    prefix="/users",
    tags=["users"]
)


# --- Endpoints ---


# Get endpoint to retrieve a list of users with optional geo filtering and pagination
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

# Get endpoint to retrieve a user by ID with error handling for non-existent users
@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Post endpoint to create a new user with email uniqueness validation
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

# Put endpoint to update an existing user with error handling for non-existent users 
# and partial updates
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
    
