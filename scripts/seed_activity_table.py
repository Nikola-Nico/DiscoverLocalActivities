import pandas as pd
import sys
from pathlib import Path
from sqlalchemy import create_engine

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db import engine
from app.models import Activity, WorkingHours

BASE_DIR = Path(__file__).resolve().parent.parent

activity_path = BASE_DIR / "data" / "cleaned_activities.csv"
working_hours_path = BASE_DIR / "data" / "working_hours.csv"

activity_df = pd.read_csv(activity_path)
working_hours_df = pd.read_csv(working_hours_path)

activity_df.to_sql(
    "activities",
    engine,
    if_exists="append",   # append data
    index=False
)

working_hours_df.to_sql(
    "working_hours",
    engine,
    if_exists="append",   # append data
    index=False
)