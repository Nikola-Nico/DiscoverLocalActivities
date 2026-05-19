from datetime import datetime
from typing import Optional
from datetime import time
from pydantic import BaseModel, ConfigDict, Field


# ─────────────────────────────────────────────
#  USER SCHEMAS
# ─────────────────────────────────────────────

class UserBase(BaseModel):
    name: str
    surname: str
    email: str
    destination: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UpdateUser(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    destination: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


# ─────────────────────────────────────────────
#  WORKING HOURS SCHEMAS
# ─────────────────────────────────────────────

class WorkingHoursBase(BaseModel):
    activity_id: int
    day_of_week: Optional[str] = None       # e.g. "monday", "tuesday", ...
    open_time: Optional[str] = None         # Format: HH:MM
    close_time: Optional[str] = None        # Format: HH:MM
    break_hour_start: Optional[str] = None  # Format: HH:MM
    break_hour_end: Optional[str] = None    # Format: HH:MM
    is_open_24h: bool = False
    is_closed: bool = False


class WorkingHoursCreate(WorkingHoursBase):
    pass


class WorkingHoursRead(WorkingHoursBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UpdateWorkingHours(BaseModel):
    day_of_week: Optional[str] = None
    open_time: Optional[str] = None         # Format: HH:MM
    close_time: Optional[str] = None        # Format: HH:MM
    break_hour_start: Optional[str] = None  # Format: HH:MM
    break_hour_end: Optional[str] = None    # Format: HH:MM
    is_open_24h: bool = False
    is_closed: Optional[bool] = None


# ─────────────────────────────────────────────
#  ACTIVITY SCHEMAS
# ─────────────────────────────────────────────

class ActivityBase(BaseModel):
    name: str
    type: str = "other"
    phone_number: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    user_rating_count: int = Field(default=0, ge=0)


class ActivityCreate(ActivityBase):
    pass


class ActivityRead(ActivityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    working_hours: list[WorkingHoursRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ActivityWithHours(ActivityRead):
    """Alias for ActivityRead – includes nested working_hours."""
    pass


class UpdateActivity(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    phone_number: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    user_rating_count: Optional[int] = Field(default=None, ge=0)

