<div style="display: flex; justify-content: space-between; gap: 16px;">
  <h1>Discover Local Activities</h1>
  <img src="./public/idovGQseqn_logos.png" alt="Brainster Next" style="max-width: 100px; border-radius:50px;" />
</div>

## Technical Documentation — Handover and Deployment

**Institution:** Brainster Next College of Higher Education  
**Students:**

- Viktor Stojanovski (А24118)
- Nikola Hristov (А24108)
- Nikola Chakar (А24111)
- Pavel Tanaskovski (А24136)
- Matej Taleski (А24109)

**Programme:** Software Engineering and Innovation  
**Client:** Hubby / *"The project was developed as a functional prototype"*  
**Date:** June 2026

---

## Table of Contents

1. Introduction
2. Project Implementation Prerequisites
3. Technologies Used
4. Technical Report (Problem, Solution, Architecture)
5. Installation and Setup Steps
6. Environment Configuration
7. AI Components and Tools
8. User Guide and Functionalities
9. API Documentation
10. Database
11. Glossary
12. Appendices

---

## 1. Introduction

Discover Local Activities is a web application developed as a functional prototype whose goal is to help users find activities and places of interest in their vicinity. The system uses geographic coordinates, working hours, and additional activity information in order to display relevant recommendations.

The application enables management of users, activities, and working hours, as well as calculation of recommendations based on distance and activity availability.

- **What the project is:** A web application for discovering and recommending local activities near the user.
- **Why it was built:** To enable easy searching and recommendation of activities based on location, working hours, and other relevant factors.
- **Who it is intended for:** Users who want to find interesting places and activities in their surroundings.

> **Note on external services:** In its current version, the application does not depend on external API services with rate limits — all data is stored locally in the PostgreSQL database. If an external service is integrated in future versions (e.g. Google Places API live data), the system should implement a fallback mechanism that displays cached results when the service is unavailable.

---

## 2. Project Implementation Prerequisites

- **Operating System:** Windows 10, Windows 11, Linux, macOS
- **Software Tools:** Python 3.12+, Node.js 18+, npm, uv package manager, Docker, Docker Compose, Git
- **Additional Tools:** Google Chrome, Microsoft Edge, or Mozilla Firefox; a terminal for executing commands

---

## 3. Technologies Used

- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy, Pydantic, psycopg2-binary, python-dotenv
- **Frontend:** React, TypeScript, Vite, React Leaflet, Leaflet, TailwindCSS, react-infinite-scroll-component
- **Database:** PostgreSQL
- **Authentication and Security:** Pydantic Validation, FastAPI Request Validation
- **External Services and Libraries:** Swagger UI, Docker, Git, GitHub, Google Places Dataset
- **AI Tools Used in Development:** ChatGPT, GitHub Copilot, Claude, Gemini

---

## 4. Technical Report

### 4.1 Problem

When someone wants to find something interesting to do nearby — a café, restaurant, sports court, or some event — they usually end up searching through several different applications, asking friends, or simply giving up. There is no single place where they can check what is open, how far away it is, and whether it actually matches what they are looking for. This problem is especially pronounced for people who are in an unfamiliar part of the city or simply do not know what options are available near them.

### 4.2 Solution

Discover Local Activities is an application that brings all local activities together in one place and allows users to find what suits them — quickly and easily. Specifically, the application offers:

- **Location-based search** — the user enters their coordinates and immediately receives a list of nearby activities, calculated via the Haversine algorithm.
- **Real-time working hours** — each activity has recorded working hours, so users can filter for places that are currently open.
- **Personalized recommendations** — the system learns from the user's preferences and suggests activities they are likely to enjoy.
- **Automated data import** — activity data is processed and loaded via ready-made scripts, without manual entry.

### 4.3 Architecture

The application is built as a Client-Server system with a REST API and SPA architecture, with a well-organized structure where each part knows its responsibility:

- `main.py` starts the server via Uvicorn, while `app/app.py` is the heart of the FastAPI application.
- The routers (`activities.py`, `users.py`, `recommendations.py`, `working_hours.py`) contain the logic for each part of the application — each in its own file, without cross-contamination.
- The models in `app/models.py` describe the database structure via the SQLAlchemy ORM.
- The schemas in `app/schemas.py` use Pydantic to ensure that incoming and outgoing data is valid.
- The helper functions in `app/helper/` perform concrete calculations — distance between points, result filtering, and recommendation logic.
- The database is PostgreSQL and is started via Docker with a single command.

