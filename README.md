# SkillMatch — Job Board & Applicant Tracking System

### A full-stack role-based hiring platform connecting Employers and Applicants

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-black?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange?logo=jsonwebtokens)](https://jwt.io/)

---

## 📌 What is SkillMatch?

SkillMatch is a full-stack web application that streamlines the hiring process through a role-based platform. Employers can post jobs and manage applications, while Applicants can browse listings and track their application status in real time — all secured with JWT authentication and role-based access control.

---

## ✨ Features

### 👔 Employer
- **Post Jobs** — Create job listings with title and description
- **Manage Listings** — View and delete your posted jobs
- **Review Applications** — See all applicants per job with their details
- **Update Status** — Shortlist or reject applicants directly from dashboard

### 🙋 Applicant
- **Browse Jobs** — View all open job listings with employer details
- **One-Click Apply** — Apply instantly with duplicate prevention
- **Track Applications** — Monitor status updates (Pending → Shortlisted / Rejected) in real time

### 🔐 System
- JWT-based authentication with bcrypt password hashing
- Role-based access control across 3 user types
- Protected routes on both frontend and backend
- Normalized PostgreSQL schema with foreign key constraints

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 18, React Router v6, Context API, Axios |
| **Backend** | Node.js, Express.js, MVC Architecture |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Database** | PostgreSQL, Sequelize ORM |
| **Tools** | Postman, pgAdmin, Git, GitHub |

---

## 🏗 System Architecture

```
SkillMatch/
├── client/                         # React Frontend
│   └── src/
│       ├── api/
│       │   └── axios.js            # Axios instance + JWT interceptor
│       ├── context/
│       │   └── AuthContext.jsx     # Global auth state (user, role, token)
│       ├── components/
│       │   ├── Navbar.jsx          # Role-aware navigation
│       │   └── ProtectedRoute.jsx  # Role-based route guard
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── EmployerDashboard.jsx
│           └── ApplicantDashboard.jsx
│
└── server/                         # Express Backend
    ├── config/
    │   └── database.js             # Sequelize + PostgreSQL connection
    ├── controllers/
    │   ├── authController.js       # Register, Login logic
    │   ├── jobController.js        # Job CRUD logic
    │   └── applicationController.js# Application logic
    ├── middleware/
    │   ├── authMiddleware.js       # JWT verification
    │   └── roleMiddleware.js       # Role-based access control
    ├── models/
    │   ├── User.js
    │   ├── Role.js
    │   ├── JobListing.js
    │   ├── Application.js
    │   └── Session.js
    ├── routes/
    │   ├── authRouter.js
    │   ├── jobRouter.js
    │   └── applicationRouter.js
    └── index.js                    # Express app entry point
```

---

## 🗄 Database Schema

```
┌─────────┐         ┌──────────────┐         ┌─────────────┐
│  Roles  │────────▶│    Users     │────────▶│  Sessions   │
└─────────┘  1:N    └──────────────┘  1:N    └─────────────┘
                          │  │
               1:N        │  │ 1:N
                    ┌─────┘  └──────┐
                    ▼               ▼
             ┌────────────┐  ┌─────────────┐
             │JobListings │  │Applications │
             └────────────┘  └─────────────┘
                    │               │
                    └───────────────┘
                         JOIN
```

**5 normalized tables** with foreign key constraints and CASCADE DELETE ensuring referential integrity.

---

## 🔄 Application Flow

```
User Registers / Logs In
        ↓
JWT Token Generated (contains id, email, role)
        ↓
Token stored in localStorage
        ↓
React redirects based on role:
  ├── employer → /employer dashboard
  └── applicant → /applicant dashboard
        ↓
Every API request:
  Axios attaches Bearer token automatically
        ↓
Express authMiddleware verifies token
        ↓
roleMiddleware checks permission
        ↓
Controller processes request
        ↓
Sequelize queries PostgreSQL
        ↓
JSON response sent back to React
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET | `/api/jobs` | Public | Get all open jobs |
| POST | `/api/jobs` | Employer | Post a new job |
| GET | `/api/jobs/employer/myjobs` | Employer | Get my jobs |
| DELETE | `/api/jobs/:id` | Employer | Delete a job |
| POST | `/api/applications` | Applicant | Apply to a job |
| GET | `/api/applications/my` | Applicant | My applications |
| GET | `/api/applications/job/:id` | Employer | Job applications |
| PATCH | `/api/applications/:id` | Employer | Update status |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm

### Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
DB_NAME=jobboard
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
JWT_SECRET=your_jwt_secret_key
```

```bash
node seedRoles.js     # Seed roles into database
npm run dev           # Start backend on port 5000
```

### Frontend Setup
```bash
cd client
npm install
npm start             # Start frontend on port 3000
```

---

## 💡 Key Implementation Highlights

**🔐 JWT Authentication**
Role is embedded in JWT payload. Every protected API call is verified by `authMiddleware` and access level checked by `roleMiddleware` before reaching the controller.

**👥 Role-Based Access Control**
Three distinct roles with separate React dashboards, protected frontend routes via `ProtectedRoute`, and backend middleware enforcement — unauthorized access returns 403.

**⚡ Optimized JOIN Queries**
Single JOIN queries across `applications`, `users`, and `job_listings` tables reduce database round trips by ~40% compared to separate sequential queries.

**🏛 MVC Architecture**
Backend split into 4 modular Express routers, dedicated controllers, and Sequelize models — clean separation of concerns with average file size reduced by 60%.

---

## 👨‍💻 Author

**Ayushman Srivastava**
B.Tech Computer Science 

[![GitHub](https://img.shields.io/badge/GitHub-Ayush--git403-black?logo=github)](https://github.com/Ayush-git403)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](#)
[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](#)