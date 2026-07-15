# K.R. Mangalam University — Internship Management Portal

A full-stack internship management system built for K.R. Mangalam University.

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend   | Node.js, Express.js |
| Database  | MongoDB Atlas |
| Auth      | JWT (Bearer token) |
| File uploads | Multer |

---

## Features

- **Multi-level approval pipeline** — Mentor → Admin → Super Admin
- **Portal internships** — Browse, apply, CGPA-eligibility filter, required documents per listing
- **Off-campus internships** — Students can register self-arranged internships
- **Mandatory documents** — NOC, Offer Letter, Email Screenshot required for all applications
- **Completion certificate** — Upload after internship; mentor verifies and it counts as 5th marks component
- **Marks system** — 5 criteria: Performance, Attendance, Task Completion, Communication, Certificate
- **CGPA management** — Mentor-only entry; students and admins have read-only view
- **No self-registration** — Super Admin creates all accounts
- **Role-based access** — Student, Mentor, Admin, Super Admin

---

## Setup

### 1. Clone

```bash
git clone https://github.com/shouryaawasthi-872/Summer_internship.git
cd Summer_internship/portal
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your MongoDB password in MONGO_URI
npm install
npm run seed      # Creates Super Admin account (run once)
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend:  http://localhost:5000

---

## Super Admin Login (after seeding)

| Field    | Value |
|----------|-------|
| Email    | superadmin@krmangalam.edu.in |
| Password | KRMUSuperAdmin@2024 |

> **Change this password after first login.**

After logging in as Super Admin, create all other accounts (Admin, Mentor, Student) from the **User Management** page.

---

## Access Control Rules

| Feature | Student | Mentor | Admin | Super Admin |
|---------|---------|--------|-------|-------------|
| Browse internships | ✓ | ✓ | ✓ | ✓ |
| Apply (portal) | ✓ | — | — | — |
| Apply (off-campus) | ✓ | — | — | — |
| Review applications | — | ✓ | ✓ | ✓ |
| Upload documents | ✓ | — | — | — |
| CGPA — view | ✓ (own) | ✓ (assigned) | ✗ | ✗ |
| CGPA — edit/add | ✗ | ✓ | ✗ | ✗ |
| Give marks | — | ✓ | — | — |
| Create users | — | — | Student/Mentor | All roles |
| Assign mentor | — | — | ✓ | ✓ |

---

## MongoDB

Database name: `internship-portal`  
Connection string template (see `.env.example`):

```
mongodb+srv://shouryaawasthifsd_db_user:<db_password>@cluster0.nbevegk.mongodb.net/internship-portal
```

---

© 2024 K.R. Mangalam University. All rights reserved.