---

## 5. Installation and Setup Steps

### 5.1 Cloning the Project

```bash
git clone https://github.com/Nikola-Nico/DiscoverLocalActivities.git
cd DiscoverLocalActivities
```

### 5.2 Installing Dependencies

**It is recommended to use uv — faster and more convenient than the standard pip.**

With uv (recommended):

```bash
# Create a virtual environment with Python 3.12
uv venv --python 3.12

# Activation
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\Activate     # Windows

# Installation
uv add -r requirements.txt

# Sync
uv sync
```

With pip (alternative):

```bash
python -m venv .venv  # VERSION MUST BE >=3.12

# Activation
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\Activate     # Windows

# Installation
pip install -r requirements.txt
```

The project uses: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `psycopg2-binary`, `requests`, and `python-dotenv`.

### 5.3 Database Setup

- **Windows / Mac:** Make sure Docker Desktop is running.
- **Linux:** Make sure the Docker service is running.

```bash
docker compose up -d

# For debugging (with terminal logging):
docker compose up
```

This automatically creates a PostgreSQL container with the following parameters:

| Parameter | Value |
|---|---|
| User | `discover_user` |
| Password | `discover_password` |
| Database | `discover_local_activities` |
| Port | `5432` |

Open `app/db.py` and verify that the connection string looks like this:

```
DATABASE_URL = "postgresql://discover_user:discover_password@localhost/discover_local_activities"
```

Seeding the database with initial data (after the first run of `main.py`):

```bash
python scripts/preprocess_activities_tsv.py
python scripts/seed_activity_table.py
python scripts/generate_dummy_users.py
```

### 5.4 Frontend Setup

```bash
cd frontend
npm install
npm install tailwindcss @tailwindcss/vite
npm install leaflet
npm i react-infinite-scroll-component
npm install @fortawesome/fontawesome-free
```

### 5.5 Starting the Application

**Backend:**

```bash
# Make sure you are in the virtual environment (step 5.2)
python ./main.py
# With uv:
uv run ./main.py
```

After starting, the application is available at:

- API: http://127.0.0.1:8000
- Swagger documentation: http://127.0.0.1:8000/docs

**Frontend:**

```bash
cd frontend
npm run dev
```

The frontend opens at http://localhost:5173 (or http://[::1]:5173).

---

## 6. Environment Configuration

### PostgreSQL Environment Variables

When PostgreSQL is started via Docker, the following environment variables are used to configure the database:

| Variable | Purpose | Example Value |
|---|---|---|
| `POSTGRES_USER` | Username for connecting to the database | `discover_user` |
| `POSTGRES_PASSWORD` | Authentication password | `discover_password` |
| `POSTGRES_DB` | Name of the database created on first start | `discover_local_activities` |

### Database URL

The `DATABASE_URL` is defined in `app/.env.example` — it is loaded via python-dotenv and used by SQLAlchemy to connect to the database. The format is:

```
postgresql://USER:PASSWORD@HOST:PORT/DB
```

In a local development environment:

```
DATABASE_URL=postgresql://discover_user:discover_password@localhost:5432/discover_local_activities
```

### 6.1 Localhost Ports

| Port | Service | Description |
|---|---|---|
| `8000` | Backend (FastAPI) | The application's REST API. HTTP requests are sent here. Started with `uvicorn main:app --reload`. |
| `5173` | Frontend (Vite / React) | The user interface in the browser. Vite dev server automatically proxies API requests to port 8000. |
| `5432` | PostgreSQL | Standard PostgreSQL port. The backend connects via `DATABASE_URL`. |

### 6.2 Docker Compose — PostgreSQL Configuration

In `compose.yaml`, environment variables are set as follows:

```yaml
environment:
  POSTGRES_USER: discover_user
  POSTGRES_PASSWORD: discover_password
  POSTGRES_DB: discover_local_activities
```

---

## 7. AI Components and Tools

The following AI tools were used during the development of the project:

