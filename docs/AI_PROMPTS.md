# GreenCampus — AI Prompts Log

This document records the prompts used to guide the development of GreenCampus:

### Phase 1 Prompts:

1. **Initial Inspection**:
   *"Inspect and understand the existing repository. Technology: React Native, Expo SDK 57, TypeScript, Expo Router, Expo Go for Android testing. Analyze project structure, application start, Expo router configuration, dependencies, and safe modification strategy."*

2. **Welcome Screen Implementation**:
   *"Replace default Expo starter Home screen with a clean GreenCampus Welcome Screen. Requirements: App name: GreenCampus, Subtitle: 'Smarter Campus. Greener Future.', sustainability visual using existing assets, Login and Create Account buttons, responsive for Android phones, respect existing Expo Router architecture."*

### Phase 2 Prompts:

1. **Advanced Authentication UI & Password Security**:
   *"Upgrade the authentication UI. Minimum password requirements: 8+ chars, uppercase, lowercase, number, special character. Add visual horizontal strength meter (Weak/Fair/Good/Strong), live checklist, 'Suggest Strong Password' programmatic generator, live confirmation match indicator, and reusable password validation utility."*

### Phase 3A Prompts:

1. **FastAPI Backend Foundation**:
   *"Create backend foundation only. Structure: backend/app/(core, db, models, schemas, routers, services, dependencies), requirements.txt, .env.example, README.md. Use FastAPI, Uvicorn, SQLAlchemy, Pydantic Settings, PyMySQL. Minimal endpoints: GET / and GET /health. No tables or authentication yet. Keep mobile isolated."*

### Phase 3B Prompts:

1. **MySQL Database Schema & SQLAlchemy Models**:
   *"Implement Phase 3B: MySQL database schema and SQLAlchemy ORM models. Create models for users, issues, issue_updates, items, borrow_requests, borrow_transactions, green_points, badges, notifications, impact_records. Configure foreign keys, relationships, cascades, indexes, MySQL VARCHAR lengths. Setup Alembic migration engine and document full schema."*

### Full Application Build Prompts:

1. **Complete Application Build**:
   *"Complete the remaining application functionality in ONE continuous development task. Source of truth: mobile/ (React Native, Expo SDK 57, TypeScript, Expo Router) and backend/ (FastAPI, Python, SQLAlchemy 2.x, Alembic, MySQL). Implement all screens, services, APIs, and verification suites."*

### Admin Dashboard Prompts:

1. **Admin Dashboard & Role Authorization**:
   *"Modify and extend the existing codebase to add a complete, functional Admin Dashboard integrated with existing authentication, backend APIs, database models, ResourceCare, GreenShare, gamification, notifications, and sustainability dashboard. Tool: Google AI Studio / Gemini; IDE: VS Code. Enforce backend RBAC (403 Forbidden for students), role-based login routing, ResourceCare resolution workflow with estimated savings recording, circular GreenShare tracking, user directory with role assignment, and SDG-aligned impact accounting."*
