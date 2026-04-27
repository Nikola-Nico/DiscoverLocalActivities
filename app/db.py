from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine(
    "postgresql://discover_user:discover_password@localhost:5432/discover_local_activities"
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()