- **Claude (Anthropic)** — Used for code generation, documentation, debugging, and architectural decisions.
- **Gemini (Google)** — Used for additional assistance during development and researching solutions.
- **GitHub Copilot (Microsoft / OpenAI)** — Used directly in the editor (VS Code) for code autocomplete and inline suggestions.
- **ChatGPT (OpenAI)** — Used for consultations and generating implementation ideas.

> All AI tools were used exclusively as assistive aids during development. Final decisions regarding architecture, code, and logic were made and verified by the team.

---

## 8. User Guide and Functionalities

### 8.1 User Roles

In its current prototype version, the application supports two user roles:

**User:**

- Search for activities by geographic location (latitude and longitude)
- Filter activities by category and working hours (currently open)
- View an interactive map with marked activities
- View details for a specific activity (description, address, working hours, rating)
- Receive personalized recommendations based on preferences

**Administrator:**
- Everything a regular user can do
- Add, edit, and delete activities
- Manage activity working hours
- View and manage users

### 8.2 Key Functionalities Overview

**Feature 1: Location-based Activity Search**

- **Description:** The user enters their geographic coordinates (latitude and longitude) and a search radius. The system applies the Haversine algorithm to calculate distances to all activities and returns a list sorted by recommendation score.
- **User flow:** Enter coordinates → set radius → browse list of activities
- **Visual:**
  _(Insert a screenshot of the main page with the coordinate form and list of results here)_
  _Figure 1: Main page — location search form and list of activities_

---

**Feature 2: Interactive Map**

- **Description:** Alongside the list, activities are displayed on an interactive map via React Leaflet. Each activity is marked with a marker. The user can click on a marker to see details.
- **User flow:** Search for activities → browse map → click on marker → view details
- **Visual:**
  _(Insert a screenshot of the map with activity markers here)_
  _Figure 2: Interactive map with marked activity locations_

---

**Feature 3: Filter by Working Hours**

- **Description:** The user can activate a "Currently Open" filter, which causes the system to display only activities that are open at the time of the search, based on their stored working hours and the current day/time.
- **User flow:** Search for activities → enable "Currently Open" → browse filtered list
- **Visual:**
  _(Insert a screenshot with the working hours filter active here)_
  _Figure 3: Activity list with the "Currently Open" filter activated_

---

**Feature 4: Personalized Recommendations**

- **Description:** The system calculates recommendations for the user based on several factors: distance to the activity, rating, popularity, and category relevance. Each activity receives a combined score based on which it is ranked.
- **User flow:** Enter user ID and coordinates → receive a list of recommended activities
- **Visual:**
  _(Insert a screenshot of the recommendations page here)_
  _Figure 4: Personalized recommendations page with ranked activities_

---

**Feature 5: Infinite Scroll**

- **Description:** The activity list is not loaded all at once — data is loaded progressively as the user scrolls down, via `react-infinite-scroll-component`. This improves performance when there is a large number of results.
- **User flow:** Search → scroll → new activities load automatically

---

## 9. API Documentation

All API routes are available at the base URL `http://127.0.0.1:8000`. The interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`. The application does not use token-based authentication in the current prototype version.

---

### Activities (`/activities`)

**`GET /activities`**

- **Purpose:** Retrieve a list of activities with support for filtering by location, category, and working hours.
- **Authentication:** No
- **Query Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `limit` | integer | No | Maximum number of results to return (default: 20) |
| `category` | string | No | Category to filter results by |
| `min_rating` | number | No | Minimum rating for filtering |
| `min_rating_count` | integer | No | Minimum total number of user ratings |
| `open_now` | boolean | No | Flag to filter only currently open venues |

- **Successful Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Matto Napoletano",
    "type": "italian_restaurant",
    "phone_number": "+389 71 343 063",
    "latitude": 41.9963473,
    "longitude": 21.4243335,
    "rating": 4.7,
    "user_rating_count": 3580,
    "created_at": "2026-06-03T19:45:00.445827Z",
    "updated_at": null,
    "working_hours": []
  }
]
```

---

**`GET /activities/{activity_id}`**

- **Purpose:** Retrieve details for a single activity by its ID.
- **Authentication:** No
- **Path Parameter:** `activity_id` (integer) — ID of the activity
- **Successful Response (200 OK):**

