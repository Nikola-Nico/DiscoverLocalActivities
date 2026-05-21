from collections.abc import Generator
from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.app import app
from app.db import Base, get_db


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

    Base.metadata.drop_all(bind=engine)


def _create_open_activity(client: TestClient, name: str, activity_type: str, latitude: float, longitude: float) -> int:
    activity_response = client.post(
        "/activities",
        json={
            "name": name,
            "type": activity_type,
            "phone_number": "+385123456",
            "latitude": latitude,
            "longitude": longitude,
            "rating": 4.5,
            "user_rating_count": 10,
        },
    )
    assert activity_response.status_code == 201
    activity_id = activity_response.json()["id"]

    current_day = datetime.now().astimezone().strftime("%A").lower()
    working_hours_response = client.post(
        f"/working-hours/{activity_id}",
        json={
            "activity_id": activity_id,
            "day_of_week": current_day,
            "open_time": None,
            "close_time": None,
            "break_hour_start": None,
            "break_hour_end": None,
            "is_open_24h": True,
            "is_closed": False,
        },
    )
    assert working_hours_response.status_code == 201
    return activity_id


def test_recommendations_hide_context_when_not_provided(client: TestClient) -> None:
    _create_open_activity(client, "Book Store API", "shopping_mall", 45.815, 15.981)
    _create_open_activity(client, "Restaurant API", "restaurant", 45.816, 15.982)

    response = client.get("/recommendations?lat=45.815&lon=15.981&radius_km=5")

    assert response.status_code == 200
    payload = response.json()
    assert "context" not in payload
    assert all("context" not in activity for activity in payload["activities"])


def test_recommendations_show_context_when_provided(client: TestClient) -> None:
    _create_open_activity(client, "Book Store API", "shopping_mall", 45.815, 15.981)
    _create_open_activity(client, "Restaurant API", "restaurant", 45.816, 15.982)

    response = client.get("/recommendations?lat=45.815&lon=15.981&radius_km=5&context=lunch")

    assert response.status_code == 200
    payload = response.json()
    assert payload["context"] == "lunch"
    assert all(activity["context"] == "lunch" for activity in payload["activities"])