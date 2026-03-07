# 🛠️ LocalService — On-Demand Home Services Platform

A full-stack service booking platform connecting customers with local service providers — built with React, Node.js, Express, and MongoDB.

---

## 📌 Project Overview

LocalService is an Platform where customers can browse service providers by category, book services, track booking status , and leave reviews. Providers manage their jobs through a dashboard, and admins oversee the entire platform.

---

## 🚀 Live Demo

> **Frontend:** `https://your-frontend-url.vercel.app`
> **Backend API:** `https://your-backend-url.render.com`

---

## 👥 Roles

| Role | Access |
|------|--------|
| **Customer** | Browse, book, track, cancel, reschedule, review |
| **Provider** | Manage profile, accept/reject jobs, upload work images |
| **Admin** | Approve providers, manage categories, moderate reviews |

---

## ✅ Features Implemented

### 🧑‍💼 Customer
- Browse service categories
- Filter providers by city/area, price range, and rating
- View provider profile with reviews, rating, and base price
- Book a service with date, optional time, address, problem description, and optional image
- Price shown before booking confirmation
- Track booking status: `Requested → Confirmed → In Progress → Completed → Cancelled`
- Cancel booking (free if `requested`; 2-hour restriction if `confirmed`)
- Reschedule booking (max 2 times, 24-hour gap between reschedules, date required, time optional)
- Submit review per completed booking (pending admin approval)
- View provider contact number after booking is confirmed
- Kanban-style customer dashboard with active/past bookings

### 🔧 Service Provider
- Complete and update profile (bio, city, area, phone, photo, base price)
- Set custom base price (must be ≥ category base price)
- Price change triggers re-approval flow
- Toggle availability on/off
- Accept or reject booking requests
- Start work (in-progress)
- Upload before/after images to complete job (images locked after submission)
- Add and update job notes post-completion
- Kanban dashboard: Pending / Active / Done columns

### 🛡️ Admin
- Approve or reject provider applications
- View provider price alongside category default
- Delete provider (cascades: bookings + reviews deleted, provider rating recalculated)
- Manage service categories (name, description, base price, image)
- Moderate reviews: hide/show or permanently delete
- Review deletion recalculates provider average rating

---

## 🧠 Business Logic

### Booking Rules
- Date is required, time is optional ("Anytime during the day")
- Time must be at least 1 hour from current time if today's date is selected
- Double booking prevention: same provider + date + time blocked
- Reschedule resets status to `requested` for provider re-confirmation
- Job completion only via image upload endpoint — not via status update

### Cancellation Rules
| Status | Cancel Rule |
|--------|-------------|
| `requested` | Cancel freely anytime |
| `confirmed` | Cannot cancel within 2 hours of scheduled time |
| `in-progress` / `completed` | Cannot cancel |

### Review Rules
- One review per completed booking
- Reviews default to hidden (`isVisible: false`) — admin must approve
- Provider average rating auto-updates on review create/delete

### Provider Price Rules
- Provider can set custom price ≥ category base price
- If no custom price → category base price is used as default
- Price change → status set to `pending`, re-approval required

---

## 🗂️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access Token) |
| File Upload | Multer + Cloudinary |
| State Management | Zustand |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (Atlas)
- Cloudinary account

---

### 1. Clone the Repository

```bash
git clone https://github.com/priyanshupandey12/local-service-backend
cd local-service-backend
```

---

### 2. Backend Setup

```bash
cd local-service-backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=your_url
```

Start the backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

---


## 📁 Project Structure

```
localservice/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── provider.controller.js
│   │   │   ├── review.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── booking.model.js
│   │   │   ├── provider.model.js
│   │   │   ├── ServiceCategory.model.js
│   │   │   └── review.model.js
│   │   ├── route/
│   │   ├── middleware/
│   │   └── utils/
|   |   |__ config/  
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── customer/
        │   ├── provider/
        │   └── admin/
        │ 
        ├── services/
        |__ public/
        ├── store/
        └── components/
```

---

## 🔐 API Endpoints (Summary)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logut user |
| GET | `/api/auth/me` | Get current user |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/booking/` | Create booking |
| GET | `/api/booking/customer` | Get customer bookings |
| GET | `/api/booking/provider` | Get provider bookings |
| GET | `/api/booking/:id` | Get booking by ID |
| PATCH | `/api/booking/:id/status` | Update booking status |
| PATCH | `/api/booking/:id/images` | Upload before/after images |
| PATCH | `/api/booking/:id/notes` | Update job notes |
| PATCH | `/api/booking/:id/cancel` | Cancel booking |
| PATCH | `/api/booking/:id/reschedule` | Reschedule booking |

### Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/provider/` |  GetAllProviders (with filters)|
| GET | `/api/provider/:id` |  GetProviderByID (with filters)|
| PATCH | `/api/provider/profile` | Update provider profile |
| POST | `/api/provider/profile` |  Createprofile |
| PATCH | `/api/provider/profile` |  Providerprofile |
| PATCH | `/api/provider/toggle` | Toggle availability |



---


## 📄 License

MIT License — free to use and modify.