```json
{
  "id": 1,
  "name": "Matto Napoletano",
  "type": "italian_restaurant",
  "phone_number": "+389 71 343 063",
  "latitude": 41.9963473,
  "longitude": 21.4243335,
  "rating": 4.7,
  "user_rating_count": 3580,
  "created_at": "2026-06-03T19:45:00.445827Z",
  "updated_at": null,
  "working_hours": []
}
```

---

**`POST /activities`**

- **Purpose:** Create a new activity in the database.
- **Authentication:** No (in the current prototype)
- **Request Body (JSON):**

```json
{
  "id": 0,
  "name": "string",
  "type": "other",
  "phone_number": "string",
  "latitude": -90,
  "longitude": -180,
  "rating": 5,
  "user_rating_count": 0
}
```

- **Successful Response (201 Created):**

```json
{
  "id": 0,
  "name": "string",
  "type": "other",
  "phone_number": "string",
  "latitude": -90,
  "longitude": -180,
  "rating": 5,
  "user_rating_count": 0,
  "created_at": "2026-06-05T10:39:20.348Z",
  "updated_at": "2026-06-05T10:39:20.348Z",
  "working_hours": []
}
```

---

**`PUT /activities`**

- **Purpose:** Update an existing activity in the database.
- **Authentication:** No (in the current prototype)
- **Request Body (JSON):**

```json
{
  "id": 0,
  "name": "string",
  "type": "other",
  "phone_number": "string",
  "latitude": -90,
  "longitude": -180,
  "rating": 5,
  "user_rating_count": 0
}
```

- **Successful Response (200 OK):**

```json
{
  "id": 0,
  "name": "string",
  "type": "other",
  "phone_number": "string",
  "latitude": -90,
  "longitude": -180,
  "rating": 5,
  "user_rating_count": 0,
  "created_at": "2026-06-05T10:39:20.348Z",
  "updated_at": "2026-06-05T10:39:20.348Z",
  "working_hours": []
}
```

---

### Users (`/users`)

**`GET /users`**

- **Purpose:** Retrieve a list of all users.
- **Authentication:** No
- **Query Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `limit` | integer | No | Limit for results returned (default: 20) |
| `latitude` | number | No | User's latitude |
| `longitude` | number | No | User's longitude |
| `radius_km` | number | No | Recommendation radius size (default: 1.0) |

- **Successful Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Ivana",
    "surname": "Trajkov",
    "email": "ivana.trajkov1@outlook.com",
    "destination": "Skopje",
    "latitude": 42.004302,
    "longitude": 21.410442,
    "created_at": "2026-06-03T19:45:06.335487Z",
    "updated_at": null
  }
]
```

---

**`GET /users/{user_id}`**

- **Purpose:** Retrieve a single user by ID.
- **Authentication:** No
- **Path Parameter:** `user_id` (integer)
- **Successful Response (200 OK):**

```json
{
  "id": 1,
  "name": "Ivana",
  "surname": "Trajkov",
  "email": "ivana.trajkov1@outlook.com",
  "destination": "Skopje",
  "latitude": 42.004302,
  "longitude": 21.410442,
  "created_at": "2026-06-03T19:45:06.335487Z",
  "updated_at": null
}
```

---

**`POST /users`**

- **Purpose:** Create a new user.
- **Authentication:** No
- **Request Body (JSON):**

```json
{
  "id": 0,
  "name": "string",
  "surname": "string",
  "email": "string",
  "destination": "string",
  "latitude": -90,
  "longitude": -180
}
```

- **Successful Response (201 Created):**

```json
{
  "id": 0,
  "name": "string",
  "surname": "string",
  "email": "string",
  "destination": "string",
  "latitude": -90,
  "longitude": -180,
  "created_at": "2026-06-05T10:45:28.741Z",
  "updated_at": "2026-06-05T10:45:28.741Z"
}
```

---

**`PUT /users`**

- **Purpose:** Update an existing user in the database.
- **Authentication:** No (in the current prototype)
- **Request Body (JSON):**

```json
{
  "id": 0,
  "name": "string",
  "surname": "string",
  "email": "string",
  "destination": "string",
  "latitude": -90,
  "longitude": -180
}
```

- **Successful Response (200 OK):**

```json
{
  "id": 0,
  "name": "string",
  "surname": "string",
  "email": "string",
  "destination": "string",
  "latitude": -90,
  "longitude": -180,
  "created_at": "2026-06-05T10:45:28.741Z",
  "updated_at": "2026-06-05T10:45:28.741Z"
}
```

---

### Recommendations (`/recommendations`)

**`GET /recommendations`**

- **Purpose:** Retrieve personalized activity recommendations for a specific user, based on location, rating, popularity, and category.
- **Authentication:** No
- **Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user_id` | integer | Yes | ID of the user for whom recommendations are generated |
| `lat` | float | Yes | User's latitude |
| `lon` | float | Yes | User's longitude |
| `radius_km` | float | No | Recommendation radius size (default: 1.0) |

