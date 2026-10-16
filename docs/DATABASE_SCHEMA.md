# GreenCampus — Database Schema & Architecture

This document provides complete documentation for the relational database schema supporting the GreenCampus platform (MySQL + SQLAlchemy 2.0 ORM + Alembic).

---

## 1. Entity-Relationship Overview

```text
       ┌──────────────┐
       │    users     │◀──────────────────────────────────────────────┐
       └──────┬───────┘                                               │
              │ 1                                                     │
              ├──────────────────────────────────┐                    │
              │ N                                │ N                  │
       ┌──────▼───────┐                   ┌──────▼───────┐            │
       │    issues    │                   │    items     │            │
       └──────┬───────┘                   └──────┬───────┘            │
              │ 1                                │ 1                  │
              ├───────────────┐                  ├────────────────┐   │
              │ N             │ 1                │ N              │ N │
       ┌──────▼────────┐┌─────▼──────────┐┌──────▼────────┐┌──────▼───┴───────┐
       │ issue_updates ││ impact_records ││borrow_requests││borrow_transactions│
       └───────────────┘└────────────────┘└───────────────┘└───────────────────┘
              ▲
              │
       ┌──────┴───────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
       │ green_points │   │    badges    │   │ user_badges  │   │notifications │
       └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 2. Table Specifications

### 2.1. `users`
Stores student and administrator credentials, profiles, and roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique user identifier. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Student or staff full name. |
| `email` | `VARCHAR(255)` | `UNIQUE, INDEX, NOT NULL` | Campus email address used for login. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Salted cryptographic password hash (never plain text). |
| `role` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'student'` | Role: `'student'` or `'admin'`. |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | Account status flag. |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Account registration timestamp. |
| `updated_at` | `DATETIME` | `NOT NULL, ON UPDATE CURRENT_TIMESTAMP`| Last profile modification timestamp. |

---

### 2.2. `issues` (ResourceCare)
Represents campus sustainability wastage incidents (leaks, power waste, overflow).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique report identifier. |
| `reported_by` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | ID of the student who reported the issue. |
| `issue_type` | `VARCHAR(50)` | `NOT NULL` | Category: `'water'`, `'electricity'`, `'waste'`, `'other'`. |
| `description` | `TEXT` | `NOT NULL` | Description of the problem observed. |
| `location` | `VARCHAR(255)` | `NOT NULL` | Campus physical location (e.g. Science Block, Room 204). |
| `image_url` | `VARCHAR(500)` | `NULLABLE` | Cloud image storage URL. |
| `status` | `VARCHAR(20)` | `NOT NULL, INDEX, DEFAULT 'reported'` | Lifecycle: `'reported'`, `'in_progress'`, `'resolved'`. |
| `assigned_to` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE SET NULL, INDEX` | Maintenance or admin user assigned to fix the issue. |
| `estimated_water_saved` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Estimated water conserved in Litres. |
| `estimated_energy_saved` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Estimated energy conserved in kWh. |
| `estimated_waste_reduced` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Estimated waste diverted in kilograms. |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Submission timestamp. |
| `updated_at` | `DATETIME` | `NOT NULL, ON UPDATE CURRENT_TIMESTAMP`| Last update timestamp. |
| `resolved_at` | `DATETIME` | `NULLABLE` | Timestamp when issue was marked resolved. |

---

### 2.3. `issue_updates`
Maintains an immutable historical audit log of status progressions and comments.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique update identifier. |
| `issue_id` | `INTEGER` | `FOREIGN KEY (issues.id) ON DELETE CASCADE, INDEX` | Linked report. |
| `updated_by` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | User or admin who performed the update. |
| `old_status` | `VARCHAR(20)` | `NULLABLE` | Previous status state. |
| `new_status` | `VARCHAR(20)` | `NOT NULL` | New updated status state. |
| `comment` | `TEXT` | `NULLABLE` | Maintenance notes, repair details, or remarks. |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Action timestamp. |

---

### 2.4. `items` (GreenShare)
Lists student items available for borrowing on campus.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique item identifier. |
| `owner_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Student who owns the item. |
| `name` | `VARCHAR(150)` | `NOT NULL` | Item title (e.g. Scientific Calculator). |
| `description` | `TEXT` | `NULLABLE` | Condition details and lending parameters. |
| `category` | `VARCHAR(50)` | `NOT NULL, INDEX` | `'Academic'`, `'Electronics'`, `'Sports'`, `'Books'`, etc. |
| `image_url` | `VARCHAR(500)` | `NULLABLE` | Item photograph URL. |
| `condition` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'good'` | `'new'`, `'like_new'`, `'good'`, `'fair'`. |
| `availability_status` | `VARCHAR(20)` | `NOT NULL, INDEX, DEFAULT 'available'`| `'available'`, `'requested'`, `'borrowed'`, `'unavailable'`. |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Listing creation timestamp. |
| `updated_at` | `DATETIME` | `NOT NULL, ON UPDATE CURRENT_TIMESTAMP`| Last modification timestamp. |

---

### 2.5. `borrow_requests`
Tracks requests sent by students to borrow an available item.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique request identifier. |
| `item_id` | `INTEGER` | `FOREIGN KEY (items.id) ON DELETE CASCADE, INDEX` | Requested item. |
| `requester_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Student asking to borrow. |
| `owner_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Student who owns the item. |
| `message` | `TEXT` | `NULLABLE` | Note explaining borrow duration/need. |
| `status` | `VARCHAR(20)` | `NOT NULL, INDEX, DEFAULT 'pending'` | `'pending'`, `'approved'`, `'rejected'`, `'cancelled'`. |
| `requested_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Submission timestamp. |
| `responded_at` | `DATETIME` | `NULLABLE` | Owner decision timestamp. |

