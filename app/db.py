import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://discover_user:discover_password@localhost:5432/discover_local_activities"
)

engine = create_engine(
    DATABASE_URL,
    pool_size=5,          # number of persistent connections
    max_overflow=10,      # extra connections allowed under load
    pool_timeout=30,      # seconds to wait before raising an error
    pool_recycle=1800,    # recycle connections every 30min (prevents stale connections)
    pool_pre_ping=True,   # test connection health before using it
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()