- **Successful Response (200 OK):**

```json
{
  "user_location": {
    "latitude": 42.004302,
    "longitude": 21.410442
  },
  "radius_km": 1,
  "context": "general",
  "response_timestamp": "2026-06-05T13:05:19+02:00",
  "results_count": 29,
  "activities": []
}
```

---

### Working Hours (`/working-hours`)

**`GET /working-hours/{activity_id}`**

- **Purpose:** Retrieve the working hours for a specific activity, by day of the week.
- **Authentication:** No
- **Path Parameter:** `activity_id` (integer)
- **Successful Response (200 OK):**

```json
{
  "user_id": 1,
  "user_location": {
    "latitude": 42.004302,
    "longitude": 21.410442
  },
  "radius_km": 1,
  "context": "general",
  "response_timestamp": "2026-06-05T13:05:19+02:00",
  "results_count": 29,
  "activities": []
}
```

> `day_of_week`: 0 = Sunday, 1 = Monday, ... 6 = Saturday

---

**`POST /working-hours/{activity_id}`**

- **Purpose:** Add working hours for a specific activity.
- **Authentication:** No
- **Request Body (JSON):**

```json
{
  "id": 0,
  "activity_id": 0,
  "day_of_week": "string",
  "open_time": "string",
  "close_time": "string",
  "break_hour_start": "string",
  "break_hour_end": "string",
  "is_open_24h": false,
  "is_closed": false
}
```

- **Successful Response (201 Created):**

```json
{
  "id": 0,
  "activity_id": 0,
  "day_of_week": "string",
  "open_time": "string",
  "close_time": "string",
  "break_hour_start": "string",
  "break_hour_end": "string",
  "is_open_24h": false,
  "is_closed": false,
  "created_at": "2026-06-05T11:08:47.341Z",
  "updated_at": "2026-06-05T11:08:47.341Z"
}
```

---

## 10. Database

### 10.1 Database Diagram (ER Diagram)

```mermaid
erDiagram
    users {
        INT id PK
        VARCHAR name
        VARCHAR surname
        VARCHAR email
        VARCHAR destination
        FLOAT latitude
        FLOAT longitude
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    activities {
        INT id PK
        VARCHAR phone_number
        FLOAT latitude
        FLOAT longitude
        FLOAT rating
        INT user_rating_count
        VARCHAR name
        VARCHAR type
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    working_hours {
        INT id PK
        INT activity_id FK
        VARCHAR day_of_week
        VARCHAR open_time
        VARCHAR close_time
        VARCHAR break_hour_start
        VARCHAR break_hour_end
        BOOL is_open_24h
        BOOL is_closed
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    activities ||--o{ working_hours : "has"
```

_Figure 5: ER Diagram of the project's relational database_

> **Note:** The diagram is rendered in Mermaid notation. Rendering requires GitHub, VS Code with a Mermaid extension, or another Mermaid-compatible viewer.

### 10.2 Description of Key Tables

**Table `users`** — Stores information about registered users.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | INT | Primary Key, Auto-increment | Unique identifier of the user |
| `name` | VARCHAR | Unique, Not Null | User's first name |
| `surname` | VARCHAR | Not Null | User's last name |
| `email` | VARCHAR | Not Null | User's email address |
| `destination` | VARCHAR | Not Null | User's destination |
| `latitude` | FLOAT | | User's latitude (for recommendations) |
| `longitude` | FLOAT | | User's longitude (for recommendations) |
| `created_at` | TIMESTAMP | Default: now() | Date and time of creation |
| `updated_at` | TIMESTAMP | Default: now() | Date and time of last update |

