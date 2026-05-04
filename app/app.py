from fastapi import FastAPI
from app.db import engine

app = FastAPI(
    title="Discover Local Activities API",
    version="0.1.0",
    description="Backend service for discovering local activities.",
)

@app.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Welcome to Discover Local Activities API"}

@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/debug/tables")
async def list_tables():
    from sqlalchemy import inspect
    return inspect(engine).get_table_names()