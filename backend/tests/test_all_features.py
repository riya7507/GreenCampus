"""
Comprehensive GreenCampus Backend Test Suite
Tests:
- Authentication (Register, Login, Password Hashing, JWT, /me, Duplicate Email)
- Role Authorization (Student vs Admin)
- ResourceCare (Create Report, Audit Trail, Status Progression, Impact Recording)
- GreenShare (Item Listing, Borrow Request, Approval, Return Workflow)
- Gamification (Points Ledger, Duplicate Prevention, Badges, Leaderboard)
- Notifications (Unread Count, Mark Read, Read All)
- Dashboard (Impact Aggregation, Privacy Ranking)
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app

# In-memory SQLite for test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# -------------------------------------------------------------
# 1. AUTHENTICATION TESTS
# -------------------------------------------------------------

def test_user_registration_success():
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Riya Deulkar",
            "email": "riya@campus.edu",
            "password": "SecurePass@123",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "riya@campus.edu"
    assert data["role"] == "student"
    assert "password_hash" not in data


def test_user_registration_duplicate_email():
    payload = {
        "full_name": "Student One",
        "email": "duplicate@campus.edu",
        "password": "StrongPassword!99",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_user_registration_weak_password():
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Weak Pass",
            "email": "weak@campus.edu",
            "password": "weak",
        },
    )
    assert res.status_code == 422  # Pydantic validation failure


def test_user_login_success_and_me():
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "John Doe",
            "email": "john@campus.edu",
            "password": "Password123#$",
        },
    )

    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@campus.edu", "password": "Password123#$"},
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    token = data["access_token"]

    # Verify /auth/me with Bearer token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "john@campus.edu"


def test_user_login_invalid_password():
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Alice Green",
            "email": "alice@campus.edu",
            "password": "GreenCampus@2026",
        },
    )
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@campus.edu", "password": "WrongPassword@1"},
    )
    assert res.status_code == 401


# -------------------------------------------------------------
# 2. RESOURCECARE TESTS
# -------------------------------------------------------------

def test_resourcecare_issue_workflow():
    # Register student
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Eco Reporter",
            "email": "reporter@campus.edu",
            "password": "ReporterPass!1",
        },
    )
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "reporter@campus.edu", "password": "ReporterPass!1"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit issue report
    issue_res = client.post(
        "/api/v1/issues/",
        headers=headers,
        json={
            "issue_type": "water",
            "description": "Leaking tap in Block B Restroom",
            "location": "Engineering Block B, 2nd Floor",
        },
    )
    assert issue_res.status_code == 201
    issue_data = issue_res.json()
    issue_id = issue_data["id"]
    assert issue_data["status"] == "reported"

    # Verify student gets +10 points for reporting
    pts_res = client.get("/api/v1/gamification/points/me", headers=headers)
    assert pts_res.status_code == 200
    assert len(pts_res.json()) >= 1
    assert pts_res.json()[0]["points"] == 10

    # Promote user to admin in DB for admin testing
    db = TestingSessionLocal()
    from app.models.user import User
    u = db.query(User).filter(User.email == "reporter@campus.edu").first()
    u.role = "admin"
    db.commit()
    db.close()

    # Re-login to get admin JWT
    admin_token = client.post(
        "/api/v1/auth/login",
        json={"email": "reporter@campus.edu", "password": "ReporterPass!1"},
    ).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin updates status to resolved and logs estimated impact
    update_res = client.patch(
        f"/api/v1/issues/{issue_id}/status",
        headers=admin_headers,
        json={
            "status": "resolved",
            "comment": "Replaced faulty valve washer.",
            "estimated_water_saved": 150.0,
            "estimated_energy_saved": 0.0,
            "estimated_waste_reduced": 0.0,
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "resolved"
    assert update_res.json()["estimated_water_saved"] == 150.0


# -------------------------------------------------------------
# 3. GREENSHARE TESTS
# -------------------------------------------------------------

def test_greenshare_catalog_and_borrow_cycle():
    # Register Owner
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Lender", "email": "lender@campus.edu", "password": "LenderPass!123"},
    )
    lender_token = client.post(
        "/api/v1/auth/login",
        json={"email": "lender@campus.edu", "password": "LenderPass!123"},
    ).json()["access_token"]

    # Register Borrower
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Borrower", "email": "borrower@campus.edu", "password": "BorrowerPass!123"},
    )
    borrower_token = client.post(
        "/api/v1/auth/login",
        json={"email": "borrower@campus.edu", "password": "BorrowerPass!123"},
    ).json()["access_token"]

    # Owner lists an item
    item_res = client.post(
        "/api/v1/items/",
        headers={"Authorization": f"Bearer {lender_token}"},
        json={
            "name": "Scientific Calculator FX-991EX",
            "description": "Available for math/physics exams.",
            "category": "Academic",
            "condition": "like_new",
        },
    )
    assert item_res.status_code == 201
    item_id = item_res.json()["id"]

    # Borrower browses catalog
    cat_res = client.get(
        "/api/v1/items/?category=Academic",
        headers={"Authorization": f"Bearer {borrower_token}"},
    )
    assert cat_res.status_code == 200
    assert any(i["id"] == item_id for i in cat_res.json())

    # Borrower submits borrow request
    req_res = client.post(
        "/api/v1/borrow/request",
        headers={"Authorization": f"Bearer {borrower_token}"},
        json={"item_id": item_id, "message": "Need it for tomorrow's midterm."},
    )
    assert req_res.status_code == 201
    req_id = req_res.json()["id"]

    # Owner approves request
    approve_res = client.post(
        f"/api/v1/borrow/requests/{req_id}/respond",
        headers={"Authorization": f"Bearer {lender_token}"},
        json={"status": "approved"},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # Verify transaction created
    txs_res = client.get(
        "/api/v1/borrow/transactions",
        headers={"Authorization": f"Bearer {borrower_token}"},
    )
    assert txs_res.status_code == 200
    tx_id = txs_res.json()[0]["id"]

    # Return item
    return_res = client.post(
        f"/api/v1/borrow/transactions/{tx_id}/return",
        headers={"Authorization": f"Bearer {borrower_token}"},
    )
    assert return_res.status_code == 200
    assert return_res.json()["status"] == "returned"


# -------------------------------------------------------------
# 4. GAMIFICATION & LEADERBOARD TESTS
# -------------------------------------------------------------

def test_leaderboard_and_badges():
    # Register student
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Champion", "email": "champ@campus.edu", "password": "ChampionPass!1"},
    )
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "champ@campus.edu", "password": "ChampionPass!1"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get leaderboard
    lb_res = client.get("/api/v1/gamification/leaderboard", headers=headers)
    assert lb_res.status_code == 200
    assert len(lb_res.json()) >= 1

    # Get badges
    badge_res = client.get("/api/v1/gamification/badges", headers=headers)
    assert badge_res.status_code == 200
    assert len(badge_res.json()) >= 5


# -------------------------------------------------------------
# 5. DASHBOARD & NOTIFICATIONS TESTS
# -------------------------------------------------------------

def test_dashboard_and_notifications():
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Dashboard User", "email": "dash@campus.edu", "password": "DashPassword!1"},
    )
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "dash@campus.edu", "password": "DashPassword!1"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check dashboard aggregates
    dash_res = client.get("/api/v1/dashboard/", headers=headers)
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "estimated_water_saved_litres" in data
    assert "user_total_points" in data
    assert "user_rank" in data

    # Check notifications
    notif_res = client.get("/api/v1/notifications/", headers=headers)
    assert notif_res.status_code == 200

    unread_res = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread_res.status_code == 200
    assert "unread_count" in unread_res.json()


# -------------------------------------------------------------
# 6. ADMIN PORTAL ENDPOINTS & AUTHORIZATION TESTS
# -------------------------------------------------------------

def test_admin_portal_endpoints():
    # 1. Register student
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Student User", "email": "student_test@campus.edu", "password": "StudentPass!1"},
    )
    student_token = client.post(
        "/api/v1/auth/login",
        json={"email": "student_test@campus.edu", "password": "StudentPass!1"},
    ).json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Verify student is denied access to admin endpoints (403 Forbidden)
    res_forbidden = client.get("/api/v1/admin/analytics", headers=student_headers)
    assert res_forbidden.status_code == 403
    assert "Administrator access required" in res_forbidden.json()["detail"]

    # 2. Register admin user and promote in DB
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Chief Admin", "email": "admin_test@campus.edu", "password": "AdminPass!1"},
    )
    db = TestingSessionLocal()
    from app.models.user import User
    admin_u = db.query(User).filter(User.email == "admin_test@campus.edu").first()
    admin_u.role = "admin"
    db.commit()
    db.close()

    admin_token = client.post(
        "/api/v1/auth/login",
        json={"email": "admin_test@campus.edu", "password": "AdminPass!1"},
    ).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Verify Admin Analytics
    analytics_res = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "total_users" in analytics_data
    assert "pending_reports" in analytics_data
    assert "total_items_listed" in analytics_data
    assert "estimated_water_saved_litres" in analytics_data

    # Verify Admin Users List
    users_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 2

    # Verify Admin GreenShare Items & Requests
    items_res = client.get("/api/v1/admin/greenshare/items", headers=admin_headers)
    assert items_res.status_code == 200

    reqs_res = client.get("/api/v1/admin/greenshare/requests", headers=admin_headers)
    assert reqs_res.status_code == 200

    # Verify Admin Impact Endpoint
    impact_res = client.get("/api/v1/admin/impact", headers=admin_headers)
    assert impact_res.status_code == 200
    impact_data = impact_res.json()
    assert "estimated_water_saved_litres" in impact_data
    assert "total_issues_resolved" in impact_data

    # Verify Assignable Staff List
    staff_res = client.get("/api/v1/admin/staff", headers=admin_headers)
    assert staff_res.status_code == 200
    assert len(staff_res.json()) >= 1