---

**Table `activities`** — Stores information about local activities.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | INT | Primary Key, Auto-increment | Unique identifier of the activity |
| `name` | VARCHAR | Not Null | Name of the activity |
| `phone_number` | VARCHAR | Null | Phone number of the activity |
| `latitude` | FLOAT | Not Null | Geographic latitude of the location |
| `longitude` | FLOAT | Not Null | Geographic longitude of the location |
| `rating` | FLOAT | | Average rating (0.0 – 5.0) |
| `user_rating_count` | INT | Default: 0 | Popularity (number of visits/interactions) |
| `type` | VARCHAR | | Category (e.g. park, café, sport) |
| `created_at` | TIMESTAMP | Default: now() | Date and time of creation |
| `updated_at` | TIMESTAMP | Default: now() | Date and time of last update |

---

**Table `working_hours`** — Stores the working hours of activities by day.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | INT | Primary Key, Auto-increment | Unique identifier of the record |
| `activity_id` | INT | Foreign Key → `activities.id` | Belongs to an activity |
| `day_of_week` | INT | 0–6 (0 = Sunday) | Day of the week |
| `open_time` | VARCHAR | 00:00-24:00 | Opening time |
| `close_time` | VARCHAR | 00:00-24:00 | Closing time |
| `break_hour_start` | VARCHAR | 00:00-24:00 | Break start time |
| `break_hour_end` | VARCHAR | 00:00-24:00 | Break end time |
| `is_open_24h` | BOOL | | Whether the activity is open 24 hours |
| `is_closed` | BOOL | | Whether the activity is closed |
| `created_at` | TIMESTAMP | Default: now() | Date and time of creation |
| `updated_at` | TIMESTAMP | Default: now() | Date and time of last update |

> Each activity can have up to 7 records in this table (one for each day of the week). If there is no record for a given day, the activity is considered closed on that day.

---

## 11. Glossary

This section defines the specific technical terms, abbreviations, and concepts used throughout the document, in order to avoid ambiguity and facilitate understanding.

| Term / Abbreviation | Definition / Explanation |
|---|---|
| **API** (Application Programming Interface) | A set of rules and protocols that allow different software applications to communicate with each other. In this project, FastAPI exposes the backend's REST API. |
| **Backend** | The server-side part of the application that contains the business logic, database, and API routes. In this project it is implemented with FastAPI and Python. |
| **Docker** | A containerization platform that allows applications to be packaged together with their dependencies and run in isolation. Used for starting the PostgreSQL database. |
| **Docker Compose** | A tool for defining and running multiple Docker containers via a single YAML configuration file (`compose.yaml`). |
| **Environment Variable** | A dynamic value configured outside the source code, typically in a `.env` file. Used to store sensitive data such as passwords and database URLs. |
| **FastAPI** | A modern, fast web framework for building APIs with Python 3.12+, based on standard Python type hints. It serves the application's backend. |
| **Frontend** | The client-side part of the application that displays the user interface in the browser. In this project it is implemented with React, TypeScript, and Vite. |
| **Haversine Algorithm** | A mathematical formula for calculating the shortest distance between two points on a sphere (the Earth) based on their geographic coordinates (latitude and longitude). |
| **SPA** (Single Page Application) | A web application that loads only a single HTML page and dynamically updates the content as the user interacts with it, without requiring a full page reload from the server. This enables a faster, smoother, and more fluid user experience. |
| **npm** (Node Package Manager) | The standard package manager for the Node.js and JavaScript ecosystem. Used for installing frontend dependencies. |
| **ORM** (Object-Relational Mapper) | A technique that allows interaction with a relational database through Python objects instead of writing SQL directly. In this project, SQLAlchemy is used. |
| **PostgreSQL** | A powerful open-source relational database management system (RDBMS). It constitutes the project's database and is started via Docker. |
| **Pydantic** | A Python library for data validation using type hints. In FastAPI it is used to define schemas and automatically validate HTTP requests and responses. |
| **React** | A JavaScript library for building user interfaces through components. Used for the application's frontend. |
| **REST** (Representational State Transfer) | An architectural style for designing networked applications. This project's REST API uses standard HTTP methods (GET, POST, PUT, DELETE) for communication between the frontend and backend. |
| **SQLAlchemy** | A Python ORM library that allows defining tables and relationships in the database through Python classes and executing SQL operations without writing SQL manually. |
| **Swagger UI** | Automatically generated interactive web documentation for the REST API. Available at `http://127.0.0.1:8000/docs` after the backend is started. |
| **TailwindCSS** | A utility-first CSS framework for quickly styling user interfaces directly in HTML/JSX classes. Used in the frontend. |
| **TypeScript** | A superset of JavaScript that adds static typing. Used in the frontend for greater safety and code readability. |
| **uv** | A fast Python package manager written in Rust, which serves as an alternative to pip. Recommended for installing dependencies in this project. |
| **Uvicorn** | An ASGI (Asynchronous Server Gateway Interface) web server for Python. It starts and serves the FastAPI backend. |
| **Virtual Environment** | An isolated Python environment that allows installing packages specific to one project without affecting the system Python or other projects. |
| **Vite** | A modern frontend build tool that offers a fast development environment. Used to run the React frontend in a development environment. |

