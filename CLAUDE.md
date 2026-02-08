# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Build & Run

**Backend (Rust/Axum):**
```bash
cd backend
cargo run          # Start backend server on port 3000
cargo build        # Build release version
cargo test         # Run Rust tests
```

**Frontend (React/TypeScript/Vite):**
```bash
cd frontend
npm run dev        # Start dev server on port 5173
npm run build      # Build for production
npm run preview    # Preview production build
```

**Docker (Full Stack):**
```bash
docker-compose up --build  # Start both backend and frontend
```

### Testing

**Playwright E2E Tests:**
```bash
cd frontend
npx playwright test           # Run all tests
npx playwright test --ui      # Run with UI
npx playwright test path/to/specific.spec.ts  # Run single test file
```

**Unit Tests:**
```bash
cd frontend
npm run test        # Run vitest unit tests
```

**Integration Testing:**
```bash
./test_integration.sh  # Test API endpoints with authentication
```

## Architecture Overview

### Modular Cargo Workspace

The project uses a **Cargo workspace** with 6 module groups containing 18 crates. The `backend/` binary imports from independent crates in `modules/`.

**Tech Stack:** Rust, Axum 0.7, SQLx 0.8 (SQLite), JWT/RSA Authentication

```
plan-target-assessment/              # Root Cargo workspace
├── backend/                         # Main server binary
│   ├── src/
│   │   ├── main.rs                  # Entry point, router setup
│   │   ├── config/                  # Configuration module
│   │   ├── middleware/              # Auth, CSRF, ABAC middleware
│   │   └── utils/                   # JWT key generation & rotation
│   ├── migrations/                  # 42 SQLite migration files
│   ├── data/app.db                  # SQLite database
│   ├── keys/                        # JWT RSA keys (auto-generated)
│   └── config/default.toml          # Default configuration
│
└── modules/
    ├── bcknd-ctrl/crates/           # Core framework
    │   ├── core-auth                # JWT auth, sessions, refresh tokens
    │   ├── core-users               # User CRUD, roles
    │   ├── core-abac                # Attribute-based access control
    │   ├── core-ontology            # Entity/relationship graph model
    │   ├── core-system              # System operations
    │   ├── core-discovery           # API discovery
    │   ├── core-rate-limit          # Rate limiting (Tower Governor)
    │   ├── core-common-types        # Shared type definitions
    │   └── core-server              # HTTP server utilities
    ├── trgtn-ctrl/crates/           # Targeting domain
    │   ├── targeting                # Target management, JTB, DTL, realtime
    │   ├── bda                      # Battle Damage Assessment
    │   ├── roe                      # Rules of Engagement
    │   └── targeting-server         # Server integration
    ├── c2-ctrl/crates/              # Command & Control
    │   ├── meetings                 # Meeting scheduling
    │   ├── decisions                # Decision tracking
    │   └── c2-server                # C2 server integration
    ├── strtgy-ctrl/crates/          # Strategy
    │   ├── strategy                 # Strategic planning & intent
    │   └── strategy-server          # Server integration
    ├── plnng-ctrl/crates/           # Planning
    │   ├── assumptions              # Assumption management
    │   └── planning-server          # Server integration
    └── admn-ctrl/crates/            # Administration
        ├── admn-server              # Admin API server
        ├── admn-users               # User administration
        ├── admn-abac                # Admin ABAC
        ├── admn-system              # System admin
        └── admn-rate-limit          # Admin rate limits
```

**Key Components:**
- **Axum Router**: Feature-nested routing with middleware layers (auth, CSRF, ABAC)
- **SQLx Database**: SQLite with connection pooling, 42 migration files
- **JWT Authentication**: RSA-based token system with 90-day key rotation
- **Middleware Stack**: CookieManager → CORS → Auth → CSRF → Feature Routes

### Frontend Architecture

**Tech Stack:** React 19, TypeScript 5.7, Vite 7, TanStack Router, Tailwind CSS 4

**Feature-Based Component Structure:**
```
frontend/src/
├── features/              # 20 feature modules
│   ├── targeting/         # NATO COPD Targeting Cell UI
│   ├── bda/               # Battle Damage Assessment UI
│   ├── intelligence/      # Intelligence Management (RFI, TOR)
│   ├── operations/        # Operations Dashboard
│   ├── planning/          # Campaign Planning
│   ├── decisions/         # Decision Tracking
│   ├── admin/             # Administration Panels
│   ├── shared/            # Shared Components & Services
│   ├── auth/              # Authentication Components
│   ├── layout/            # Layout Components (sidebar, nav)
│   ├── cockpit/           # Operational Cockpit
│   ├── dashboard/         # IM Dashboard
│   ├── roe/               # ROE Management
│   ├── legal/             # Legal/Compliance
│   ├── logistics/         # Supply Chain (mock)
│   └── ...                # Additional modules
├── components/            # UI primitives (Radix-based)
├── lib/
│   └── mshnctrl/
│       ├── types.ts       # Comprehensive ontology-first type system
│       ├── api/           # API clients (bda, targeting, roe)
│       ├── services/      # Business logic services
│       └── hooks/         # Custom React hooks
├── routes/                # TanStack Router file-based routes
└── styles/                # CSS & Tailwind config
```

