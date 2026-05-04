import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

input_file = BASE_DIR / "data" / "activities.csv"
output_file = BASE_DIR / "data" / "cleaned_activities.csv"

df = pd.read_csv(input_file)

df = df.dropna(subset=["name", "category", "rating", "latitude", "longitude"])

df["rating"] = df["rating"].astype(float)
df["latitude"] = df["latitude"].astype(float)
df["longitude"] = df["longitude"].astype(float)

df["name"] = df["name"].str.strip()
df["category"] = df["category"].str.strip().str.capitalize()
df["working_hours"] = df["working_hours"].str.strip()

df = df[(df["rating"] >= 0) & (df["rating"] <= 5)]
df = df[(df["latitude"] >= -90) & (df["latitude"] <= 90)]
df = df[(df["longitude"] >= -180) & (df["longitude"] <= 180)]

df.to_csv(output_file, index=False)

print(f"Cleaned dataset saved to: {output_file}")
print(f"Total cleaned records: {len(df)}")