---

### 2.6. `borrow_transactions`
Represents an active lending period once a request is approved.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique transaction identifier. |
| `item_id` | `INTEGER` | `FOREIGN KEY (items.id) ON DELETE CASCADE, INDEX` | Borrowed item. |
| `borrower_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Student borrowing the item. |
| `owner_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Item owner. |
| `borrow_request_id` | `INTEGER` | `FOREIGN KEY (borrow_requests.id) ON DELETE SET NULL, INDEX` | Linked approved request. |
| `borrowed_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Hand-off timestamp. |
| `due_at` | `DATETIME` | `NULLABLE` | Expected return date. |
| `returned_at` | `DATETIME` | `NULLABLE` | Actual physical return date. |
| `status` | `VARCHAR(20)` | `NOT NULL, INDEX, DEFAULT 'active'` | `'active'`, `'returned'`, `'overdue'`. |

---

### 2.7. `green_points`
Immutable ledger of points awarded to students for verified eco-actions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique ledger entry identifier. |
| `user_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Point recipient. |
| `points` | `INTEGER` | `NOT NULL` | Points earned (e.g. +10, +20). |
| `reason` | `VARCHAR(150)` | `NOT NULL` | Description of action (e.g. 'Reported Water Leak'). |
| `reference_type` | `VARCHAR(50)` | `NULLABLE, INDEX` | Context: `'issue'`, `'item_share'`, `'borrow_return'`, etc. |
| `reference_id` | `INTEGER` | `NULLABLE` | ID of the linked entity. |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Transaction timestamp. |

---

### 2.8. `badges` & `user_badges`
Gamification milestones awarded when students reach point thresholds or action counts.

**`badges` table:**
- `id` (PK, INTEGER)
- `name` (VARCHAR(100), UNIQUE, NOT NULL)
- `description` (VARCHAR(255), NOT NULL)
- `icon` (VARCHAR(100), NOT NULL)
- `points_required` (INTEGER, NOT NULL, DEFAULT 0)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

**`user_badges` association table (Many-to-Many):**
- `user_id` (PK, FK to `users.id` ON DELETE CASCADE)
- `badge_id` (PK, FK to `badges.id` ON DELETE CASCADE)
- `earned_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

---

### 2.9. `notifications`
User notifications for real-time status updates and achievements.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique notification identifier. |
| `user_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE CASCADE, INDEX` | Target user. |
| `title` | `VARCHAR(150)` | `NOT NULL` | Alert title. |
| `message` | `TEXT` | `NOT NULL` | Notification details. |
| `notification_type` | `VARCHAR(50)` | `NOT NULL` | `'issue_update'`, `'borrow_request'`, `'points_earned'`, etc. |
| `is_read` | `BOOLEAN` | `NOT NULL, INDEX, DEFAULT FALSE` | Read receipt flag. |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Sent timestamp. |

---

### 2.10. `impact_records`
Consolidated sustainability metrics powering the campus-wide and student dashboards.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY, AUTO_INCREMENT` | Unique record identifier. |
| `user_id` | `INTEGER` | `FOREIGN KEY (users.id) ON DELETE SET NULL, INDEX` | Contributing student. |
| `issue_id` | `INTEGER` | `FOREIGN KEY (issues.id) ON DELETE SET NULL, INDEX` | Linked resolved issue. |
| `water_saved` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Litres of water saved. |
| `energy_saved` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Kilowatt-hours of electricity conserved. |
| `waste_reduced` | `FLOAT` | `NOT NULL, DEFAULT 0.0` | Kilograms of waste diverted. |
| `items_shared` | `INTEGER` | `NOT NULL, DEFAULT 0` | Count of item sharing cycles. |
| `purchases_avoided` | `INTEGER` | `NOT NULL, DEFAULT 0` | Count of unnecessary purchases avoided. |
| `recorded_at` | `DATETIME` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Impact calculation timestamp. |

---

## 3. Database Migration Workflow (Alembic)

Alembic inspects the SQLAlchemy models registered in `app.models` and compares them to the MySQL database:

1. **Generate Migration**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Initial GreenCampus schema"
   ```
2. **Apply Migration**:
   ```bash
   alembic upgrade head
   ```
3. **Rollback Migration** (if required):
   ```bash
   alembic downgrade -1
   ```
