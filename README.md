# Vidyara · Student Management System

Role-based student management with **Admin**, **Teacher** and **Student** dashboards.
Backend: Node.js · Express 5 · MongoDB (Mongoose) · Zod · JWT. Frontend: Vue 3 · TypeScript · Vite · Pinia · Zod.

## Run locally

```bash
# 1. Backend
cd backend
cp .env.example .env            # fill in MONGODB_URI and a long random JWT_SECRET
npm install
npm run seed                    # creates the demo accounts below (safe to re-run)
npm run dev                     # http://localhost:5000/api/v1

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env            # VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev                     # http://localhost:5173
```

## Demo logins

| Role    | Email             | Password    |
| ------- | ----------------- | ----------- |
| Admin   | admin@sms.dev     | Admin@123   |
| Teacher | teacher@sms.dev   | Teacher@123 |
| Student | student@sms.dev   | Student@123 |

## What each role can do

| Role    | Can                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Admin   | Dashboard (attendance trend, today's registers, teacher workload, quick actions) · approve/decline teacher sign-ups · manage users & set temporary passwords · full student CRUD · assign teachers (single or bulk) · export students to CSV · campus attendance overview · post announcements (pin) · build timetables · view all assignments |
| Teacher | Dashboard (today's classes, register status, submissions to check) · assigned students · grades & remarks · **daily attendance register** · **assignments** with submissions & checking · announcements to students · timetable |
| Student | Dashboard (grades, attendance, teacher, today's classes, to-dos, notices) · **assignments** (mark submitted) · **attendance calendar** · **timetable** · announcements · own details & password |

Pages: `/` landing · `/login` · `/signup` · `/forgot-password` · `/reset-password` · role dashboards.

Product decisions: students self-register and are active immediately; teachers self-register but stay **pending** until an admin approves; admins are only created by another admin (or the seed). Logout is real — it bumps a token version on the server so old JWTs stop working.

## API (all under `/api/v1`, JSON, `Authorization: Bearer <token>`)

| Method | Path                     | Who            |
| ------ | ------------------------ | -------------- |
| POST   | /auth/signup             | public         |
| POST   | /auth/login              | public         |
| POST   | /auth/forgot-password    | public (reset link; printed to the server console until an email provider is added in `utils/mailer.js`) |
| POST   | /auth/reset-password     | public (single-use token, 30 min) |
| POST   | /auth/logout             | any            |
| GET    | /auth/me · PATCH /auth/me · PATCH /auth/password | any |
| GET    | /dashboard               | any (role-specific payload) |
| GET/POST | /users · GET/PATCH/DELETE /users/:id · GET /users/teachers | admin |
| GET    | /students                | admin (all) · teacher (assigned only) |
| POST   | /students                | admin          |
| GET    | /students/courses        | admin, teacher |
| GET/PATCH | /students/me          | student        |
| GET    | /students/:id            | admin · teacher (if assigned) |
| PATCH  | /students/:id            | admin (profile, teacher, status) |
| PATCH  | /students/:id/academic   | admin, teacher (grades, attendance, remarks) |
| DELETE | /students/:id            | admin          |
| GET/POST | /announcements · PATCH/DELETE /announcements/:id | all read · admin/teacher write (own) |
| GET    | /attendance/sheet?date · POST /attendance/mark | teacher (assigned students) |
| GET    | /attendance/overview?date | admin |
| PATCH  | /students/bulk-assign · GET /students/export (CSV) | admin · admin/teacher |
| POST   | /users/:id/password | admin (temporary password) |
| GET    | /attendance/me?month · /attendance/student/:id?month | student · admin/teacher |
| GET/POST | /assignments · GET/PATCH/DELETE /assignments/:id | teacher (own) · admin read · student list |
| POST   | /assignments/:id/submit · PATCH /assignments/:id/submissions/:studentId | student · teacher |
| GET    | /timetable?course&year · /timetable/me · POST/PATCH/DELETE /timetable/:id | admin/teacher · student · admin/teacher |

Every request is validated with Zod; errors come back as `{ success:false, message, errors:[{field,message}] }`.

## Deploy

* **Frontend → Cloudflare Pages**: root `frontend`, build `npm run build`, output `dist`, env `VITE_API_URL=https://<your-api>/api/v1`. Add a `_redirects` file with `/* /index.html 200` for SPA routing (or set it in Pages settings).
* **Backend → Render / Railway / Fly** (any Node host): root `backend`, start `npm start`, env vars from `.env.example`, `CORS_ORIGIN` and `APP_URL` set to `https://<your-pages-domain>`. Whitelist the host's IP (or `0.0.0.0/0`) in MongoDB Atlas → Network Access, then run `npm run seed` once.

Never commit `.env` — both folders ignore it.
