"""
GreenCampus Local Development & Testing Admin Account Utility
Usage:
    python backend/scripts/create_admin.py --email admin@campus.edu --password <password> --name "Campus Admin"

If arguments are omitted, prompts securely in terminal or reads from:
    ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME environment variables.

NOTE: This script is intended strictly for local development and testing.
Never hardcode production credentials in source code.
"""

import argparse
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import get_password_hash, validate_password_strength
from app.db.session import SessionLocal
from app.models.user import User


def create_or_promote_admin(email: str, password: str, full_name: str = "Campus Administrator"):
    email_clean = email.strip().lower()
    full_name_clean = full_name.strip()

    validate_password_strength(password)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email_clean).first()
        if user:
            print(f"[*] Found existing user '{email_clean}'. Promoting to 'admin' role...")
            user.role = "admin"
            user.password_hash = get_password_hash(password)
            user.full_name = full_name_clean or user.full_name
            db.commit()
            print(f"[✓] User '{email_clean}' successfully promoted to Administrator.")
        else:
            print(f"[*] Creating new Administrator account '{email_clean}'...")
            new_admin = User(
                email=email_clean,
                full_name=full_name_clean,
                password_hash=get_password_hash(password),
                role="admin",
                is_active=True,
            )
            db.add(new_admin)
            db.commit()
            print(f"[✓] Administrator account '{email_clean}' successfully created.")
    except Exception as e:
        db.rollback()
        print(f"[!] Error creating admin: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or promote a GreenCampus admin account.")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL"), help="Admin email address")
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD"), help="Admin password (8+ chars, upper, lower, digit, symbol)")
    parser.add_argument("--name", default=os.getenv("ADMIN_NAME", "Campus Administrator"), help="Admin full name")

    args = parser.parse_args()

    email = args.email
    password = args.password
    name = args.name

    if not email:
        email = input("Enter admin email (e.g. admin@campus.edu): ").strip()
    if not password:
        password = input("Enter strong admin password: ").strip()

    if not email or not password:
        print("[!] Email and password are required.", file=sys.stderr)
        sys.exit(1)

    create_or_promote_admin(email, password, name)