**Key Components:**
- **TanStack Router**: File-based routing under `/mshnctrl/*`
- **Ontology-First Types**: `frontend/src/lib/mshnctrl/types.ts` matches backend entity model
- **Vite Proxy**: `/api` requests proxied to backend on port 3000
- **UI**: Radix primitives, Recharts, Framer Motion, Lucide icons

## Navigation & Routing

### Backend API Structure

**Base URL:** `http://localhost:3000/api/`

**API Routes (from main.rs):**

| Route | Crate | Auth | Description |
|-------|-------|------|-------------|
| `/api/health` | built-in | No | Health check |
| `/api/auth/*` | core-auth | Mixed | Login (public), logout/refresh (protected) |
| `/api/users/*` | core-users | Yes | User management CRUD |
| `/api/abac/*` | core-abac | Yes | Access control management |
| `/api/ontology/*` | core-ontology | Yes | Entity/relationship graph |
| `/api/system/*` | core-system | Yes | System operations |
| `/api/discovery/*` | core-discovery | No | API discovery |
| `/api/rate-limits/*` | core-rate-limit | Yes | Rate limit management |
| `/api/targeting/*` | targeting | Yes | NATO COPD targeting cell |
| `/api/bda/*` | bda | Yes | Battle damage assessment |
| `/api/roe/*` | roe | Yes | Rules of engagement |
| `/api/operations/*` | meetings | Yes | Operations & meetings |
| `/api/assumptions/*` | assumptions | Yes | Assumption management |
| `/api/strategy/*` | strategy | Yes | Strategic planning |
| `/api/c2/*` | c2-server | Yes | Command & control |
| `/api/admin/*` | admn-server | Yes | Administration |

### Frontend Route Structure

**Base URL:** `http://localhost:5173/`

**Main Route Groups (TanStack Router, file-based):**
- `/mshnctrl/` - Main dashboard
- `/mshnctrl/targeting-cell-dashboard` - Targeting Cell Dashboard
- `/mshnctrl/targeting/*` - Target management (JTB, DTL, nominations, effects)
- `/mshnctrl/bda/*` - BDA Workbench (reports, create)
- `/mshnctrl/information-management` - IM Dashboard
- `/mshnctrl/rfis` - RFI Management
- `/mshnctrl/roe` - Rules of Engagement
- `/mshnctrl/decision-board` - Decision Board
- `/mshnctrl/assumptions` - Assumptions Management
- `/mshnctrl/strategic-direction` - Strategic Direction
- `/mshnctrl/logistics` - Logistics (mock)
- `/mshnctrl/j2-dashboard` through `/mshnctrl/j5-dashboard` - Staff dashboards
- `/admin/*` - Administration panels
- `/login` - Authentication

## Development Workflow

### Adding a New Backend Feature (Crate)

```bash
# 1. Create new crate in the appropriate module
cargo init modules/<module>-ctrl/crates/<feature-name> --lib

# 2. Add to root Cargo.toml workspace members
# 3. Add as dependency in backend/Cargo.toml
# 4. Implement domain models, handlers, routes (expose via lib.rs)
# 5. Wire into backend/src/main.rs router with middleware
```

### Adding a New Frontend Feature

```bash
# 1. Create feature directory
mkdir -p frontend/src/features/new_feature

# 2. Add component files (Component.tsx, hooks/, services/)
# 3. Create route file: frontend/src/routes/mshnctrl.new-feature.tsx
# 4. Add API client in frontend/src/lib/mshnctrl/api/
```

### Database Migrations

```bash
# Create new migration file (timestamp-based naming)
# Format: YYYYMMDDHHMMSS_description.sql
touch backend/migrations/20260208120000_add_new_table.sql

# Migrations run automatically on backend startup
# Or manually: cd backend && sqlx migrate run
```

### Debugging Tips

**Backend:**
```bash
RUST_LOG=debug cargo run             # Verbose logging
sqlite3 backend/data/app.db          # Direct DB access
```

**Frontend:**
```bash
npm run dev                          # Dev server with HMR
# Browser devtools → Network tab    # API request inspection
```

## Key Files & Directories

