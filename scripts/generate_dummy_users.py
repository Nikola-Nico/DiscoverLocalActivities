import sys
import os
import argparse
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db import SessionLocal
from app.models import User


FIRST_NAMES = [
    "Aleksandar", "Marija", "Stefan", "Elena", "Nikola",
    "Ana", "Luka", "Sara", "Filip", "Milena",
    "Ivan", "Maja", "Petar", "Jovana", "Darko",
    "Kristina", "Bojan", "Teodora", "Viktor", "Ivana",
]

LAST_NAMES = [
    "Petrov", "Nikolov", "Stojanovic", "Ivanovic", "Dimitrov",
    "Trajkov", "Blazevski", "Ristovski", "Gjorgjevski", "Markovic",
    "Kovacevic", "Milovanovic", "Todorovic", "Jovanovic", "Stankovic",
]

DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me"]

DESTINATION = {"destination": "Skopje", "latitude": 41.9981, "longitude": 21.4254}


def fake_email(first: str, last: str, uid: int) -> str:
    domain = random.choice(DOMAINS)
    return f"{first.lower()}.{last.lower()}{uid}@{domain}"


def build_user(uid: int) -> dict:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    lat_jitter = random.uniform(-0.02, 0.02)
    lon_jitter = random.uniform(-0.02, 0.02)

    return {
        "name": first,
        "surname": last,
        "email": fake_email(first, last, uid),
        "destination": DESTINATION["destination"],
        "latitude": round(DESTINATION["latitude"] + lat_jitter, 6),
        "longitude": round(DESTINATION["longitude"] + lon_jitter, 6),
    }


def generate_users(count: int = 20, clear: bool = False) -> None:
    db = SessionLocal()

    try:
        if clear:
            print("⚠️  Clearing existing users...")
            db.query(User).delete()
            db.commit()

        print(f"Generating {count} dummy user(s)...\n")

        created = 0
        for i in range(1, count + 1):
            data = build_user(i)
            user = User(**data)
            db.add(user)
            try:
                db.commit()
                created += 1
                print(f"  ✅ [{i:>3}/{count}] {data['name']} {data['surname']:<20} {data['email']}")
            except Exception as exc:
                db.rollback()
                print(f"  ❌ [{i:>3}/{count}] Failed ({data['email']}): {exc}")

        print(f"\nDone — {created}/{count} users inserted.")

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=20)
    parser.add_argument("--clear", action="store_true")
    args = parser.parse_args()
    generate_users(count=args.count, clear=args.clear)