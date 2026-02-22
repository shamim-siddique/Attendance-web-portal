# AttendanceOS — Management Portal

Production-ready Web Portal frontend for an Employee Attendance & Hierarchy Management System. This is a **management-only** portal: only users with **Admin** or **Manager** roles can sign in. Employees do not have access.

## Tech Stack

- **Build**: Vite 7  
- **Framework**: React 19  
- **Routing**: react-router-dom v7  
- **HTTP**: axios v1.13.5 (with request/response interceptors, 401 refresh)  
- **Auth**: Google OAuth via `@react-oauth/google`, JWT via `jwt-decode` (v4 named export)  
- **Tables**: @tanstack/react-table v8  
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` only — no PostCSS, no `tailwind.config.js`)  
- **Icons**: lucide-react  

## Prerequisites

- **Node.js 20.19+** (required for Vite 7)  
- npm  
- Backend API running at the configured base URL (e.g. `http://localhost:5000/api/v1`)  
- Google OAuth client ID (company domain restriction is enforced by the backend)  

## Setup

1. **Clone and install**
   ```bash
   cd web-portal
   npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `VITE_API_BASE_URL` — e.g. `http://localhost:5000/api/v1`  
   - `VITE_GOOGLE_CLIENT_ID` — your Google OAuth client ID  

3. **Run**
   ```bash
   npm run dev
   ```
   App runs at **http://localhost:3000** (configurable in `vite.config.js`).

## Scripts

- `npm run dev` — start dev server  
- `npm run build` — production build  
- `npm run preview` — preview production build  

## Routes

| Path | Description |
|------|-------------|
| `/login` | Google sign-in (Admins & Managers only) |
| `/dashboard` | Overview, stats, pending leaves, quick actions |
| `/team/members` | Team members table (scoped by role) |
| `/team/attendance` | Attendance records + override modal |
| `/team/analytics` | Analytics table + aggregate cards + CSV export |
| `/team/leaves` | Leave requests, approve/reject |
| `/users/create` | Create user (roles + manager for Admin) |
| `/users/locations` | Geo-fence locations for team members |

All routes except `/login` are protected; redirect to `/login` if not authenticated or not Admin/Manager.

## Role Access

| Feature | Admin | Manager |
|--------|--------|--------|
| Login | ✅ | ✅ |
| Dashboard | ✅ (org-wide) | ✅ (own hierarchy) |
| Team Members | ✅ All users | ✅ Own subtree |
| Attendance | ✅ All | ✅ Own hierarchy |
| Override attendance | ✅ Any | ✅ Own hierarchy |
| Analytics | ✅ Org-wide | ✅ Own hierarchy |
| Leave requests | ✅ All | ✅ Own hierarchy |
| Create User | ✅ Any role + assign manager | ✅ Employee/Manager only, auto under self |
| User locations | ✅ Any user | ✅ Own hierarchy |

Backend enforces hierarchy and scope; the frontend only adjusts UI (e.g. Admin role option and manager dropdown for Admins).

## Backend

This frontend expects the AttendanceOS backend API to be running. All requests send:

- `X-Client-Type: web`  
- `Authorization: Bearer <access_token>` on protected routes  

Token refresh is handled automatically via the axios response interceptor.

## License

Private — part of AttendanceOS.
