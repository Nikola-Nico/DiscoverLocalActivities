from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload, with_loader_criteria

from app.db import get_db
from app.schemas import ActivityCreate, ActivityRead, UpdateActivity
from app.models import Activity, WorkingHours

router = APIRouter(
    prefix="/activities",
    tags=["activities"]
)

# --- Endpoints ---

# List endpoint for activities
@router.get("", response_model=List[ActivityRead])
async def get_activities(
    db :Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=1000, description="Maximum number of returned activities"),
    category: Optional[str] = Query(default=None, description="Filter by activity category"),
    min_rating: Optional[float] = Query(default=None, ge=0.0, le=5.0, description="Filter by minimum rating"),
    min_rating_count: Optional[int] = Query(default=None, ge=0, description="Filter by minimum number of ratings"),
    open_now: Optional[bool] = Query(default=None, description="Filter by currently open activities")
):
    query = select(Activity).options(selectinload(Activity.working_hours))

    if open_now is not None:
        query = query.options(
            with_loader_criteria(
                WorkingHours,
                WorkingHours.is_closed == (not open_now),
                include_aliases=True,
            )
        )
        query = query.where(
            exists().where(
                WorkingHours.activity_id == Activity.id,
                WorkingHours.is_closed == (not open_now),
            )
        )

    result = db.execute(query)
    activities = result.scalars().all()

    if category:
        cat = category.lower()
        activities = [a for a in activities if a.type is not None and cat in a.type.lower()]
    if min_rating is not None:
        activities = [a for a in activities if a.rating is not None and a.rating >= min_rating]
    if min_rating_count is not None:
        activities = [a for a in activities if a.user_rating_count >= min_rating_count]
    return activities[:limit]


@router.get("/{activity_id}", response_model=ActivityRead)
async def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.execute(
        select(Activity)
        .options(selectinload(Activity.working_hours))
        .where(Activity.id == activity_id)
    ).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


# Create endpoint for activities
@router.post("", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
async def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    existing_user = db.execute(select(Activity).where(func.lower(Activity.name) == activity.name.lower())).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An activity with this name already exists.",
        )   
    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    return db.execute(
        select(Activity)
        .options(selectinload(Activity.working_hours))
        .where(Activity.id == db_activity.id)
    ).scalar_one()



# Update endpoint for activities
@router.put("/{activity_id}", response_model=ActivityRead)
async def update_activity(activity_id: int, activity: UpdateActivity, db: Session = Depends(get_db)):
    db_activity = db.execute(select(Activity).where(Activity.id == activity_id)).scalar_one_or_none()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    for field, value in activity.model_dump(exclude_unset=True).items():
        setattr(db_activity, field, value)
    db.commit()
    return db.execute(
        select(Activity)
        .options(selectinload(Activity.working_hours))
        .where(Activity.id == db_activity.id)
    ).scalar_one()