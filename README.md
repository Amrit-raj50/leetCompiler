# ⚡ LeetCompiler (Dual-Mode Execution Architecture)

A versatile browser-based code editor and compiler engine designed for solving coding problems. It supports **Two Modes of Operation**:

1. **🔓 Standalone Mode** – Free, open code runner without requiring any authentication or database. Perfect for public coding practice.
2. **🔐 Integrated Mode** – Connects with your main website via JWT and MongoDB Atlas to track user revisions, solved status, and daily streaks.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                              │
│                                                                             │
│  ┌──────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │   Main Website Dashboard     │  │   LeetCompiler Editor              │  │
│  │   (displays revision tasks)  │  │   (Monaco editor + run button)     │  │
│  └──────────────────────────────┘  └────────────────────────────────────┘  │
│              │                                    │                        │
│              │ (JWT)                              │ (JWT OPTIONAL)         │
│              ▼                                    ▼                        │
└─────────────────────────────────────────────────────────────────────────────┘
               │                                    │
               │                                    │
               ▼                                    ▼
┌──────────────────────────────┐  ┌─────────────────────────────────────────┐
│  Main Backend (Node.js)      │  │   Compiler Backend (Node.js)            │
│  Port 5000                   │  │   Port 5001                            │
│  - Auth (/api/auth)          │  │   - POST /api/compiler/run             │
│  - User (/api/me)            │  │   - Checks JWT (optional)              │
│  - Revision (/api/daily)     │  │   - Code execution engine              │
│  - Sync (/api/sync)          │  │   - If JWT: updates MongoDB            │
└──────────────┬───────────────┘  │   - If no JWT: returns output only     │
               │                   └──────────────────┬──────────────────────┘
               │                                      │
               └─────────────┬────────────────────────┘
                             │
                             ▼
               ┌──────────────────────────────┐
               │        MongoDB Atlas          │
               │    (only used in Integrated   │
               │     mode with valid JWT)      │
               └──────────────────────────────┘
```

---

## 📋 Modes Comparison

| Feature | Integrated Mode | Standalone Mode |
|---------|-----------------|-----------------|
| **JWT Required** | ✅ Yes | ❌ No |
| **DB Connection** | ✅ Yes (MongoDB) | ❌ No |
| **Updates revisionStatus** | ✅ Yes | ❌ No |
| **Tracks Streak** | ✅ Yes | ❌ No |
| **User Authentication** | ✅ Yes | ❌ No |
| **Public Access** | ❌ Logged-in users | ✅ Anyone |
| **Endpoint** | `POST /api/compiler/run` (with Bearer JWT) | `POST /api/compiler/run` (no auth) |

---

## 📁 Project Structure

```
leetCompiler/
├── frontend/                     # React + Vite + Monaco Editor (Notebook/Sketch Theme)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx    # Monaco editor with multi-language templates & shortcuts
│   │   │   ├── OutputConsole.jsx # Testcase runner, result inspector, mode & streak badge
│   │   │   ├── Navbar.jsx        # Run and Submit controls
│   │   │   └── ProblemDescription.jsx
│   │   ├── constants/            # Language templates & Monaco mappings
│   │   ├── services/             # Compiler API service (axios + JWT handler)
│   │   └── App.jsx
│   └── package.json
└── backend/                      # Dual-Mode Code Execution Engine (Port 5001)
    ├── config/
    │   └── db.js                 # MongoDB connection handler
    ├── middleware/
    │   └── auth.js               # Optional & Required JWT authentication middleware
    ├── models/
    │   └── User.js               # User & Revision schema for MongoDB tracking
    ├── routes/
    │   └── compiler.js           # POST /run, POST /run-integrated, GET /health
    ├── services/
    │   ├── compilerService.js   # Multi-language runner with timeouts & safety sandboxing
    │   ├── harness.js           # Test case harness generator (JS, Python, C++, Java)
    │   └── revisionService.js   # MongoDB revision & streak updater
    ├── server.js                 # Express app listening on port 5001
    └── package.json
```

---

## 🚀 How to Run

### 1. Setup & Start Backend

```bash
cd backend
npm install
npm start
```
> Defaults to **Standalone Mode** if `MONGO_URI` is not set in `.env`.
> To enable **Integrated Mode**, add `MONGO_URI` and `JWT_SECRET` in `backend/.env`.

### 2. Setup & Start Frontend

```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:5173`.
> If `localStorage.getItem('token')` exists, it runs in **Integrated Mode**; otherwise it seamlessly runs in **Standalone Mode**.
