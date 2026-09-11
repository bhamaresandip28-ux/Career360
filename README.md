# Career360

> **Your Complete Career & Placement Intelligence Platform**

Career360 is an integrated, student-centered career acceleration and placement intelligence platform engineered specifically for engineering colleges and universities. It bridges academic performance, verified technical competencies, industry role benchmarks, and historical placement records into an actionable 360° career roadmap.

---

## 🌟 Key Capabilities

### 1. Dual-Track Student Dashboard
- **My Career Journey**: Seamless one-click tracking of institutional academics, technical skills, engineering projects, industry certifications, and internship experiences.
- **Previous Year Placement Insights**: High-impact portal exploring historical recruitment records, package brackets, and demanded tech stacks.
- **Real-Time Student Health Summary**: Compact metrics displaying verified Cumulative CGPA, Career Readiness Score, Skill counts, and Portfolio assets.

### 2. Previous Year Placement Insights Suite (`/student/insights` & `/insights`)
- **Academic Integrity**: Transparently badged with `DEMO DATA — For Career Exploration & Benchmarking`.
- **Comprehensive Filtering**: Real-time multi-dimensional filtering across Academic Cohorts (`2023`, `2024`, `2025`), Departments (`CSE`, `IT`), and Target Roles (`SDE`, `Full Stack Developer`, `Systems Engineer`, `Data Engineer`).
- **Recruiter Breakdown Table**: Deep-dive into company hiring data (Microsoft, Amazon, Goldman Sachs, Cisco, Oracle, Deloitte, Infosys, TCS Digital) with a detailed **Company Modal** displaying packages, roles, and skills.
- **Top In-Demand Skills**: Real frequency distribution tracking 39 technical skills across successful candidates.
- **Year-Over-Year Trends**: Progress tracking showing multi-year package evolution and +12.6% average CTC growth.
- **Historical Profile Benchmark Tool**: Match student profile skills against historical cohorts for target roles to compute an objective match percentage and uncover high-priority missing skills.

### 3. Career Intelligence & Preparation Hub
- **Target Role Benchmarking**: Calibrated benchmarks across industry tracks (SDE, Cloud/DevOps, Full Stack, Data Science).
- **Skill Gap Matrix**: Highlights mastered, in-progress, and critical missing competencies with priority tags.
- **Semester Roadmaps**: Step-by-step milestones to complete projects, earn credentials, and clear coding assessments.
- **Preparation Hub**: Curated technical topics, coding challenges, core subjects revision, and interview prep guides.

### 4. Official Academic Reporting & Institutional Portfolios
- **Verified Placement CV**: Instant ATS-friendly standardized CV generator with verified credentials, skills, and projects.
- **Official Academic Transcript**: NAAC/University accredited transcript format with semester-by-semester SGPA/CGPA, credits, and `@media print` PDF optimization.
- **In-App Notification Center**: Real-time alerts for placement drives, interview schedules, academic warnings, and profile milestones.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, React Router v6, Headless UI / Lucide |
| **Backend** | Node.js 18+, Express.js 4 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5 |
| **Authentication** | JWT (In-Memory Access Tokens + HTTP-only Refresh Cookies) + bcryptjs (12 rounds) |
| **Validation & Security** | Zod, Helmet, CORS, Rate Limiting, Audit Logging |
| **Logging** | Winston + Morgan |

---

## 🏛️ System Architecture

```
┌─────────────────────────────────┐
│  Client Application (React/Vite)│  http://localhost:5173
│  Tailwind CSS · React Router v6 │
└────────────────┬────────────────┘
                 │ REST / JSON (JWT Bearer)
┌────────────────▼────────────────┐
│  REST API Gateway (Express.js)  │  http://localhost:5000/api/v1
│  Security Headers · Rate Limit  │
│  Zod Validation · Audit Logger  │
└────────────────┬────────────────┘
                 │ Prisma ORM Client
┌────────────────▼────────────────┐
│  PostgreSQL Database Engine     │
│  Relational Models & Indices    │
└─────────────────────────────────┘
```

---

## 📂 Project Directory Structure

