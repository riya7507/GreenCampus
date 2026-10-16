# GreenCampus Backend Service 🌿

FastAPI + Python + SQLAlchemy backend service for the GreenCampus mobile application.

---

## 📁 Architecture & Directory Structure

```text
backend/
├── app/
│   ├── __init__.py           # Application package
│   ├── main.py               # FastAPI entry point, CORS, root & health routes
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py         # Environment settings via Pydantic BaseSettings
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py        # SQLAlchemy engine, sessionmaker, get_db dependency
│   │   └── base.py           # DeclarativeBase class for ORM models
│   ├── models/               # SQLAlchemy database models (Phase 3B)
│   ├── schemas/              # Pydantic request/response schemas (Phase 3B)
│   ├── routers/              # API endpoints and route controllers
│   ├── services/             # Business logic and external service integrations
│   └── dependencies/         # Reusable FastAPI dependencies (Auth, DB)
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # Setup and run instructions
```

---

## 🛠 Local Setup Instructions

### 1. Create a Python Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # On Linux/macOS
# or: venv\Scripts\activate # On Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
*(Customize `DATABASE_URL` with your local MySQL credentials when ready).*

---

## 🚀 Running the Development Server

Start the server using **Uvicorn** with hot-reload enabled:
```bash
uvicorn app.main:app --reload --port 8000
```

The service will be accessible at:
- **Root Endpoint**: `http://localhost:8000/`
- **Health Check**: `http://localhost:8000/health`
- **Swagger Interactive API Documentation**: `http://localhost:8000/docs`
- **ReDoc Alternative Documentation**: `http://localhost:8000/redoc`

---

## 🧪 Testing the Foundation

### Test Root Endpoint:
```bash
curl http://localhost:8000/
# Expected: {"message": "GreenCampus API is running", ...}
```

### Test Health Endpoint:
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy", ...}
```
