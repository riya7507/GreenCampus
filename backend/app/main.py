"""
GreenCampus FastAPI Main Application Entry Point
Mounts modular routers for Auth, ResourceCare, GreenShare, Gamification,
Dashboard, Notifications, and Admin operations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    admin,
    auth,
    borrow,
    dashboard,
    gamification,
    issues,
    items,
    notifications,
)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GreenCampus Campus Sustainability Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure Cross-Origin Resource Sharing (CORS) for Mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under standard API version prefix (/api/v1)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(issues.router, prefix=settings.API_V1_STR)
app.include_router(items.router, prefix=settings.API_V1_STR)
app.include_router(borrow.router, prefix=settings.API_V1_STR)
app.include_router(gamification.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

# Also mount /auth and /issues at root level for flexible mobile endpoints
app.include_router(auth.router)
app.include_router(issues.router)
app.include_router(items.router)
app.include_router(borrow.router)
app.include_router(gamification.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/", tags=["Root"])
def read_root():
    """
    Root endpoint: Confirms the GreenCampus API is active.
    """
    return {
        "message": "GreenCampus API is running",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "api_v1_prefix": settings.API_V1_STR,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint: Lightweight ping for infrastructure and uptime monitoring.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }
