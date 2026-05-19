from collections.abc import Generator

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


def _create_activity(client: TestClient, name: str) -> int:
    response = client.post(
        "/activities",
        json={
            "name": name,
            "type": "museum",
            "phone_number": "+385123456",
            "latitude": 45.815,
            "longitude": 15.981,
            "rating": 4.6,
            "user_rating_count": 10,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_post_working_hours_creates_for_listed_activity(client: TestClient) -> None:
    activity_id = _create_activity(client, "Listed Activity")

    payload = {
        "activity_id": activity_id,
        "day_of_week": "monday",
        "open_time": "09:00",
        "close_time": "17:00",
        "break_hour_start": None,
        "break_hour_end": None,
        "is_open_24h": False,
        "is_closed": False,
    }

    create_response = client.post(f"/working-hours/{activity_id}", json=payload)
    assert create_response.status_code == 201
    assert create_response.json()["activity_id"] == activity_id

    list_response = client.get(f"/working-hours/{activity_id}")
    assert list_response.status_code == 200
    entries = list_response.json()
    assert len(entries) == 1
    assert entries[0]["activity_id"] == activity_id
    assert entries[0]["day_of_week"] == "monday"


def test_post_working_hours_rejects_path_body_activity_mismatch(client: TestClient) -> None:
    listed_activity_id = _create_activity(client, "Listed Activity")
    other_activity_id = _create_activity(client, "Other Activity")

    payload = {
        "activity_id": other_activity_id,
        "day_of_week": "tuesday",
        "open_time": "10:00",
        "close_time": "18:00",
        "break_hour_start": None,
        "break_hour_end": None,
        "is_open_24h": False,
        "is_closed": False,
    }

    response = client.post(f"/working-hours/{listed_activity_id}", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Path activity_id must match payload activity_id"


def test_post_working_hours_accepts_array_payload_on_same_url(client: TestClient) -> None:
    activity_id = _create_activity(client, "Array Payload Activity")

    payload = [
        {
            "activity_id": activity_id,
            "day_of_week": "wednesday",
            "open_time": "08:00",
            "close_time": "16:00",
            "break_hour_start": "10:00",
            "break_hour_end": "11:00",
            "is_open_24h": False,
            "is_closed": False,
        },
        {
            "activity_id": activity_id,
            "day_of_week": "thursday",
            "open_time": "08:00",
            "close_time": "16:00",
            "break_hour_start": "10:00",
            "break_hour_end": "11:00",
            "is_open_24h": False,
            "is_closed": False,
        },
    ]

    response = client.post(f"/working-hours/{activity_id}", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert isinstance(created, list)
    assert len(created) == 2
    assert all(item["activity_id"] == activity_id for item in created)

    list_response = client.get(f"/working-hours/{activity_id}")
    assert list_response.status_code == 200
    days = {entry["day_of_week"] for entry in list_response.json()}
    assert {"wednesday", "thursday"}.issubset(days)


def test_post_working_hours_array_rejects_mismatched_activity_id(client: TestClient) -> None:
    listed_activity_id = _create_activity(client, "Array Listed Activity")
    other_activity_id = _create_activity(client, "Array Other Activity")

    payload = [
        {
            "activity_id": listed_activity_id,
            "day_of_week": "friday",
            "open_time": "09:00",
            "close_time": "17:00",
            "break_hour_start": None,
            "break_hour_end": None,
            "is_open_24h": False,
            "is_closed": False,
        },
        {
            "activity_id": other_activity_id,
            "day_of_week": "saturday",
            "open_time": "09:00",
            "close_time": "17:00",
            "break_hour_start": None,
            "break_hour_end": None,
            "is_open_24h": False,
            "is_closed": False,
        },
    ]

    response = client.post(f"/working-hours/{listed_activity_id}", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Entry at index 1 has mismatched activity_id"


def test_put_and_delete_are_activity_scoped(client: TestClient) -> None:
    # Create two activities
    activity_a = _create_activity(client, "Activity A")
    activity_b = _create_activity(client, "Activity B")

    # Create a working hours entry for activity_a
    payload = {
        "activity_id": activity_a,
        "day_of_week": "sunday",
        "open_time": "11:00",
        "close_time": "15:00",
        "break_hour_start": None,
        "break_hour_end": None,
        "is_open_24h": False,
        "is_closed": False,
    }
    create_resp = client.post(f"/working-hours/{activity_a}", json=payload)
    assert create_resp.status_code == 201
    wh_id = create_resp.json()["id"]

    # Attempt to update using the wrong activity_id in path -> 404
    update_payload = {"day_of_week": "monday"}
    resp = client.put(f"/working-hours/{activity_b}/{wh_id}", json=update_payload)
    assert resp.status_code == 404

    # Attempt to update with mismatched activity_id in payload should be rejected (if provided)
    # Although UpdateWorkingHours doesn't accept activity_id, ensure API is resilient
    resp = client.put(f"/working-hours/{activity_a}/{wh_id}", json={"activity_id": activity_b, "day_of_week": "tuesday"})
    assert resp.status_code == 400

    # Proper update on correct scoped path
    resp = client.put(f"/working-hours/{activity_a}/{wh_id}", json={"day_of_week": "wednesday"})
    assert resp.status_code == 200
    assert resp.json()["day_of_week"] == "wednesday"

    # Attempt delete with wrong activity -> 404
    resp = client.delete(f"/working-hours/{activity_b}/{wh_id}")
    assert resp.status_code == 404

    # Proper delete with correct activity -> 204
    resp = client.delete(f"/working-hours/{activity_a}/{wh_id}")
    assert resp.status_code == 204

    # Confirm deletion: listing for activity should not include the entry
    list_resp = client.get(f"/working-hours/{activity_a}")
    assert list_resp.status_code == 200
    assert all(entry["id"] != wh_id for entry in list_resp.json())
