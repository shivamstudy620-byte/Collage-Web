# Rama Kishore Singh Degree College - Official Web Platform

Official college website and administrative Content Management System (CMS) for **Rama Kishore Singh Degree College** (Bihjadi, Sahdei Buzurg, Vaishali, Bihar - 844509).

Affiliated to **B.R.A. Bihar University, Muzaffarpur** & Approved by **Government of Bihar**.

---

## 1. Project Architecture

```text
   [ Netlify Edge CDN ]                [ Render Web Service ]             [ MongoDB Atlas ]
   React 18 + Vite SPA  ────────────>  Node.js + Express API  ──────────>  Cloud Database
         │                                       │                             │
   (Static UI & Routing)                (Helmet, CORS, JWT, Rate Limit)   (Collections)
         │                                       │                             │
         └───────────── [ Cloudinary Media Storage ] ──────────────────────────┘
                         (Permanent Images & Notice PDFs)
```

- **Frontend (`frontend/`)**: React 18, Vite, Bootstrap 5, React Router, Axios, React Icons, Google Maps embed, and optional Mapbox Static Maps.
- **Backend (`backend/`)**: Node.js, Express.js, Mongoose (MongoDB Atlas), JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `multer` (in-memory upload buffer), and Cloudinary SDK.
- **Local Backup (`backend/college.db`)**: Original SQLite database preserved locally as a read-only backup and migration source (ignored by Git).

---

## 2. Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- A MongoDB Atlas cluster (or local MongoDB URI)
- A Cloudinary account (required in production; optional in offline local development)

### Backend Setup
```bash
cd backend
npm ci
```
Create `backend/.env` from `backend/.env.example` and fill in your real local values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/college?retryWrites=true&w=majority
JWT_SECRET=<your_long_random_jwt_secret>
CLOUDINARY_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./college.db
```
Start the backend in development mode:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm ci
```
Create `frontend/.env` from `frontend/.env.example`:
```env
# Leave unset or use /api in local development so Vite proxies /api to http://localhost:5000
VITE_API_URL=/api

# Optional public Mapbox token (restrict by domain in Mapbox dashboard before production)
VITE_MAP_TOKEN=<your_mapbox_public_token>
```
Start the frontend dev server:
```bash
npm run dev
```
The Vite dev server runs on `http://localhost:3000` and proxies `/api` and `/uploads` to `http://localhost:5000`.

---

## 3. Required Environment Variables

### Backend (`backend/.env` locally, Render Dashboard in production)
| Variable | Required in Prod | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | Yes | Set to `production` on Render |
| `PORT` | Yes | Port provided by Render (default `5000` in `render.yaml`) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong random secret (at least 32+ chars; no fallback in code) |
| `CLOUDINARY_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `FRONTEND_URL` | Yes | Exact Netlify origin(s), comma-separated (e.g., `https://your-site.netlify.app`) |
| `DATABASE_PATH` | Optional | Path to local SQLite backup (`./college.db`) for migration |

### Frontend (`frontend/.env` locally, Netlify Dashboard in production)
| Variable | Required in Prod | Description |
| :--- | :---: | :--- |
| `VITE_API_URL` | Yes | Full Render API base URL (e.g., `https://your-service.onrender.com/api`) |
| `VITE_MAP_TOKEN` | Optional | Public Mapbox access token (`pk.*`) for Satellite/Streets views |

> **Important Security Note on `VITE_` Variables:** Any variable prefixed with `VITE_` is bundled into public browser JavaScript. Never place `MONGODB_URI`, `JWT_SECRET`, or `CLOUDINARY_API_SECRET` in `frontend/.env` or Netlify frontend variables. For `VITE_MAP_TOKEN`, configure **URL restrictions** in your Mapbox account dashboard allowing only your Netlify production domain (and `http://localhost:3000` during local testing).

---