---

## 12. Appendices

### 12.1 Key Files

The following files and folders are the most important for understanding and working with the project:

| File / Path | Purpose and Description |
|---|---|
| `compose.yaml` | Docker Compose configuration for starting the PostgreSQL container in the local development environment. Defines environment variables, ports, and volumes for the database. |
| `requirements.txt` | List of all Python packages (dependencies) required for the backend. Used with `pip` or `uv` for installation: `uv add -r requirements.txt`. |
| `frontend/package.json` | Node.js project configuration file that lists all npm dependencies for the frontend (React, Vite, Leaflet, TailwindCSS, etc.) and defines the dev/build scripts. |
| `main.py` | Application entry point. Starts the Uvicorn server and initializes database tables on first run. |
| `app/app.py` | Main FastAPI application instance. Registers all routers (activities, users, recommendations, working_hours) and configures CORS settings. |
| `app/db.py` | Contains `DATABASE_URL` and the SQLAlchemy–PostgreSQL connection configuration. The connection string is updated here if database parameters change. |
| `app/models.py` | SQLAlchemy ORM models that describe the database table structure (users, activities, working hours). |
| `app/schemas.py` | Pydantic schemas for validating and serializing API input and output data. Defines Request and Response models. |
| `app/helper/` | Folder containing helper functions: distance calculation via the Haversine algorithm, recommendation and scoring logic, and activity filtering. |
| `app/.env.example` | Template file showing the format of the `DATABASE_URL` environment variable. Should be copied to `.env` and filled in with real values before starting. |
| `scripts/` | Scripts for one-time database seeding: `preprocess_activities_tsv.py` (TSV processing), `seed_activity_table.py` (activity loading), and `generate_dummy_users.py` (test users). |
| `frontend/src/hooks/` | React custom hooks for fetching data from the backend (`useActivities`, `useUsers`). They abstract the HTTP request logic and state management. |

### 12.2 External Links

- **GitHub Repository:** https://github.com/Nikola-Nico/DiscoverLocalActivities
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **SQLAlchemy Documentation:** https://docs.sqlalchemy.org/
- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **Docker Documentation:** https://docs.docker.com/
- **Leaflet / React Leaflet Documentation:** https://leafletjs.com/ and https://react-leaflet.js.org/
- **TailwindCSS Documentation:** https://tailwindcss.com/docs/
- **Swagger UI (local):** http://127.0.0.1:8000/docs

---

### A Few Important Notes for Completion (based on documentation improvement feedback):

1. **Physically embedded diagrams and images:** Do not leave only links for the ER diagram or screenshots. All diagrams and images must be physically embedded in the document, and each image must have a formal caption (e.g. _Figure 1: User management page_).
2. **Clear configuration comments:** If you use specific values (such as a non-standard database port, e.g. `25001`), add a brief comment explaining why that value was chosen (e.g. _"to avoid conflicts with a local MySQL server"_).
3. **Technical limitations:** If you have integrations with external services, it is useful to note in the Introduction or Technical Report how the system behaves if those services are unavailable (e.g. API rate limit exceeded).
4. **Language consistency:** Strive to maintain consistent language throughout the document. If using English, it is recommended that developer terms be used in their standard English form, with any local-language equivalents noted in parentheses on first mention.
