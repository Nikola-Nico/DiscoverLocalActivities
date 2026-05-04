from app.db import engine, Base
from app.models import User, Activity


Base.metadata.create_all(bind=engine)
print("Tables created successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.app:app", host="127.0.0.1", port=8000, reload=True)