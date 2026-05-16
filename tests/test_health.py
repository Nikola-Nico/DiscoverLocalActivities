from fastapi.testclient import TestClient
from app.app import app

client = TestClient(app)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"message": "Welcome to Discover Local Activities API"}


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_db_health():
    r = client.get("/health/db")
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        assert r.json().get("status") == "ok"
    else:
        assert r.json().get("detail") == "database is not on"
