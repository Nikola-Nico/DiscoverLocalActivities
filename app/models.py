from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    surname = Column(String)
    destination = Column(String)

    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    latitude = Column(Float)
    longitude = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)





class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)

    name = Column(String)
    type = Column(String)
    phone_number = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    rating = Column(Float)
    user_rating_count = Column(Integer)

    monday_working_hours = Column(String)
    tuesday_working_hours = Column(String)
    wednesday_working_hours = Column(String)
    thursday_working_hours = Column(String)
    friday_working_hours = Column(String)
    saturday_working_hours = Column(String)
    sunday_working_hours = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)