import sys
import os
import argparse
import random
import pandas as pd
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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

DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "proton.me"
]

DESTINATION = {
    "destination": "Skopje",
    "latitude": 41.9981,
    "longitude": 21.4254
}

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = BASE_DIR / "data" / "dummy_users.csv"


def fake_email(first: str, last: str, uid: int) -> str:
    domain = random.choice(DOMAINS)
    return f"{first.lower()}.{last.lower()}{uid}@{domain}"


def build_user(uid: int) -> dict:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)

    lat_jitter = random.uniform(-0.02, 0.02)
    lon_jitter = random.uniform(-0.02, 0.02)

    return {
        "id": uid,
        "name": first,
        "surname": last,
        "email": fake_email(first, last, uid),
        "destination": DESTINATION["destination"],
        "latitude": round(DESTINATION["latitude"] + lat_jitter, 6),
        "longitude": round(DESTINATION["longitude"] + lon_jitter, 6),
    }


def generate_users_csv(count: int = 20) -> None:
    users = []

    for i in range(1, count + 1):
        users.append(build_user(i))

    df = pd.DataFrame(users)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(OUTPUT_FILE, index=False)

    print(f"\n✅ CSV created successfully!")
    print(f"📄 File saved to: {OUTPUT_FILE}")
    print(f"👥 Total users: {count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=20)

    args = parser.parse_args()

    generate_users_csv(count=args.count)