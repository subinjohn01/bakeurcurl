# 🌐 BakeUrCurls — Deployment & Infrastructure Registry

This document records the hosting platforms, live endpoints, repository links, database credentials, and service accounts used for the **BakeUrCurls** platform.

---

## 1. Summary of Infrastructure & Accounts

| Service | Hosting Platform | URL / Endpoint | Registered / Login Email | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | [https://bakeurcurl.vercel.app](https://bakeurcurl.vercel.app)<br>[https://bakeurcurls.com](https://bakeurcurls.com) | `bakeurcurl@gmail.com` | Root directory: `frontend/`<br>Auto-deploys on `git push origin main` |
| **Backend API** | **Render** | [https://bakeurcurl.onrender.com](https://bakeurcurl.onrender.com) | Associated Render Account (GitHub OAuth: `subinjohn01` or `bakeurcurl@gmail.com`) | Service Name: `bakeurcurl-backend`<br>Region: Singapore<br>Root directory: `backend/` |
| **Database** | **MongoDB Atlas** | `buc.umychbx.mongodb.net` (Cluster: `buc`) | Associated MongoDB Account | Database name: `bakeurcurls`<br>DB User: `bakeurcurls_db_user` |
| **Source Code** | **GitHub** | [https://github.com/subinjohn01/bakeurcurl.git](https://github.com/subinjohn01/bakeurcurl.git) | `subinjohn01` | Branch: `main` (CI/CD connected to Vercel & Render) |
| **Salon Business / Admin** | **System Admin** | [https://bakeurcurl.vercel.app/login](https://bakeurcurl.vercel.app/login) | `admin@BakeUrCurl.com` | Platform Admin Account |

---

## 2. Detailed Service Configurations

### A. Frontend (Client SPA)
* **Provider:** [Vercel](https://vercel.com)
* **Login Email:** `bakeurcurl@gmail.com`
* **Project Name:** `bakeurcurl`
* **Live URLs:**
  * Primary Vercel domain: `https://bakeurcurl.vercel.app`
  * Custom domain: `https://bakeurcurls.com`
* **Root Directory:** `frontend`
* **Build Command:** `npm run build`
* **Output Directory:** `build`
* **Framework Preset:** Create React App
* **Environment Variables in Vercel:**
  * `REACT_APP_API_URL`: `https://bakeurcurl.onrender.com/api`

---

### B. Backend (REST API)
* **Provider:** [Render](https://render.com)
* **Service Name:** `bakeurcurl-backend`
* **Service Type:** Web Service (Node.js)
* **Live API URL:** `https://bakeurcurl.onrender.com/api`
* **Region:** Singapore (`singapore`)
* **Plan:** Free Tier
* **Root Directory:** `backend`
* **Build Command:** `npm install`
* **Start Command:** `node server.js`
* **Environment Variables in Render:**
  * `NODE_ENV`: `production`
  * `PORT`: `5000`
  * `MONGO_URI`: `mongodb+srv://bakeurcurls_db_user:nHFBuvBgBaiMGDI7@buc.umychbx.mongodb.net/bakeurcurls?retryWrites=true&w=majority&appName=buc`
  * `JWT_SECRET`: `bakeurcurls_super_secret_jwt_key_2026`
  * `JWT_EXPIRE`: `30d`
  * `FRONTEND_URL`: `https://bakeurcurl.vercel.app,https://bakeurcurls.com`

---

### C. Database (Cloud Database)
* **Provider:** [MongoDB Atlas](https://cloud.mongodb.com)
* **Cluster Name:** `buc`
* **Host:** `buc.umychbx.mongodb.net`
* **Database Name:** `bakeurcurls`
* **Database Username:** `bakeurcurls_db_user`
* **Collections:**
  * `users` — Customers, staff, administrators
  * `bookings` — Customer appointments, time slots, payment statuses
  * `services` — Salon catalog, prices, duration
  * `products` — Curl care retail products
  * `coupons` — Promotional & phone-tied loyalty coupons
  * `reviews` — Customer 1-to-5 star ratings and testimonials
  * `queries` — Contact page customer inquiries

---

### D. System Administrative & Staff Credentials

| Role | Name | Email | Default Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@BakeUrCurl.com` | `Admin@123` | Full dashboard access (`/admin`), booking updates, customer CRM, staff management |
| **Staff Stylist** | Zara Thompson | `zara@BakeUrCurl.com` | `Staff@123` | Stylist dashboard (`/staff`), appointments schedule |
| **Staff Stylist** | Marcus Rivera | `marcus@BakeUrCurl.com` | `Staff@123` | Stylist dashboard (`/staff`), appointments schedule |

---

### E. Code Repository & CI/CD Pipeline
* **Git Remote:** `https://github.com/subinjohn01/bakeurcurl.git`
* **Default Branch:** `main`
* **Deployment Workflow:**
  * Any `git push origin main` triggers an immediate webhook to **Vercel** (rebuilding the frontend React app).
  * Render auto-deploys backend updates whenever changes to the `backend/` directory or root configuration are pushed.
