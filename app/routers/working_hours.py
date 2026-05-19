from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import WorkingHoursCreate, WorkingHoursRead, WorkingHoursBase, UpdateWorkingHours
from app.models import Activity, WorkingHours

router = APIRouter(
    prefix="/working-hours",
    tags=["working-hours"]
)

# --- Endpoints ---

# Note: listing of working hours is provided via the activity-specific
# endpoint `/working-hours/activity/{activity_id}`. The general list
# endpoint was removed to enforce activity-scoped access.


# Get working hours for a specific activity
@router.get("/{activity_id}", response_model=List[WorkingHoursRead])
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



# Create endpoint for working hours
@router.post("/{activity_id}", response_model=WorkingHoursRead | List[WorkingHoursRead], status_code=status.HTTP_201_CREATED)
async def create_working_hours(
    activity_id: int,
    working_hours: WorkingHoursCreate | List[WorkingHoursCreate],
    db: Session = Depends(get_db),
):
    is_bulk_request = isinstance(working_hours, list)
    items = working_hours if is_bulk_request else [working_hours]

    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one working hours entry is required.",
        )
        

    # Ensure the referenced activity exists
    activity = db.execute(
        select(Activity).where(Activity.id == activity_id)
    ).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    for idx, item in enumerate(items):
        if item.activity_id != activity_id:
            if is_bulk_request:
                detail = f"Entry at index {idx} has mismatched activity_id"
            else:
                detail = "Path activity_id must match payload activity_id"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail,
            )

    payload_days = [item.day_of_week for item in items]
    if len(payload_days) != len(set(payload_days)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate day_of_week values in payload.",
        )

    # Prevent duplicate day entries for the same activity
    existing_days = set(
        db.execute(
            select(WorkingHours.day_of_week).where(WorkingHours.activity_id == activity_id)
        ).scalars().all()
    )
    conflict_days = [day for day in payload_days if day in existing_days]
    if conflict_days:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Working hours for one or more provided days already exist.",
        )

    db_items = [
        WorkingHours(
            **item.model_dump(exclude={"activity_id"}),
            activity_id=activity_id,
        )
        for item in items
    ]

    db.add_all(db_items)
    db.commit()
    for db_item in db_items:
        db.refresh(db_item)

    if is_bulk_request:
        return db_items
    return db_items[0]


# Update endpoint for working hours
@router.put("/{activity_id}/{working_hours_id}", response_model=WorkingHoursRead)
async def update_working_hours(
    activity_id: int,
    working_hours_id: int,
    working_hours: UpdateWorkingHours,
    db: Session = Depends(get_db),
    request: Request = None,
):
    db_wh = db.execute(
        select(WorkingHours).where(WorkingHours.id == working_hours_id, WorkingHours.activity_id == activity_id)
    ).scalar_one_or_none()
    if not db_wh:
        raise HTTPException(status_code=404, detail="Working hours entry not found for this activity")

    # If client included `activity_id` in the raw JSON body, reject mismatches.
    # (UpdateWorkingHours schema does not include `activity_id`, so extras would be ignored.)
    try:
        raw = await request.json() if request is not None else {}
    except Exception:
        raw = {}
    if isinstance(raw, dict) and "activity_id" in raw and raw["activity_id"] != activity_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload activity_id must match path activity_id",
        )

    for field, value in working_hours.model_dump(exclude_unset=True, exclude={"activity_id"}).items():
        setattr(db_wh, field, value)

    db.commit()
    db.refresh(db_wh)
    return db_wh


# Delete endpoint for working hours
@router.delete("/{activity_id}/{working_hours_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_working_hours(
    activity_id: int,
    working_hours_id: int,
    db: Session = Depends(get_db),
):
    db_wh = db.execute(
        select(WorkingHours).where(WorkingHours.id == working_hours_id, WorkingHours.activity_id == activity_id)
    ).scalar_one_or_none()
    if not db_wh:
        raise HTTPException(status_code=404, detail="Working hours entry not found for this activity")

    db.delete(db_wh)
    db.commit()