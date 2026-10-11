# 🌀 CurlCo Premium Salon — Full-Stack Booking System

A modern, full-featured booking platform for a premium curly hair salon.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Stripe.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Payments | Stripe (advance payments) |
| Email | Nodemailer |

## Features

### 🌐 Public Facing
- Beautiful landing page with curly hair branding
- Services catalog with categories & pricing
- Products catalog
- Multi-step booking form (4 steps)
- Guest booking (no account required)
- Contact / Query form
- Customer registration & login

### 👤 Customer Portal
- Dashboard with booking history
- Cancel upcoming appointments
- Profile management

### 💆 Staff Portal
- Today's schedule view
- Confirm / complete appointments
- View customer queries

### 🔧 Admin Panel
- Full booking management (view, confirm, cancel, complete)
- **Add / Edit / Delete Services** online
- **Add / Edit / Delete Products** online
- Staff management (add/edit/delete stylists)
- Customer query inbox with reply functionality
- Revenue & booking stats dashboard

### 💳 Payments
- Stripe integration for 30% advance payment
- Pay-at-salon option
- Payment status tracking

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Stripe keys, email config
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Seed Initial Data

```bash
cd backend
node seed/seedData.js
```

**Default Admin Login:**
- Email: `admin@curlco.com`
- Password: `Admin@123`

## Project Structure

```
curlco-salon/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Email, helpers
│   ├── seed/            # Seed data
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/         # Axios API calls
│       ├── components/  # Reusable UI
│       ├── context/     # Auth context
│       └── pages/       # Route pages
└── README.md
```

## Role-Based Access

| Role | Permissions |
|------|------------|
| `customer` | Book appointments, view own bookings, submit queries |
| `staff` | View all bookings, confirm/complete appointments, reply to queries |
| `admin` | Full access + manage services, products, staff |

## Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRE` | JWT expiry (e.g., `30d`) |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live/sk_test) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FRONTEND_URL` | Frontend URL for CORS |
