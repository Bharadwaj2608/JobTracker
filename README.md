# 🎯 JobTrackr — Full Stack Job Application Tracker

A full-featured job application tracker built with **Node.js + Express + MongoDB** (backend) and **React + Tailwind CSS** (frontend).

---

## 📁 Project Structure

```
jobtracker/
├── backend/          # Node.js / Express / MongoDB API
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Job.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   └── stats.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/         # React + Tailwind CSS SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── JobForm.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Jobs.jsx
    │   │   ├── AddJob.jsx
    │   │   └── EditJob.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs on → **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Frontend runs on → **http://localhost:3000**

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filters) |
| POST | `/api/jobs` | Add new application |
| GET | `/api/jobs/:id` | Get single application |
| PUT | `/api/jobs/:id` | Update application |
| PATCH | `/api/jobs/:id/status` | Update status only |
| DELETE | `/api/jobs/:id` | Delete application |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard statistics |

#### Query Params for GET /api/jobs
- `search` — search company/role/location
- `status` — filter by status
- `priority` — filter by priority
- `jobType` — filter by type
- `source` — filter by source
- `sort` — sort field (default: `-createdAt`)
- `page`, `limit` — pagination

---

## ✨ Features

### Backend
- ✅ ES Modules (`import/export`)
- ✅ JWT Authentication
- ✅ Register & Login
- ✅ Protected routes
- ✅ Add / Edit / Delete job applications
- ✅ Update application status
- ✅ Filter & search jobs
- ✅ Dashboard statistics (aggregation)
- ✅ Input validation

### Frontend
- ✅ Light / Dark mode
- ✅ Responsive design (mobile-first)
- ✅ Dashboard with charts (Recharts)
- ✅ Add, edit, delete applications
- ✅ Quick status update (inline dropdown)
- ✅ Search & filter
- ✅ Salary, source, priority, tags support
- ✅ Toast notifications
- ✅ Smooth animations

---

## 🎨 Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, React Router v6, Tailwind CSS, Recharts, Heroicons |
| Backend | Node.js, Express 4, Mongoose, JWT, bcryptjs |
| Database | MongoDB |

---

## 📊 Application Statuses

`applied` → `screening` → `interview` → `offer` → `approved` / `rejected` / `withdrawn`
