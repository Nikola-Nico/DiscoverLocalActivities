from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional

from app.schemas import ActivityCreate, ActivityRead, UpdateActivity

router = APIRouter(
    prefix="/activities",
    tags=["activities"]
)

# --- Endpoints ---

@router.get("", response_model=List[ActivityRead])
async def get_activities(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of returned activities"),
    category: Optional[str] = Query(default=None, description="Filter by activity category"),
    min_rating: Optional[float] = Query(default=None, ge=0.0, le=5.0, description="Filter by minimum rating"),
    min_rating_count: Optional[int] = Query(default=None, ge=0, description="Filter by minimum number of ratings"),
    open_now: Optional[bool] = Query(default=None, description="Filter by currently open activities")
):
    # TODO: Fetch and filter from the database here.
    # This is a placeholder response until query wiring is added.
    return []

@router.post("", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
async def create_activity(activity: ActivityCreate):
    # TODO: Save activity to database
    return {**activity.model_dump(), "id": 1}

@router.put("/{activity_id}", response_model=ActivityRead)
async def update_activity(activity_id: int, activity: UpdateActivity):
    # TODO: Find activity by activity_id, update it, and save
    # If not found: raise HTTPException(status_code=404, detail="Activity not found")
    return {**activity.model_dump(exclude_unset=True), "id": activity_id}