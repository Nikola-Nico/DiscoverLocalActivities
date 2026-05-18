from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    name: str
    surname: str
    email: str
    destination: str
    latitude: float
    longitude: float


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
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ActivityBase(BaseModel):
    phone_number: Optional[str] = None
    latitude: float
    longitude: float
    rating: Optional[float] = None
    user_rating_count: int = 0
    name: str
    type: str = "other"


class ActivityCreate(ActivityBase):
    pass


class WorkingHoursBase(BaseModel):
    activity_id: int
    day_of_week: Optional[str] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    break_hour_start: Optional[str] = None
    break_hour_end: Optional[str] = None
    is_open_24h: bool = False
    is_closed: bool = False


class WorkingHoursCreate(WorkingHoursBase):
    pass


class WorkingHoursRead(WorkingHoursBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ActivityRead(ActivityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    working_hours: list[WorkingHoursRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ActivityWithHours(ActivityRead):
    pass


class UpdateActivity(BaseModel):
    phone_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    user_rating_count: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None

