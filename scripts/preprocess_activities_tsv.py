import pandas as pd
import preprocess_working_hours as pwh
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "unique_activities.tsv"
OUTPUT_FILE = BASE_DIR / "data" / "cleaned_activities.csv"


def preprocess_activities():
    # Step 1: Read TSV dataset
    df = pd.read_csv(INPUT_FILE, sep="\t")

    print("Original columns:")
    print(df.columns.tolist())

    # Step 2: Match TSV columns with backend Activity schema
    columns_mapping = {
        "places/displayName/text": "name",
        "places/internationalPhoneNumber": "phone_number",
        "places/location/latitude": "latitude",
        "places/location/longitude": "longitude",
        "places/rating": "rating",
        "places/userRatingCount": "user_rating_count",
        "places/primaryType": "type",
        "places/regularOpeningHours/weekdayDescriptions/0": "monday",
        "places/regularOpeningHours/weekdayDescriptions/1": "tuesday",
        "places/regularOpeningHours/weekdayDescriptions/2": "wednesday",
        "places/regularOpeningHours/weekdayDescriptions/3": "thursday",
        "places/regularOpeningHours/weekdayDescriptions/4": "friday",
        "places/regularOpeningHours/weekdayDescriptions/5": "saturday",
        "places/regularOpeningHours/weekdayDescriptions/6": "sunday",
    }

    # Step 3: Keep only useful backend fields
    df = df[list(columns_mapping.keys())]

    # Step 4: Rename columns
    df = df.rename(columns=columns_mapping)

    # Step 5: Normalize missing values
    df["phone_number"] = df["phone_number"].fillna("")
    df["rating"] = df["rating"].fillna(0)
    df["user_rating_count"] = df["user_rating_count"].fillna(0)
    df["type"] = df["type"].fillna("other")

    working_days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]

    for day in working_days:
        df[day] = df[day].fillna("")

    # Step 6: Save cleaned file
    df.to_csv(OUTPUT_FILE, index=False)

    # print("\nCleaned columns:")
    # print(df.columns.tolist())
    # print(f"\nCleaned file created: {OUTPUT_FILE}")

    pwh.build_working_hours(OUTPUT_FILE)
    df = df.drop(columns=working_days)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\nFinal cleaned file with working hours created: {OUTPUT_FILE}")


if __name__ == "__main__":
    preprocess_activities()
