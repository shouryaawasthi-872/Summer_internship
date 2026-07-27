# K.R. Mangalam University — Internship Management Portal

A full-stack internship management portal built with **Node.js + Express + MongoDB** on the backend and **React + Tailwind CSS** on the frontend.

---

## Tech Stack

| Layer     | Technology                               |
|-----------|------------------------------------------|
| Backend   | Node.js, Express, MongoDB (Mongoose)     |
| Auth      | JWT (jsonwebtoken + bcryptjs)            |
| Uploads   | Multer (local disk — `uploads/documents`)|
| Frontend  | React 18, Vite, Tailwind CSS v3          |
| Charts    | Recharts                                 |
| UI        | react-icons, react-hot-toast             |

---

## Folder Structure

```
internship/
├── portal/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/        # MongoDB connection
│   │   │   ├── controllers/   # Route handlers
│   │   │   ├── middleware/    # auth, upload
│   │   │   ├── models/        # Mongoose schemas
│   │   │   ├── routes/        # Express routers
│   │   │   ├── utils/         # helpers, seeder
│   │   │   └── server.js
│   │   ├── uploads/           # Uploaded files (auto-created)
│   │   ├── .env
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/    # Layout + common UI
│       │   ├── context/       # AuthContext (JWT)
│       │   ├── pages/         # All pages by role
│       │   ├── services/      # Axios API wrappers
│       │   └── utils/         # constants, helpers
│       ├── index.html
│       └── package.json
└── package.json               # Root convenience scripts
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or [Atlas free tier](https://www.mongodb.com/atlas))

### 1 — Install dependencies

```bash
# From the repo root
npm run install:all
```

Or individually:

```bash
cd portal/backend  && npm install
cd portal/frontend && npm install
```

### 2 — Configure the backend

Edit `portal/backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/internship_portal   # or your Atlas URI
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3 — Seed the database (optional but recommended)

Creates demo accounts for all four roles:

```bash
npm run seed
```

| Role       | Email                    | Password     |
|------------|--------------------------|--------------|
| Super Admin| superadmin@krmuedu.in    | Admin@123    |
| Admin      | admin@krmuedu.in         | Admin@123    |
| Mentor     | mentor@krmuedu.in        | Mentor@123   |
| Student    | student@krmuedu.in       | Student@123  |
| Student 2  | priya@krmuedu.in         | Student@123  |

### 4 — Run the servers

Open **two terminals**:

```bash
# Terminal 1 — backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 — frontend (http://localhost:3000)
npm run dev:frontend
```

Then open **http://localhost:3000** in your browser.

---

## User Roles & Permissions

| Feature                          | Student | Mentor | Admin | Super Admin |
|----------------------------------|:-------:|:------:|:-----:|:-----------:|
| Browse eligible internships      | ✓       | ✓      | ✓     | ✓           |
| Apply to internship (max 3)      | ✓       |        |       |             |
| Upload documents                 | ✓       |        |       |             |
| Review documents                 |         | ✓      | ✓     | ✓           |
| Post internships                 |         | ✓*     | ✓     | ✓           |
| Approve internships              |         |        | ✓     | ✓           |
| Mentor-level app approval        |         | ✓      |       |             |
| Admin-level app approval         |         |        | ✓     |             |
| Super Admin final approval       |         |        |       | ✓           |
| Schedule meetings                |         | ✓      | ✓     | ✓           |
| Give marks (post full approval)  |         | ✓      |       |             |
| Update semester CGPA             |         | ✓      | ✓     | ✓           |
| Manage users                     |         |        | ✓     | ✓           |
| Assign mentors                   |         |        | ✓     | ✓           |
| Create admin/superadmin accounts |         |        |       | ✓           |

*Mentor-posted internships need admin approval before going live.

---

## Key Business Rules

### Application Limit
A student can hold at most **3 active (non-rejected) applications** at any time. Rejected applications free up a slot.

