# Career360 Project State

## Product
Career360

## Tagline
Your Complete Career & Placement Intelligence Platform

## Current Status
Global Career360 Official Color Palette & Student Platform Refinement Complete — Production Ready

## Completed Milestones
- Phase 0 — Project Foundation
- Phase 1 — Authentication & RBAC
- Phase 2 — Student Profile & Student Data
- Phase 3 — Academic Management & Intelligence
- Phase 4 — Placement Core
- Phase 5 — Dashboards & Analytics
- Phase 6 — Career Intelligence & Preparation Hub
- Phase 7 — Advanced Reporting, Notifications & System Hardening
- Final Polish — Phase Badges Removed from UI
- Refinement Milestone — Student-Only Career Platform & Previous Year Placement Insights Suite
- Design Transformation — Official Career360 Brand Palette System (#001D39, #0A4174, #49769F, #4E8EA2, #6EA2B3, #7BBDE8, #BDD8E9, #FFFFFF)

## Completed Features

### Phase 0 — Foundation
- [x] Repository structure established (frontend/, backend/, prisma/, docs/)
- [x] Frontend foundation: React 18 + Vite + Tailwind CSS 3 + React Router v6
- [x] Backend foundation: Node.js + Express.js
- [x] Database configuration: PostgreSQL + Prisma ORM
- [x] REST API foundation: /api/v1 prefix, modular routing
- [x] Health check endpoint: GET /api/v1/health
- [x] Centralized error handling system
- [x] Request logging (Morgan + Winston)
- [x] CORS configuration
- [x] Helmet security headers
- [x] Rate limiting on /api/ routes
- [x] Environment variable system (.env.example)
- [x] Reusable UI component library (13 components)
- [x] Landing page
- [x] Dashboard layout
- [x] .gitignore, README.md, PROJECT_STATE.md

### Phase 1 — Authentication & RBAC
- [x] User model with Role enum (STUDENT / FACULTY / PLACEMENT_COORDINATOR / ADMIN)
- [x] AccountStatus enum (ACTIVE / INACTIVE)
- [x] PasswordResetToken model (DB architecture ready)
- [x] Prisma migration (init_auth)
- [x] bcryptjs password hashing (12 rounds)
- [x] JWT access tokens (15 min, in-memory)
- [x] JWT refresh tokens (7 days, HTTP-only cookie)
- [x] Token rotation on refresh
- [x] POST /api/v1/auth/register — student registration only
- [x] POST /api/v1/auth/login — credential verification
- [x] POST /api/v1/auth/logout — server-side token invalidation
- [x] GET  /api/v1/auth/me — return current user
- [x] POST /api/v1/auth/refresh — silent session restore
- [x] GET  /api/v1/users/me — ownership-enforced profile
- [x] Authenticate middleware — Bearer token verification
- [x] Authorize middleware — role-based access control factory
- [x] Validate middleware — Zod schema wrapper with field-level errors
- [x] Auth validators (Zod): register schema, login schema, password policy
- [x] Auth rate limiting (relaxed in dev mode)
- [x] Strict auth error messages (prevent user enumeration)
- [x] Timing-attack resistant login (constant-time bcrypt)
- [x] Account status check (INACTIVE blocks login)
- [x] DATABASE_UNAVAILABLE 503 when DB not connected
- [x] React AuthContext (currentUser, isAuthenticated, role, login, logout, register, refreshUser)
- [x] useAuth hook
- [x] ProtectedRoute guard (auth + role restriction)
- [x] PublicOnlyRoute guard (redirect authenticated users)
- [x] Silent session restore on page refresh (via refresh cookie)
- [x] Axios 401 interceptor with silent refresh + request queuing (with auth endpoint safety check)
- [x] In-memory access token (no localStorage)
- [x] Login page (professional, show/hide password, loading, error state, role-home redirect)
- [x] Registration page (password strength indicator, show/hide)
- [x] StudentLayout with Student sidebar (14 nav items)
- [x] FacultyLayout with Faculty sidebar (9 nav items)
- [x] CoordinatorLayout with Coordinator sidebar (12 nav items)
- [x] AdminLayout with Admin sidebar (10 nav items)
- [x] StudentDashboard — welcome, journey progress, metric cards, live intelligence
- [x] Role-based routing (/student/*, /faculty/*, /coordinator/*, /admin/*, /dashboard)
- [x] Development seed data (4 accounts)

### Phase 2 — Student Profile & Student Data
- [x] StudentProfile model (rollNumber, phone, gender, dob, address, computed CGPA, backlogs)
- [x] Department and Batch models
- [x] Skill model (category, proficiency, evidence)
- [x] Project model (title, description, techStack, role, category, isTeam, GitHub/demo URLs)
- [x] Certification model (issuingOrg, issueDate, expiryDate, credentialId, verificationUrl)
- [x] Internship model (organization, role, dates, techStack, verificationUrl)
- [x] Achievement model (title, category, date, proofUrl)
- [x] ProfessionalLink model (LinkedIn, GitHub, Portfolio, LeetCode, Codeforces, etc.)
- [x] CareerPreference model (targetRole, careerInterests, preferredLocation, careerGoals)
- [x] Student Profile management API (/api/v1/students/profile)
- [x] Reference data API (/api/v1/students/departments, /batches)
- [x] Full CRUD APIs for Skills, Projects, Certifications, Internships, Achievements, Links, Career
- [x] Dynamic Profile Completeness calculator (0-100% weighted scoring algorithm)
- [x] CompletenessRing UI component
- [x] Frontend /student/profile page (personal, academic, professional links, career preferences modals)
- [x] Frontend /student/skills page (category filtering, proficiency meters, CRUD modals)
- [x] Frontend /student/projects page (category filtering, team/solo badges, tech stack pills, links, CRUD modals)
- [x] Frontend /student/certifications page (org, credential ID, verification links, CRUD modals)
- [x] Frontend /student/internships page (organization, role, ongoing status, tech stack, verification link)
- [x] Frontend /student/achievements page (honors, hackathons, distinctions with proof links)
- [x] Updated StudentDashboard with live profile completeness and metric stats

### Phase 3 — Academic Management & Intelligence
- [x] AcademicSemester model (semesterNumber 1-8, academicYear, computed SGPA, totalCredits)
- [x] Subject model (code, name, credits, department relation)
- [x] StudentSubjectRecord model (marksObtained, maxMarks, grade, attendance %, isBacklog, clearedAt)
- [x] Academic validators (Zod)
- [x] Automated SGPA calculation service (grade points x credits formula)
- [x] Cumulative GPA (CGPA) automatic recalculation on student profile
- [x] Active backlog and total backlog tracking service
- [x] Aggregate attendance calculation & shortfall warning (<75%)
- [x] Placement eligibility rule checks & actionable insights generator
- [x] Academic routes (/api/v1/academics/summary, /semesters, /records, /subjects)
- [x] Frontend academic API service
- [x] Frontend /student/academics page (scholastic scorecard, SGPA trajectory chart, semester tabs, subject grade records table, modals)
- [x] Seed data with 10 engineering subjects, 4 semester records, and 8.58 CGPA

### Phase 4 — Placement Core
- [x] Company model & corporate recruiting profiles
- [x] JobOpening model with salary packages (CTC in LPA) and required skills
- [x] PlacementDrive model with campaign dates and selection processes
- [x] EligibilityRule model (min CGPA, max active/total backlogs, departments, graduation cohorts)
- [x] Dynamic eligibility evaluation engine (instant real-time pass/fail checks per student)
- [x] Student application submission & tracking pipeline
- [x] SelectionRound scheduling & status management (interview dates, venue/links)
- [x] PlacementOutcome recording for final offers (package offered, acceptance status)
- [x] Backend routes: /api/v1/placement/* with full validation and authorization
- [x] Frontend /student/placements page with active drive catalog, eligibility inspector, and application tracking pipeline

### Phase 5 — Dashboards & Analytics
- [x] Placement Coordinator Dashboard (/coordinator/dashboard) with recruitment conversion funnel, KPI cards, recent applicants, and active drives
- [x] Coordinator Companies Page (/coordinator/companies) with add company modal and partner directory
- [x] Coordinator Drives Page (/coordinator/drives) with drive scheduler, eligibility rules config, and candidate counts
- [x] Coordinator Applications Page (/coordinator/applications) with multi-filter pipeline, status updater, and interview round scheduler
- [x] Coordinator Placements Page (/coordinator/placements) with offer recorder, CTC compensation metrics, and verified outcomes table
- [x] Faculty Dashboard (/faculty/dashboard) with departmental scholastic overview, grade tiers, and Early Warning alert desk
- [x] Faculty Student Roster (/faculty/students) with search, department filtering, CGPA, backlogs, and attendance metrics
- [x] Faculty Early Warning Triage Desk (/faculty/early-warning) with attendance (<75%), low CGPA (<6.0), and backlog alert filtering
- [x] Admin Dashboard (/admin/dashboard) with platform KPIs, role distribution, and departmental benchmark matrix
- [x] Admin User Management (/admin/users) with account status toggles (Activate / Deactivate) and role filtering
- [x] Admin Department Management (/admin/departments) with create department modal and curriculum metrics
- [x] Analytics Backend APIs (/api/v1/analytics/overview, /placement, /faculty, /departments)
- [x] Fixed Landing Page "Get Started" and "Open Dashboard" routes to intelligently route to role dashboards or auth
- [x] Enriched demo cohort data with high achievers, at-risk students, and placed candidates

### Phase 6 — Career Intelligence & Preparation Hub
- [x] TargetRole, RoleSkill, and StudentTargetRole models
- [x] CareerReadinessScore 5-pillar algorithm (Academics 25%, Skills 25%, Projects 20%, Internships 15%, Certifications 15%)
- [x] Skill gap analysis engine matching student verified skills against target industry roles
- [x] Personalized student career roadmap checklist (CareerRoadmapItem model, status toggling, custom milestone modal)
- [x] Preparation resources hub & progress tracking (PreparationResource & PreparationProgress models, DSA, System Design, Core CS, Aptitude, Behavioral)
- [x] Backend routes: /api/v1/career/* (roles, readiness, skill-gap, roadmap, preparation)
- [x] Frontend /student/career page with radial gauge, 5-pillar meters, skill gap matrix, and interactive roadmap
- [x] Frontend /student/preparation page with category tabs, difficulty filtering, search, and module completion tracking
- [x] Integrated Career Readiness standing card into StudentDashboard
- [x] Seeded 6 industry target roles with 30+ skills and 15 curated preparation modules

### Phase 7 — Advanced Reporting, Notifications & System Hardening
- [x] Notification model with NotificationType enum (INFO, SUCCESS, WARNING, ACADEMIC_ALERT, DRIVE_ANNOUNCEMENT, INTERVIEW_ROUND, OFFER_ISSUED)
- [x] In-app notification triage service & REST endpoints (/api/v1/notifications, unread-count, read, read-all, dismiss)
- [x] Global NotificationCenter topbar component with live unread badge counter, popover tray, and mark-read controls across all 4 layouts (Student, Faculty, Coordinator, Admin)
- [x] Full-page Notifications Inbox (/student/notifications, /coordinator/notifications, /faculty/notifications, /admin/notifications) with tab filtering
- [x] Student Verified Placement CV report generator (/api/v1/reports/student-cv) & official template
- [x] Official Scholastic Academic Transcript generator (/api/v1/reports/transcript) with NAAC/institutional header, semester-by-semester course grades, credits earned, and COE verification seal
- [x] Student Reports Page (/student/reports) with tabbed dossier viewer and print/PDF-optimized styling (@media print)
- [x] Institutional Placement Summary & Conversion Intelligence service (/api/v1/reports/placement-summary)
- [x] Coordinator Placement Intelligence Dashboard (/coordinator/reports) with conversion metrics, department breakdown, and recent confirmed offers
- [x] Dynamic CSV Exporter (/api/v1/reports/export-csv?type=roster|placements) for instant download of cohort rosters and placement outcomes
- [x] AuditLog model with indexes on userId, action, createdAt
- [x] Centralized security & operational audit logging service (/api/v1/audit-logs, /stats)
- [x] Admin Security Audit Trail viewer (/admin/audit) with action/role filtering, event telemetry cards, and JSON payload inspector modal
- [x] Production Docker containerization: Multi-stage Node 20 backend Dockerfile, multi-stage Vite + Nginx frontend Dockerfile, nginx.conf SPA config, and docker-compose.yml (PostgreSQL 16 + Backend + Frontend)

## Pending Features / Future Roadmap
- [ ] Email-based password reset delivery (SMTP/SES provider integration)
- [ ] Gamification & peer leaderboards
- [ ] Automated CI/CD pipeline deployment

## Current Architecture

```
Career360/
├── frontend/          React 18 + Vite + Tailwind CSS 3 + React Router v6
│   └── src/
│       ├── components/
│       │   ├── ui/          12 reusable UI components
│       │   └── guards/      ProtectedRoute, PublicOnlyRoute
│       ├── context/         AuthContext.jsx
│       ├── hooks/           useAuth.js
│       ├── layouts/         DashboardLayout, StudentLayout, FacultyLayout,
│       │                    CoordinatorLayout, AdminLayout
│       ├── pages/
│       │   ├── auth/        LoginPage, RegisterPage
│       │   ├── student/     StudentDashboard
│       │   ├── faculty/     FacultyDashboard
│       │   ├── coordinator/ CoordinatorDashboard
│       │   ├── admin/       AdminDashboard
│       │   ├── LandingPage, DashboardPage, PlaceholderPage
│       ├── routes/          index.jsx (full role-based routing)
│       └── services/        api.js (Axios + 401 interceptor), auth.service.js
│
├── backend/           Node.js 18+ + Express 4
│   └── src/
│       ├── app.js           Express app (cookie-parser added)
│       ├── server.js        HTTP server entry + graceful shutdown
│       ├── config/          env.js (JWT validation), database.js
│       ├── controllers/     health.controller.js, auth.controller.js
│       ├── routes/          index.js, health.routes.js, auth.routes.js, users.routes.js
│       ├── middleware/      errorHandler, requestLogger, notFound,
│       │                    validate, authenticate, authorize
│       ├── services/        auth.service.js
│       ├── utils/           AppError, apiResponse, logger, token.service.js
│       └── validators/      auth.validator.js (Zod)
│
├── prisma/
│   ├── schema.prisma        User, Role enum, AccountStatus enum,
│   │                        PasswordResetToken, SystemConfig
│   └── seed.js              Dev seed: 4 accounts (admin/faculty/coordinator/student)
│
├── docs/
├── .env / .env.example
├── .gitignore
├── README.md
└── PROJECT_STATE.md
```

## Authentication Architecture

### Token Strategy
- **Access Token**: Short-lived JWT (15 min), stored in React state (memory) only
- **Refresh Token**: Long-lived JWT (7 days), stored in HTTP-only cookie (`career360_rt`)
- **Token Rotation**: New refresh token issued on every refresh call
- **Compromise Detection**: If a used token is presented, all sessions are invalidated

### Flow
```
POST /auth/login
   ↓ Validates credentials
   ↓ Generates access token (15m)
   ↓ Generates refresh token (7d) → stores hash in DB → sets HTTP-only cookie
   ↓ Returns: { user, accessToken }

Browser refresh / page load
   ↓ AuthContext.useEffect → POST /auth/refresh (cookie sent automatically)
   ↓ Server: verifies cookie, validates hash, rotates tokens
   ↓ Returns: { user, accessToken } → React state restored

API request
   ↓ Axios interceptor: Authorization: Bearer <accessToken>
   ↓ On 401: silent refresh → retry original request
   ↓ On refresh failure: logout + redirect to /login

POST /auth/logout
   ↓ Clears refreshTokenHash in DB
   ↓ Clears HTTP-only cookie
   ↓ Clears React state
```

## APIs

**Base URL:** /api/v1

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /api/v1/health | None | ✅ |
| POST | /api/v1/auth/register | None | ✅ |
| POST | /api/v1/auth/login | None | ✅ |
| POST | /api/v1/auth/logout | Bearer | ✅ |
| GET | /api/v1/auth/me | Bearer | ✅ |
| POST | /api/v1/auth/refresh | Cookie | ✅ |
| GET | /api/v1/users/me | Bearer | ✅ |
| * | /api/v1/students/* | Bearer | ✅ Phase 2 |
| * | /api/v1/academics/* | Bearer | ✅ Phase 3 |
| * | /api/v1/placement/* | Bearer | ✅ Phase 4 |
| * | /api/v1/analytics/* | Bearer | ✅ Phase 5 |
| * | /api/v1/career | — | 501 Placeholder (Phase 6) |
| * | /api/v1/reports | — | 501 Placeholder (Phase 7) |
| * | /api/v1/notifications | — | 501 Placeholder (Phase 7) |


## Database

**Technology:** PostgreSQL + Prisma ORM

**Models:**
- `User` — id (CUID), name, email, passwordHash, role (enum), status (enum), refreshTokenHash, createdAt, updatedAt
- `PasswordResetToken` — id, tokenHash, userId (FK), expiresAt, used, createdAt
- `SystemConfig` — id, key, value, createdAt, updatedAt

**Enums:**
- `Role`: STUDENT | FACULTY | PLACEMENT_COORDINATOR | ADMIN
- `AccountStatus`: ACTIVE | INACTIVE

**Migration:** `init_auth` (requires DATABASE_URL)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | No | development / production (default: development) |
| PORT | No | Backend port (default: 5000) |
| DATABASE_URL | ✅ Phase 1 | PostgreSQL connection string |
| FRONTEND_URL | No | Frontend URL for CORS |
| JWT_SECRET | ✅ Phase 1 | JWT signing secret (min 32 chars) |
| JWT_EXPIRES_IN | No | Access token expiry (default: 15m) |
| REFRESH_TOKEN_SECRET | ✅ Phase 1 | Refresh token signing secret |
| REFRESH_TOKEN_EXPIRES_IN | No | Refresh token expiry (default: 7d) |
| RATE_LIMIT_WINDOW_MS | No | Rate limit window (default: 900000) |
| RATE_LIMIT_MAX | No | Max requests per window (default: 100) |

## Dependencies

**Backend (Phase 1 additions):**
- bcryptjs ^2.4.3
- jsonwebtoken ^9.0.2
- zod ^3.23.8
- cookie-parser ^1.4.6

**Frontend (Phase 1 additions):**
- No new packages required

## Development Seed Credentials
⚠️  DEV ONLY — change before any real deployment

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@career360.dev | Admin@1234 |
| FACULTY | faculty@career360.dev | Faculty@1234 |
| PLACEMENT_COORDINATOR | placement@career360.dev | Placement@1234 |
| STUDENT | student@career360.dev | Student@1234 |

## Known Issues

1. **DATABASE_URL not configured** — Register and login fail with DATABASE_UNAVAILABLE (503) until DATABASE_URL is set in .env and migration is run.
2. **Password reset emails** — Backend architecture and DB model are ready, but actual email delivery is not implemented (no email provider configured). Token will be console-logged in dev.
3. **No HTTPS** — HTTP only in development. HTTPS required in production via reverse proxy.
4. **Admin user creation** — Admin/faculty/coordinator accounts can only be created via seed script or direct DB in Phase 1. A user management admin panel is planned for Phase 2.

## Security Controls Implemented

- bcrypt password hashing (12 rounds)
- HTTP-only secure cookies for refresh token
- In-memory access token (XSS cannot steal via localStorage)
- Token rotation (prevents refresh token reuse)
- Compromise detection (invalidates all sessions if reused token detected)
- Timing-attack resistant login (constant-time bcrypt even for non-existent users)
- User enumeration prevention (generic "email or password incorrect" message)
- Auth rate limiting (20 req / 15 min on /auth endpoints)
- Account status check (INACTIVE accounts cannot authenticate)
- Helmet security headers
- CORS with whitelisted origins
- Zod input validation on all auth endpoints

## Technical Decisions

1. **JWT access token in memory only** — Prevents XSS from stealing tokens via localStorage.
2. **Refresh token in HTTP-only cookie** — Cannot be read by JavaScript; sent automatically by browser.
3. **Token rotation** — Each refresh call issues a new refresh token, limiting the window of token theft.
4. **Role as enum on User** — Cleanest approach for Career360's 4 fixed roles. Avoids unnecessary joins.
5. **bcrypt 12 rounds** — Strong but not too slow for a web app (approx 400ms on modern hardware).
6. **Zod for validation** — Type-safe, composable, excellent error reporting.
7. **Auth service pattern** — All auth business logic in service layer; controllers are thin HTTP adapters.
8. **DATABASE_UNAVAILABLE 503** — Explicit error code when DB is not connected, prevents confusing 500 responses.
9. **Silent refresh on mount** — AuthContext calls /auth/refresh on every page load to restore session from cookie.

## Next Phase
Phase 2 — Student Profile & Student Data

## DO NOT REINTRODUCE
- Automatic Student Portfolio Generator
- AI Mock Interview
- Anonymous Peer Benchmarking
- Alumni Intelligence
- Opportunity Recommendation System

## Official Career360 Brand Palette System

A centralized, strict visual color hierarchy has been established across the platform:
- **#001D39 — Dark Navy (Primary Dark)**: Deepest brand tone used for sidebars, primary titles, section headers, strong brand emphasis.
- **#0A4174 — Primary Blue (Primary Interaction)**: Primary buttons, active navigation states, active tabs, main CTAs, links.
- **#49769F — Slate Blue**: Secondary buttons, supporting card highlights, secondary charts.
- **#4E8EA2 — Teal Blue**: Skills badges, academic analytics, data visualization accents.
- **#6EA2B3 — Muted Teal**: Subtle progress indicators, supporting visual elements.
- **#7BBDE8 — Sky Blue**: Visual highlights, hover accents, subtle status markers.
- **#BDD8E9 — Light Blue**: Soft background containers, selected states, container borders (`#BDD8E9`/70).
- **#FFFFFF — White**: Extensive use for clean card surfaces, tables, forms, modals, main content.

### Visual Balance Enforced:
- **Core Dominance**: `Dark Navy (#001D39) + Primary Blue (#0A4174) + White (#FFFFFF)`.
- **Clean Aesthetic**: Cards are white with soft shadows and subtle borders; backgrounds are clean `#F4F7FB` surface; semantic status indicators (Green, Red, Amber) preserved.
- **Zero Functionality Impact**: 100% of APIs, database models, RBAC rules, routes, and business logic remain intact.

## Build Rules
1. Do not silently add removed features.
2. Do not change architecture or data contracts without documenting the decision.
3. Complete and test one phase before starting the next.
4. Keep the database as the single source of truth.
5. AI must not invent student data or guarantee placement.
6. Eligibility and suitability/matching are different concepts.
7. Keep the system modular, scalable and flexible.
8. Update this file after every completed phase.

