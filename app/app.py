from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError
from app.db import Base, engine
from app.models import User, Activity

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     Base.metadata.create_all(bind=engine)
#     print("Tables created successfully")
#     yield


app = FastAPI(
    title="Discover Local Activities API",
    version="0.1.0",
    description="Backend service for discovering local activities.",
    # lifespan=lifespan
)

@app.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Welcome to Discover Local Activities API"}

@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/health/db")
async def db_health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/debug/tables")
async def list_tables():
    return inspect(engine).get_table_names()