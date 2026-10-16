# GreenCampus 🌿
**Smarter Campus. Greener Future.**

GreenCampus is a comprehensive, production-style college mobile application designed to help students and university administrators identify, report, resolve, measure, and reward campus sustainability activities.

---

## 📌 Project Objectives
The platform implements a continuous sustainability loop:
$$\text{IDENTIFY} \longrightarrow \text{REPORT} \longrightarrow \text{RESOLVE} \longrightarrow \text{MEASURE} \longrightarrow \text{REWARD} \longrightarrow \text{IMPROVE}$$

1. **ResourceCare**: Report campus resource wastage (water leakages, electricity waste, overflowing bins).
2. **GreenShare**: Share and borrow campus items to avoid unnecessary single-use purchases.
3. **Green Points & Badges**: Incentivize verified environmental actions.
4. **Campus Leaderboard**: Engage students in friendly college sustainability competition.
5. **Impact Dashboard**: Real-time aggregation of estimated water saved, energy conserved, and waste diverted.
6. **Administrator Portal**: Triage, assign, resolve, and quantify campus sustainability metrics.

---

## 🛠 Technology Stack
- **Mobile Client**: React Native, Expo SDK 57, TypeScript, Expo Router
- **Backend API**: Python, FastAPI, SQLAlchemy, Alembic, Pydantic, JWT *(Phase 3+)*
- **Database**: MySQL *(Phase 3+)*
- **Cloud Storage**: Cloudinary *(Phase 6+)*
- **Testing**: Expo Go on Android

---

## 🎨 Design System & Palette
- **Primary Deep Green**: `#2E7D32` (Brand anchor, primary actions, success)
- **Light Green**: `#81C784` (Emblem borders, subtle highlights)
- **Teal**: `#00897B` (Environmental auditing, secondary actions)
- **Blue**: `#1976D2` (Clean power, navigation, system features)
- **Amber**: `#F9A825` (Points, rewards, badges, achievements)
- **Background**: `#F8FAF8` (Off-white canvas for high readability)
- **Main Text**: `#263238` (High-contrast charcoal slate)
- **Surface White**: `#FFFFFF` (Cards, elevated containers)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Expo Go installed on your Android device

### Running the Mobile Application
```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies (if not already installed)
npm install

# Start the Expo development server
npx expo start
```
Scan the QR code with **Expo Go** on your Android device to load the application.

### Running the Backend API & Admin Setup
```bash
# Navigate to backend directory
cd backend

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Create or promote an Admin account for local testing (development utility)
python scripts/create_admin.py --email admin@campus.edu --password <YourStrongPassword!> --name "Campus Administrator"
```
When logging into the mobile application:
- Users with role `student` automatically enter the **Student Hub** (`/dashboard`).
- Users with role `admin` automatically enter the **Admin Dashboard** (`/admin`).
- Students attempting to query `/api/v1/admin/*` endpoints receive a `403 Forbidden` response.

---

## 📁 Repository Structure
```text
GreenCampus/
├── mobile/                   # React Native (Expo SDK 57) client
│   ├── src/
│   │   ├── app/              # Expo Router routes (student + admin screens)
│   │   │   ├── admin/        # Dedicated Admin Portal (overview, resourcecare, greenshare, users, impact, profile)
│   │   │   ├── resourcecare/ # Student Wastage reporting & tracking
│   │   │   ├── greenshare/   # Student circular economy marketplace
│   │   │   ├── dashboard.tsx # Student sustainability hub
│   │   │   └── ...
│   │   ├── components/       # Reusable UI components & password entropy meter
│   │   ├── constants/        # Design system tokens (Colors, Spacing)
│   │   ├── contexts/         # Authentication context (RBAC & JWT token storage)
│   │   ├── services/         # Centralized typed HTTP API service (student + admin)
│   │   └── hooks/            # Custom React hooks (useTheme, useColorScheme)
│   ├── assets/               # Local icons and images
│   ├── app.json              # Expo configuration
│   └── tsconfig.json         # TypeScript configuration
├── backend/                  # FastAPI + SQLAlchemy + MySQL backend
│   ├── app/
│   │   ├── routers/          # Modular API routers (auth, issues, items, borrow, gamification, admin)
│   │   ├── services/         # Domain services (issue status workflow, impact calculation, points)
│   │   ├── models/           # SQLAlchemy ORM models (11 tables)
│   │   ├── schemas/          # Pydantic request/response validation schemas
│   │   └── dependencies/     # RBAC authorization dependencies (get_current_admin)
│   ├── scripts/              # Developer utilities (create_admin.py)
│   └── tests/                # Automated pytest integration test suite
├── docs/                     # Project documentation & college report logs
│   ├── AI_PROMPTS.md
│   ├── AI_CONTRIBUTIONS.md
│   ├── DEVELOPMENT_LOG.md
│   └── DATABASE_SCHEMA.md
└── README.md
```

---

## 📖 Documentation
- [Development Log](docs/DEVELOPMENT_LOG.md)
- [AI Contributions](docs/AI_CONTRIBUTIONS.md)
- [AI Prompts Log](docs/AI_PROMPTS.md)