## 4. MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an **M0 Free Cluster**.
2. In **Database Access**, create a dedicated database user with **Read and write to any database** permissions and a strong password.
3. In **Network Access**, add `0.0.0.0/0` (or Render's outbound IPs) so Render containers can reach your cluster.
4. Click **Connect -> Drivers** and copy the `mongodb+srv://...` connection string into `MONGODB_URI`.

---

## 5. Cloudinary Setup

1. Sign in to [Cloudinary Console](https://cloudinary.com/console).
2. Copy your **Cloud Name**, **API Key**, and **API Secret**.
3. If credentials were ever previously exposed or shared, rotate the **API Secret** under **Settings -> Access Keys** before deploying.
4. Enter `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` into `backend/.env` (locally) and Render Environment Variables (production).

---

## 6. Safe Initial Admin Creation

This application **never** seeds default weak credentials like `admin123` in production.

- **If migrating from SQLite (`college.db`)**: Running `npm run migrate` preserves your existing SQLite admin account and password hash automatically.
- **If starting with an empty MongoDB database**: Run the interactive admin setup script once with `MONGODB_URI` configured:
  ```bash
  cd backend
  npm run create-admin
  ```
  It only runs when no admin exists in MongoDB and enforces a strong password (minimum 8 characters with letters and numbers).
- After signing in at `/admin/login`, you can update your password anytime at `/admin/change-password`. Changing the password immediately invalidates all previously issued JWT sessions.

---

## 7. SQLite to MongoDB Atlas Migration

To migrate existing data (`admin`, `courses`, `notices`, `gallery`) from `backend/college.db` to MongoDB Atlas and upload local media to Cloudinary:

1. Ensure `MONGODB_URI`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set in `backend/.env`.
2. Run:
   ```bash
   cd backend
   npm run migrate
   ```
3. The script:
   - Opens `college.db` in **read-only** mode (never modifying or deleting your local backup).
   - Skips already-migrated records safely (idempotent by `sqlite_id`).
   - Uploads notice PDFs and gallery images to Cloudinary and stores `secure_url` + `cloudinary_public_id`.
   - Verifies actual MongoDB document counts against SQLite counts and exits non-zero if any error occurs.

---

## 8. GitHub Upload Instructions

Before initializing/pushing to GitHub, verify `.env` files, `node_modules/`, `dist/`, and `backend/college.db` are ignored:

```bash
git init
git add .
git status
```
Confirm `backend/.env`, `frontend/.env`, `backend/college.db`, and `node_modules/` do **not** appear in `git status`. Then commit and push:
```bash
git commit -m "Production-ready college website and CMS"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

---

## 9. Render Backend Deployment

1. Log in to [Render](https://render.com/) -> **New +** -> **Web Service** (or use **Blueprint** with `render.yaml`).
2. Connect your GitHub repository and verify settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Add the required Environment Variables in Render (`NODE_ENV=production`, `PORT=5000`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL`).
4. Deploy and test `https://<your-render-service>.onrender.com/api/health` (must return HTTP `200` with `"database": "connected"`).

---

## 10. Netlify Frontend Deployment & Production API URL

1. Log in to [Netlify](https://www.netlify.com/) -> **Add new site** -> **Import an existing project**.
2. Select your GitHub repository. Root `netlify.toml` automatically sets:
   - **Base directory:** `frontend`
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist` (or `frontend/dist` in UI if not using base)
   - **SPA Redirect:** `/* -> /index.html (200)` (also backed by `frontend/public/_redirects`)
3. In Netlify **Environment Variables**, set:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`
   - `VITE_MAP_TOKEN` = `<your_mapbox_public_token>` *(optional, domain-restricted)*
4. Deploy the site and copy the live Netlify URL (e.g., `https://<your-site>.netlify.app`).
5. Return to **Render -> Environment Variables** and set `FRONTEND_URL` to your exact Netlify origin (`https://<your-site>.netlify.app`, no trailing slash), then redeploy/restart Render.

---

## 11. Verification Commands

```bash
# Backend security & API suite
cd backend
npm ci
npm test

# Frontend production build
cd frontend
npm ci
npm run build
```

---

## 12. Troubleshooting

- **CORS Errors on Netlify**: Verify `FRONTEND_URL` on Render matches your exact Netlify `https://...` origin with no trailing slash.
- **Health Endpoint Returns 503**: MongoDB Atlas is unreachable. Check `MONGODB_URI` credentials and Atlas **Network Access** (`0.0.0.0/0`).
- **Uploads Fail in Production**: Ensure `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set on Render without placeholder strings.
- **Page Refresh Returns 404 on Netlify**: Ensure `netlify.toml` and `frontend/public/_redirects` are present in the deployed repository.
- **Mapbox Views Not Visible**: Set `VITE_MAP_TOKEN` in Netlify environment variables and trigger a new frontend build. Google Maps remains active by default.

---

## 13. Backup & Recovery

- **SQLite Backup**: Keep `backend/college.db` and `backend/uploads/` stored safely offline as your local backup.
- **MongoDB Atlas**: Enable Atlas automated snapshots or run periodic `mongodump` exports.
- **Cloudinary**: Enable Cloudinary backup/versioning in your Cloudinary account settings for media recovery.
