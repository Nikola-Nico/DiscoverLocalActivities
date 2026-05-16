from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db import Base, engine
from app.models import Activity, User


def initialize_database() -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully")
    except SQLAlchemyError:
        print("PostgreSQL is not available. Starting FastAPI without database initialization.")

if __name__ == "__main__":
    initialize_database()
    import uvicorn
    uvicorn.run("app.app:app", host="127.0.0.1", port=8000, reload=True)