# 🏋️ FitTrack – Fitness Activity Dashboard

A full-stack MERN web application for tracking fitness activities, built for a hackathon.

## ✨ Features

- **Dashboard** – Live stats (total workouts, duration, calories, avg duration), weekly activity charts (area + bar), recent workouts
- **Workout Management** – Add, edit, delete workouts with full validation
- **Search & Filter** – Search by exercise name, filter by type, filter by date range
- **Real-time Charts** – Recharts area and bar charts from actual DB data
- **Responsive Design** – Works on laptop and mobile
- **Error Transparency** – Shows clear errors if MongoDB is unavailable (no fake data)
- **DB Health Check** – Sidebar indicator and `/api/health` endpoint

## 🛠 Tech Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite                    |
| Styling    | Custom CSS (dark navy + lime-green) |
| Routing    | React Router DOM v6                |
| Charts     | Recharts                           |
| HTTP       | Axios                              |
| Backend    | Node.js + Express                  |
| Database   | MongoDB + Mongoose                 |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (local) OR [MongoDB Atlas](https://cloud.mongodb.com) (cloud)

---

### 1. Clone / Open the project

```
FITNESS ACTIVITY/
├── backend/
└── frontend/
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/fittrack   # or your Atlas URI
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Install & Run Backend

```bash
cd backend
npm install
npm run dev        # uses nodemon for hot-reload
# OR
npm start          # production
```

Backend starts at: **http://localhost:5000**

### 4. Configure Frontend

The frontend uses Vite's proxy — no separate `.env` needed unless you change the backend port.

```bash
cd frontend
cp .env.example .env   # optional, proxy handles this
```

### 5. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/health`         | Health check + DB status             |
| GET    | `/api/workouts`       | Get all workouts (search & filter)   |
| GET    | `/api/workouts/stats` | Dashboard stats + weekly chart data  |
| GET    | `/api/workouts/:id`   | Get single workout                   |
| POST   | `/api/workouts`       | Create workout                       |
| PUT    | `/api/workouts/:id`   | Update workout                       |
| DELETE | `/api/workouts/:id`   | Delete workout                       |

### Query Parameters for `GET /api/workouts`

| Param       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `search`    | string | Search by exercise name (case-insensitive)|
| `type`      | string | Filter by type (Cardio, Strength, etc.)  |
| `startDate` | date   | Filter from date (YYYY-MM-DD)            |
| `endDate`   | date   | Filter to date (YYYY-MM-DD)              |
| `page`      | number | Page number (default: 1)                 |
| `limit`     | number | Results per page (default: 50)           |

### Workout Schema

```json
{
  "exercise": "Running",
  "type": "Cardio",
  "date": "2026-10-10",
  "duration": 45,
  "calories": 400,
  "notes": "Morning run at the park"
}
```

**Types:** `Cardio | Strength | Flexibility | HIIT | Sports | Other`

---

## 🧪 Testing Each Feature

### 1. Health Check
```
GET http://localhost:5000/api/health
```
Expected: `{ "status": "ok", "database": "connected" }`

### 2. Add a Workout (curl)
```bash
curl -X POST http://localhost:5000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"exercise":"Running","type":"Cardio","date":"2026-10-10","duration":45,"calories":400,"notes":"Morning run"}'
```

### 3. Get All Workouts
```
GET http://localhost:5000/api/workouts
```

### 4. Get Stats (Dashboard data)
```
GET http://localhost:5000/api/workouts/stats
```

### 5. Search
```
GET http://localhost:5000/api/workouts?search=running&type=Cardio
```

### 6. Update a Workout
```bash
curl -X PUT http://localhost:5000/api/workouts/<ID> \
  -H "Content-Type: application/json" \
  -d '{"duration":60,"calories":500}'
```

### 7. Delete a Workout
```bash
curl -X DELETE http://localhost:5000/api/workouts/<ID>
```

### 8. Validation Test (should return 400)
```bash
curl -X POST http://localhost:5000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"exercise":"","duration":-5,"calories":0}'
```

---

## 📁 Project Structure

```
FITNESS ACTIVITY/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   └── workoutController.js # Route handlers + aggregations
│   ├── models/
│   │   └── Workout.js          # Mongoose schema
│   ├── routes/
│   │   └── workoutRoutes.js    # Express routes
│   ├── .env                    # Environment variables (not committed)
│   ├── .env.example            # Template
│   ├── package.json
│   └── server.js               # Express entry point
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── api/
    │   │   └── workoutAPI.js   # Axios client + API methods
    │   ├── components/
    │   │   ├── DeleteConfirmModal.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── TopNav.jsx
    │   │   └── WorkoutModal.jsx
    │   ├── context/
    │   │   └── ToastContext.jsx # Toast notifications
    │   ├── pages/
    │   │   ├── Dashboard.jsx   # Main dashboard
    │   │   └── Workouts.jsx    # Workouts management
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🎨 Design System

- **Background:** Dark navy (#0d1117) + charcoal (#161b22)
- **Accent:** Lime-green (#a3e635)
- **Typography:** Inter (Google Fonts)
- **Cards:** Rounded corners, subtle borders, hover glow effects
- **Responsive:** Collapsible sidebar on mobile

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| "Cannot connect to server" | Make sure backend is running on port 5000 |
| "Database is unavailable" | Start MongoDB service or check `MONGODB_URI` |
| CORS error | Make sure `CLIENT_URL` in backend `.env` matches frontend URL |
| Port conflict | Change `PORT` in backend `.env` and `proxy.target` in `vite.config.js` |

---

## 🏆 Hackathon Notes

- Authentication is intentionally excluded to prioritize a working MVP
- All statistics are computed from actual database records (no hardcoded data)
- The server shows clear error messages when MongoDB is unavailable
- Charts automatically update after adding/editing/deleting workouts
