# 🏠 Bharat Properties — MongoDB Edition

Same full-stack real estate portal, now powered by **MongoDB + Mongoose** instead of PostgreSQL.

---

## 🌐 Live Deployment

| Service   | URL                                                                 |
|-----------|----------------------------------------------------------------------|
| Frontend  | [https://bharat-realestate.com](https://bharat-realestate.com) |
| Backend API | [https://bharat-backend-3p58.onrender.com](https://bharat-backend-3p58.onrender.com) |
| Health check | [https://bharat-backend-3p58.onrender.com/api/health](https://bharat-backend-3p58.onrender.com/api/health) |

**Hosting:** Frontend on Vercel, backend on Render, database on MongoDB Atlas.

---

## 🐳 Production Deployment (Docker)

Both services now have Dockerfiles, wired together with `docker-compose.yml` at the project root.

1. Copy the example env files and fill in real values:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Build and start everything:
   ```bash
   docker compose up --build
   ```
3. Visit **http://localhost** — nginx serves the built frontend and proxies `/api`, `/sitemap.xml`, and known social/search crawlers to the backend container.

This still expects `MONGO_URI` in `backend/.env` to point at a reachable database (e.g. MongoDB Atlas) — there's no local Mongo container in the compose file, since the existing setup already uses Atlas.

---

## 🚀 Setup (3 steps only)

### Step 1 — Check MongoDB is running

Open **MongoDB Compass** or run in terminal:
```bash
mongosh
```
If it connects, you're good. If not, start MongoDB from Services or run:
```bash
# Windows
net start MongoDB
# Mac
brew services start mongodb-community
```

### Step 2 — Backend

```bash
cd backend
npm install
```

Open `backend/.env` and set:
```env
MONGO_URI=mongodb://localhost:27017/bharat_properties
JWT_SECRET=any_random_secret_here
CLIENT_URL=http://localhost:5173
PORT=4000
```

> In production (Render), `CLIENT_URL` should be set to the deployed frontend URL, e.g.
> `CLIENT_URL=https://bharat-realestate.com`
> Multiple origins can be comma-separated: `CLIENT_URL=https://bharat-realestate.com,http://localhost:5173`

Seed the database:
```bash
node src/seed.js
```

Start the server:
```bash
npm run dev
```

Test: open http://localhost:4000/api/health → should show `{"status":"OK","db":"MongoDB"}`

### Step 3 — Frontend

```bash
cd frontend
npm install
```

Open `frontend/.env` and set:
```env
VITE_API_URL=http://localhost:4000/api
```

> In production (Vercel), `VITE_API_URL` should point at the deployed backend, e.g.
> `VITE_API_URL=https://bharat-backend-3p58.onrender.com/api`
> Note: Vite bakes this in at **build time** — updating it in the Vercel dashboard requires a fresh redeploy to take effect.

```bash
npm run dev
```

Open http://localhost:5173 🎉

---

## 🔑 Admin Login

Running `node src/seed.js` creates one admin account and prints its password **once**, to the terminal — it's randomly generated each time, not fixed, so save it when you see it:

```
📧 Admin: admin@bharat-realestate.com
🔑 Password: <random — shown only at seed time>
```

Want a specific password instead? Set it before seeding:
```bash
SEED_ADMIN_PASSWORD=your_own_password node src/seed.js
```

`seed.js` **deletes all existing users and properties** before reseeding. If `MONGO_URI` isn't pointing at `localhost`, it refuses to run unless you explicitly confirm with `CONFIRM_SEED=yes node src/seed.js` — this is meant to stop it from accidentally wiping a real (e.g. Atlas) database.

---

## 📡 MongoDB Atlas (Cloud — optional)

If you want to use cloud MongoDB instead of local:

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → free tier
2. Create cluster → get connection string
3. Replace in `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bharat_properties
```

---

## 🗂️ Collections Created Automatically

| Collection   | Description                        |
|--------------|------------------------------------|
| `users`      | Registered users + admin accounts  |
| `properties` | All property listings              |
| `inquiries`  | Contact inquiries from buyers      |

---

## 📦 Key Dependencies

| Package    | Purpose                    |
|------------|----------------------------|
| mongoose   | MongoDB ODM (models, queries) |
| express    | REST API server            |
| jsonwebtoken | Auth tokens              |
| bcryptjs   | Password hashing           |
| nodemailer | Email notifications        |
| cloudinary | Image hosting (optional)   |
