import pandas as pd
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db import engine
from app.models import Activity, WorkingHours

BASE_DIR = Path(__file__).resolve().parent.parent

activity_path = BASE_DIR / "data" / "output" / "cleaned_activities.csv"
working_hours_path = BASE_DIR / "data" / "output" / "working_hours.csv"

activity_df = pd.read_csv(activity_path)
working_hours_df = pd.read_csv(working_hours_path)

# Make seeding rerunnable: clear existing rows and restart serial IDs.
# CASCADE removes dependent working_hours rows when truncating activities.
with engine.begin() as conn:
    conn.execute(text("TRUNCATE TABLE working_hours RESTART IDENTITY"))
    conn.execute(text("TRUNCATE TABLE activities RESTART IDENTITY CASCADE"))

activity_df.to_sql(
    "activities",
    engine,
    if_exists="append",
    index=False
)

working_hours_df.to_sql(
    "working_hours",
    engine,
    if_exists="append",
    index=False
)