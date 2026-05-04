# Discover Local Activities API

A FastAPI-based backend application for discovering nearby activities. This project provides a RESTful API for managing users and activities, including location-based queries.

---

## 🚀 Features

* User and Activity management
* PostgreSQL database integration
* FastAPI for high-performance APIs
* SQLAlchemy ORM
* Auto-reload during development
* Scalable project structure

---

## 🏗️ Project Structure

```
DiscoverLocalActivities/
│
├── app/
│   ├── __init__.py
│   ├── app.py          # FastAPI entry point
│   ├── db.py           # Database connection
│   ├── models.py       # SQLAlchemy models
│   ├── schemas.py      # Pydantic schemas (optional)
│   ├── crud.py         # Database operations (optional)
│
├── .venv/
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```
git clone <your-repo-url>
cd DiscoverLocalActivities
```

### 2. Create virtual environment

```
uv venv --python 3.12
source .venv/bin/activate   # Mac/Linux
venv\Scripts\Activate # Windows
```

### 3. Install dependencies

```
uv add -r requirements.txt
```

---

## 🐳 Docker Setup

Make sure Docker Desktop is running.

Run:

```
docker compose up
```

---

## 🗄️ Database Setup

Update your database connection in `app/db.py`:

```
DATABASE_URL = "postgresql://user:password@localhost/dbname"
```

Make sure PostgreSQL is running and the database exists.

---

## ▶️ Running the Application

From the project root:

```
must be in virtual enviroment
check step 2 for virtual enviroment activation

python ./main.py
```

API will be available at:

```
http://127.0.0.1:8000
```

Interactive docs:

```
http://127.0.0.1:8000/docs
```

---

## 📦 Example Models

### User

* id
* name

### Activity

* id
* name
* type
* latitude
* longitude
* rating

---

## 📍 Example Endpoint

```
GET /activities/nearby?lat=41.9981&lng=21.4254
```

Returns activities near given coordinates.

---

## ⚠️ Common Issues

### 1. ModuleNotFoundError: No module named 'db'

Fix:

* Use absolute imports:

```
from app.db import engine
```

### 2. Docker daemon not running

Start Docker Desktop before running `docker compose`.

### 3. Uvicorn reload errors

* Ensure `app/__init__.py` exists
* Run from project root

---

## 🧠 Future Improvements

* Authentication (JWT)
* Filtering and search
* User ratings system
* Image uploads for activities
* Frontend integration (Angular)

---

## 👨‍💻 Tech Stack

* FastAPI
* PostgreSQL
* SQLAlchemy
* Uvicorn
* Docker (optional)

---

## 📄 License

This project is for educational purposes.

---

## 🤝 Contributing

Feel free to fork and improve the project.

---
