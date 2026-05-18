import math
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# --- Pydantic Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

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

@router.get("", response_model=List[UserResponse])
async def get_users(
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

    # TODO: Fetch users from DB (applying limit)
    # mock_users_from_db = [...] 
    
    # If geo filtering is requested, apply the Haversine formula
    # Note: For large datasets, doing this in-memory is inefficient. 
    # Consider using PostGIS or a bounding box query in production!
    if all(geo_params):
        filtered_users = []
        for user in mock_users_from_db:
            distance = calculate_haversine(latitude, longitude, user.latitude, user.longitude)
            if distance <= radius_km:
                filtered_users.append(user)
        return filtered_users[:limit]

    return [] # Return unfiltered/limited users here

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    # TODO: Hash password and save user to database
    return {**user.model_dump(exclude={"password"}), "id": 1}

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserCreate):
    # TODO: Find user by user_id, update fields, and save
    # If not found: raise HTTPException(status_code=404, detail="User not found")
    return {**user.model_dump(exclude={"password"}), "id": user_id}