```
Career360/
├── backend/                       # Express REST API
│   ├── prisma/                    # Prisma schema, migrations, seeders
│   │   ├── schema.prisma          # Relational database schema
│   │   ├── migrations/            # Migration history
│   │   └── seed_career.js         # Career intelligence seeder
│   ├── src/
│   │   ├── app.js                 # Express application setup
│   │   ├── server.js              # Server entrypoint & graceful shutdown
│   │   ├── config/                # Environment variables & database client
│   │   ├── controllers/           # HTTP route handlers
│   │   ├── middleware/            # Auth, authorization, validation, error handlers
│   │   ├── routes/                # Modular API v1 routers
│   │   ├── services/              # Business logic & data access
│   │   └── utils/                 # Token handling, response wrappers, AppError
│   ├── seed_historical_placements.js # Seeds 2023-2025 historical placement data
│   └── package.json
│
├── frontend/                      # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/            # UI components (Card, Button, Modal, Badge, etc.)
│   │   ├── contexts/              # AuthContext & state providers
│   │   ├── layouts/               # StudentLayout with organized sections
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # 8-section student-only homepage
│   │   │   ├── auth/              # Login & Registration pages
│   │   │   └── student/           # Student Dashboard, Insights, Profile, Career, Academics
│   │   ├── routes/                # Application route definitions & guards
│   │   └── services/              # Axios API service clients
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/                          # Architecture, PRD, and technical specifications
├── PROJECT_STATE.md               # Continuous product state tracker
├── docker-compose.yml             # Container orchestration
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **PostgreSQL**: v14.0 or later (running locally or via Docker)

---

### 1. Clone the Repository
```bash
git clone https://github.com/bhamaresandip28-ux/Career360.git
cd Career360
```

---

### 2. Backend Setup & Configuration

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/career360?schema=public"
   JWT_ACCESS_SECRET="your-super-secret-jwt-access-key"
   JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key"
   CLIENT_URL="http://localhost:5173"
   ```

3. Run Prisma migrations & generate the client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Seed initial database records:
   ```bash
   node seed.local.js
   node seed_career.js
   node seed_historical_placements.js
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

---

### 3. Frontend Setup & Configuration

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Student** (Full Profile) | `rahul.sharma@career360.dev` | `Student@1234` |
| **Student** (High Performer) | `priya.patel@career360.dev` | `Student@1234` |
| **Faculty / Mentor** | `dr.rao@career360.dev` | `Faculty@1234` |
| **Placement Coordinator**| `coordinator@career360.dev`| `Coord@1234` |
| **System Administrator** | `admin@career360.dev` | `Admin@1234` |

---

## 📡 Core API Endpoints

### Authentication & Users
- `POST /api/v1/auth/login` — Authenticate and issue tokens
- `POST /api/v1/auth/refresh` — Silent session refresh via HTTP-only cookie
- `POST /api/v1/auth/logout` — Invalidate session
- `GET  /api/v1/users/me` — Current authenticated user profile

### Placement Insights (Public / Student)
- `GET /api/v1/insights/overview` — Historical overview KPIs (filters: year, dept, role)
- `GET /api/v1/insights/companies` — Company-wise breakdown with packages & roles
- `GET /api/v1/insights/skills` — Placed student skill frequency analysis
- `GET /api/v1/insights/skill-to-company` — Tech stack to recruiting partner mapping
- `GET /api/v1/insights/trends` — Multi-year placement & compensation progression
- `GET /api/v1/insights/compare` — Compare authenticated student profile with historical benchmarks

### Career Intelligence & Preparation
- `GET /api/v1/career/roles` — Industry target role benchmarks
- `GET /api/v1/career/readiness` — Computed student readiness score & skill gap
- `GET /api/v1/career/roadmap` — Structured semester career milestone roadmap
- `GET /api/v1/career/preparation` — Technical preparation topics & practice challenges

### Student Data & Academics
- `GET /api/v1/students/profile` — Student profile and completeness metrics
- `GET /api/v1/students/skills` — Student skill catalog
- `GET /api/v1/students/projects` — Engineering project portfolio
- `GET /api/v1/academics/summary` — CGPA, SGPA, credits, and backlog status
- `GET /api/v1/reports/student-cv` — Verified Placement CV generator
- `GET /api/v1/reports/transcript` — Official university academic transcript

---

## 🛡️ Security & Quality Standards
- **Zero Exposed Secrets**: All sensitive tokens and credentials managed via `.env`.
- **SQL Injection Prevention**: Safe, parameterized queries via Prisma ORM.
- **XSS & CSRF Hardened**: In-memory access tokens, HTTP-only SameSite refresh cookies, and Helmet headers.
- **Rate Limiting**: Protected endpoints prevent automated brute-force attempts.
- **Comprehensive Audit Logging**: Sensitive system operations tracked with user context and timestamps.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