### Backend
- `backend/src/main.rs` - Entry point, config loading, router assembly
- `backend/src/middleware/auth.rs` - JWT auth middleware
- `backend/src/middleware/csrf.rs` - CSRF protection
- `backend/src/utils/jwt_keys.rs` - JWT key generation
- `backend/src/utils/key_rotation.rs` - Key rotation logic
- `backend/src/config/` - Configuration (default.toml fallback)
- `backend/migrations/` - 42 SQLite migration scripts
- `backend/data/app.db` - SQLite database

### Modules (Backend Crates)
- `modules/bcknd-ctrl/crates/core-ontology/` - Central ontology model
- `modules/bcknd-ctrl/crates/core-auth/` - Auth framework
- `modules/trgtn-ctrl/crates/targeting/` - Targeting handlers
- `modules/trgtn-ctrl/crates/bda/` - BDA handlers
- `modules/trgtn-ctrl/crates/roe/` - ROE engine

### Frontend
- `frontend/src/main.tsx` - App bootstrap
- `frontend/src/lib/mshnctrl/types.ts` - Comprehensive type system
- `frontend/src/features/` - All feature UI modules
- `frontend/src/routes/` - TanStack Router route files
- `frontend/vite.config.ts` - Vite config (proxy, build splits)

### Documentation
- `docs/REALITY_CHECK.md` - Authoritative feature status
- `docs/bda/BDA_MASTER_GUIDE.md` - BDA entry point
- `docs/INDEX.md` - Master documentation index
- `docs/scenarios/` - 9 military usage scenarios

## Authentication & Security

### JWT Authentication
- **Keys**: RSA, auto-generated in `backend/keys/`
- **Rotation**: Every 90 days automatic
- **Storage**: HTTP-only cookies
- **Middleware**: `backend/src/middleware/auth.rs`
- **Config**: `backend/config/default.toml` (jwt_expiry: 3600s, refresh: 86400s)

### Access Control
- **ABAC**: Attribute-Based Access Control (core-abac crate)
- **CSRF**: Cross-Site Request Forgery protection middleware
- **Rate Limiting**: Tower Governor integration (core-rate-limit crate)

## Testing Strategy

### Running Tests
```bash
# Backend unit tests
cd backend && cargo test

# Frontend unit tests
cd frontend && npm run test

# E2E tests (requires running backend + frontend)
cd frontend && npx playwright test

# Specific E2E test
cd frontend && npx playwright test tests/targeting-workbench-integration.spec.ts

# Integration tests (API-level)
./test_integration.sh
```

### Test Data
- Test users: Created via migrations and seed scripts
- Test credentials: `targeting_cell@test.mil` / `TargetingCell2026!`

## Deployment

### Docker Deployment
```bash
docker-compose up --build    # Build and start
docker-compose down          # Stop
docker-compose logs -f       # View logs
```

### Environment Variables
**Backend:**
- `DATABASE_URL`: SQLite connection string (default: `sqlite:data/app.db`)
- `RUST_LOG`: Logging level (info, debug, trace)
- `JWT_SECRET`, `JWT_EXPIRY`, `REFRESH_TOKEN_EXPIRY`: JWT config

**Frontend:**
- `VITE_API_URL`: Backend API base URL (default: `http://localhost:3000`)

## CI/CD

**Current Status:** CI is intentionally disabled (see `.github/workflows/ci-disabled.yml`)

**Local Testing Only:** All testing must pass locally before considering features complete.

## Code Style & Conventions

### Backend (Rust)
- Modular crate architecture in `modules/`
- Domain-driven design within each crate
- Error handling with `thiserror` and `anyhow`
- Async/await with Tokio
- Workspace-level dependency management

### Frontend (TypeScript)
- Functional components with hooks
- Ontology-first type system (matches backend entity model)
- TanStack Router for file-based navigation
- Tailwind CSS 4 for styling
- Radix UI for accessible primitives

## Important Notes

1. **CI Disabled**: All testing must be done locally
2. **Feature Flags**: None - all features are always enabled
3. **Database**: SQLite file-based (`backend/data/app.db`), no separate server
4. **Authentication**: JWT with auto-generated RSA keys
5. **Ports**: Backend: 3000, Frontend: 5173
6. **Frontend Proxy**: Vite proxies `/api` to backend automatically
7. **Branch**: Current work is on `carve-out` branch (modular extraction)

## Quick Development Cycle

```bash
# Terminal 1: Backend
cd backend && cargo run

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Testing
cd frontend && npx playwright test --ui
```

Then open:
- Dashboard: `http://localhost:5173/mshnctrl/`
- Targeting: `http://localhost:5173/mshnctrl/targeting-cell-dashboard`
- Health: `http://localhost:3000/api/health`
