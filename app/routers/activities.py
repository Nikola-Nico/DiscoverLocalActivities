from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(
    prefix="/activities",
    tags=["activities"]
)

# --- Pydantic Schemas ---
class ActivityBase(BaseModel):
    name: str
    category: str
    rating: float = Field(..., ge=0.0, le=5.0)
    rating_count: int = Field(..., ge=0)
    is_open: bool

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int

    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("", response_model=List[ActivityResponse])
async def get_activities(
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of returned activities"),
    category: Optional[str] = Query(default=None, description="Filter by activity type/category"),
    min_rating: Optional[float] = Query(default=None, ge=0.0, le=5.0, description="Filter by minimum rating"),
    min_rating_count: Optional[int] = Query(default=None, ge=0, description="Filter by minimum number of ratings"),
    open_now: Optional[bool] = Query(default=None, description="Return only currently open activities")
):
    # TODO: Fetch and filter from your database here.
    # Logic breakdown:
    # 1. Start with your database query.
    # 2. If category: query = query.filter(category==category)
    # 3. If min_rating: query = query.filter(rating >= min_rating)
    # 4. If min_rating_count: query = query.filter(rating_count >= min_rating_count)
    # 5. If open_now is True: query = query.filter(is_open == True)
    # 6. Apply .limit(limit)
    
    return []

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(activity: ActivityCreate):
    # TODO: Save activity to database
    return {**activity.model_dump(), "id": 1}

@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(activity_id: int, activity: ActivityCreate):
    # TODO: Find activity by activity_id, update it, and save
    # If not found: raise HTTPException(status_code=404, detail="Activity not found")
    return {**activity.model_dump(), "id": activity_id}