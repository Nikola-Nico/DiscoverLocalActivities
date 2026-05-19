from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import WorkingHoursCreate, WorkingHoursRead, UpdateWorkingHours
from app.models import Activity, WorkingHours

router = APIRouter(
    prefix="/working-hours",
    tags=["working-hours"]
)

# --- Endpoints ---

# List endpoint for working hours
@router.get("", response_model=List[WorkingHoursRead])
async def get_working_hours(
    db: Session = Depends(get_db),
    activity_id: Optional[int] = Query(default=None, description="Filter by activity ID"),
    day_of_week: Optional[str] = Query(default=None, description="Filter by day of week (e.g. 'monday')"),
    is_closed: Optional[bool] = Query(default=None, description="Filter by closed status"),
):
    query = select(WorkingHours)

    if activity_id is not None:
        query = query.where(WorkingHours.activity_id == activity_id)
    if is_closed is not None:
        query = query.where(WorkingHours.is_closed == is_closed)

    result = db.execute(query)
    working_hours = result.scalars().all()

    if day_of_week is not None:
        day = day_of_week.lower()
        working_hours = [wh for wh in working_hours if wh.day_of_week is not None and wh.day_of_week.lower() == day]

    return working_hours


# Get working hours for a specific activity
@router.get("/activity/{activity_id}", response_model=List[WorkingHoursRead])
async def get_working_hours_by_activity(
    activity_id: int,
    db: Session = Depends(get_db),
):
    activity = db.execute(
        select(Activity).where(Activity.id == activity_id)
    ).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    result = db.execute(
        select(WorkingHours).where(WorkingHours.activity_id == activity_id)
    )
    return result.scalars().all()


# Get a single working hours entry by ID
@router.get("/{working_hours_id}", response_model=WorkingHoursRead)
async def get_working_hours_by_id(
    working_hours_id: int,
    db: Session = Depends(get_db),
):
    wh = db.execute(
        select(WorkingHours).where(WorkingHours.id == working_hours_id)
    ).scalar_one_or_none()
    if not wh:
        raise HTTPException(status_code=404, detail="Working hours entry not found")
    return wh


# Create endpoint for working hours
@router.post("", response_model=WorkingHoursRead, status_code=status.HTTP_201_CREATED)
async def create_working_hours(
    working_hours: WorkingHoursCreate,
    db: Session = Depends(get_db),
):
    # Ensure the referenced activity exists
    activity = db.execute(
        select(Activity).where(Activity.id == working_hours.activity_id)
    ).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Prevent duplicate day entries for the same activity
    existing = db.execute(
        select(WorkingHours).where(
            WorkingHours.activity_id == working_hours.activity_id,
            WorkingHours.day_of_week == working_hours.day_of_week,
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Working hours for this activity and day already exist.",
        )

    db_wh = WorkingHours(**working_hours.model_dump())
    db.add(db_wh)
    db.commit()
    db.refresh(db_wh)
    return db_wh


# Update endpoint for working hours
@router.put("/{working_hours_id}", response_model=WorkingHoursRead)
async def update_working_hours(
    working_hours_id: int,
    working_hours: UpdateWorkingHours,
    db: Session = Depends(get_db),
):
    db_wh = db.execute(
        select(WorkingHours).where(WorkingHours.id == working_hours_id)
    ).scalar_one_or_none()
    if not db_wh:
        raise HTTPException(status_code=404, detail="Working hours entry not found")

    for field, value in working_hours.model_dump(exclude_unset=True).items():
        setattr(db_wh, field, value)

    db.commit()
    db.refresh(db_wh)
    return db_wh


# Delete endpoint for working hours
@router.delete("/{working_hours_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_working_hours(
    working_hours_id: int,
    db: Session = Depends(get_db),
):
    db_wh = db.execute(
        select(WorkingHours).where(WorkingHours.id == working_hours_id)
    ).scalar_one_or_none()
    if not db_wh:
        raise HTTPException(status_code=404, detail="Working hours entry not found")

    db.delete(db_wh)
    db.commit()