### CGPA-based Eligibility
Each internship can set a `minCGPA`. Students whose `currentCGPA` is below that threshold will not see or be able to apply for that internship.

### Dynamic Required Documents
When creating an internship, admins/mentors define a list of required document types (e.g. `resume`, `id_proof`, `noc`). A student can only apply after uploading documents that match every item on the list.

### 3-Level Approval Pipeline
```
Student applies → Mentor reviews → Admin reviews → Super Admin approves
```
All three levels must approve before an application becomes `fully_approved`. Any rejection at any level marks the whole application as `rejected` and notifies the student.

### Marks Unlock
Once an application reaches `fully_approved`, the assigned mentor's marks entry for that student is automatically unlocked.

---

## API Reference

All routes are prefixed with `/api`.

| Method | Endpoint                          | Role(s)                      | Description                   |
|--------|-----------------------------------|------------------------------|-------------------------------|
| POST   | /auth/register                    | Public / SuperAdmin          | Register new user             |
| POST   | /auth/login                       | Public                       | Login & receive JWT           |
| GET    | /auth/me                          | Authenticated                | Current user profile          |
| PUT    | /auth/password                    | Authenticated                | Change password               |
| GET    | /users                            | Admin, SuperAdmin, Mentor    | List users                    |
| PUT    | /users/assign-mentor              | Admin, SuperAdmin            | Assign mentor to student      |
| PUT    | /users/:id/toggle                 | Admin, SuperAdmin            | Activate / deactivate account |
| GET    | /internships                      | Authenticated                | List (CGPA-filtered for students) |
| POST   | /internships                      | Admin, SuperAdmin, Mentor    | Create internship             |
| PUT    | /internships/:id/approve          | Admin, SuperAdmin            | Approve / reject internship   |
| POST   | /applications                     | Student                      | Apply (validates limit, CGPA, docs) |
| PUT    | /applications/:id/review          | Mentor, Admin, SuperAdmin    | Approve / reject at each level|
| POST   | /documents                        | Student                      | Upload document               |
| PUT    | /documents/:id/review             | Mentor, Admin, SuperAdmin    | Approve / reject document     |
| POST   | /meetings                         | Mentor, Admin, SuperAdmin    | Schedule meeting              |
| POST   | /marks                            | Mentor                       | Save marks (unlocked only)    |
| GET    | /cgpa                             | Authenticated                | CGPA history (role-filtered)  |
| POST   | /cgpa                             | Mentor, Admin, SuperAdmin    | Upsert semester CGPA          |
| GET    | /notifications                    | Authenticated                | Get notifications             |
| PUT    | /notifications/read-all           | Authenticated                | Mark all as read              |

---

## Environment Variables

| Variable       | Required | Default       | Description                      |
|----------------|----------|---------------|----------------------------------|
| `PORT`         | No       | `5000`        | Backend port                     |
| `MONGO_URI`    | Yes      | —             | MongoDB connection string        |
| `JWT_SECRET`   | Yes      | —             | Secret for signing JWTs          |
| `JWT_EXPIRE`   | No       | `7d`          | JWT expiry duration              |
| `NODE_ENV`     | No       | `development` | Enables Morgan request logging   |
| `FRONTEND_URL` | No       | —             | Allowed CORS origin              |

---

## Production Build

```bash
# Build the React frontend
npm run build:frontend

# The output is in portal/frontend/dist/
# Serve it with any static host (Vercel, Netlify, etc.)
# or point Express to it by adding:
#   app.use(express.static(path.join(__dirname, '../../frontend/dist')));
# to portal/backend/src/server.js

# Start the backend
npm run start:backend
```

---

## University Branding

- Primary colour: **#003087** (Dark Blue)
- Accent colour:  **#C8102E** (Red)
- Font: Inter (Google Fonts)

All Tailwind custom tokens, badge styles, card classes, and hero-banner CSS are defined in `portal/frontend/src/index.css` and `portal/frontend/tailwind.config.js`.
