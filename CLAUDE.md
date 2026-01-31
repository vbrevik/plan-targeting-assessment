# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Quick Start Commands

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

## 🏛️ Architecture Overview

### Backend Architecture

**Tech Stack:** Rust, Axum, SQLx (SQLite), JWT Authentication

**Feature-Based Modular Structure:**
```
backend/src/features/
├── auth/              # Authentication & Authorization
├── targeting/         # NATO COPD Targeting Cell
├── bda/               # Battle Damage Assessment
├── operations/        # Operations Management
├── ontology/          # Information Management Ontology
├── abac/              # Attribute-Based Access Control
├── discovery/         # API Discovery
├── navigation/        # Dynamic Navigation
└── strategy/          # Strategic Planning
```

**Key Components:**
- **Axum Router**: Feature-nested routing with middleware (auth, CSRF, ABAC)
- **SQLx Database**: SQLite with connection pooling
- **JWT Authentication**: RSA-based token system with key rotation
- **Middleware Stack**: Auth → CSRF → ABAC → Feature Routes

### Frontend Architecture

**Tech Stack:** React 19, TypeScript, Vite, TanStack Router, Tailwind CSS

**Feature-Based Component Structure:**
```
frontend/src/features/
├── targeting/         # NATO COPD Targeting Cell UI
├── bda/               # Battle Damage Assessment UI
├── intelligence/      # Intelligence Management
├── operations/        # Operations Dashboard
├── planning/          # Campaign Planning
├── admin/             # Administration Panels
├── shared/            # Shared Components & Services
└── auth/              # Authentication Components
```

**Key Components:**
- **TanStack Router**: File-based routing system
- **React Hooks**: Custom hooks for data fetching and state management
- **TypeScript Types**: Comprehensive type system in `/lib/smartops/types.ts`
- **Mock Services**: Development mocks for API endpoints

## 🗺️ Navigation & Routing

### Backend API Structure

**Base URL:** `http://localhost:3000/api/`

**Main API Groups:**
- `/api/auth/*` - Authentication endpoints
- `/api/targeting/*` - NATO COPD Targeting Cell APIs
- `/api/bda/*` - Battle Damage Assessment APIs
- `/api/operations/*` - Operations Management APIs
- `/api/ontology/*` - Information Management APIs
- `/api/navigation/*` - Dynamic Navigation APIs
- `/api/strategy/*` - Strategic Planning APIs

### Frontend Route Structure

**Base URL:** `http://localhost:5173/`

**Main Route Groups:**
- `/smartops/targeting/*` - Targeting Cell Dashboard
- `/smartops/bda/*` - BDA Workbench
- `/smartops/operations/*` - Operations Management
- `/smartops/intelligence/*` - Intelligence Integration
- `/smartops/planning/*` - Campaign Planning

## 🔧 Development Workflow

### Common Development Tasks

**1. Add New Backend Feature:**
```bash
# Create new feature module
mkdir -p backend/src/features/new_feature/{domain,handlers,repositories,services}
# Add to main.rs router
# Implement domain models, handlers, and routes
```

**2. Add New Frontend Component:**
```bash
# Create new component
mkdir -p frontend/src/features/new_feature
# Add component files (Component.tsx, hooks/, services/)
# Add to route tree
```

**3. Database Migrations:**
```bash
# Create new migration file in backend/migrations/
# Run migrations automatically on backend startup
# Or manually: sqlx migrate run
```

### Debugging Tips

**Backend Debugging:**
```bash
# Enable detailed logging
RUST_LOG=debug cargo run

# Check database
sqlite3 backend/data/app.db
```

**Frontend Debugging:**
```bash
# Enable React devtools
npm run dev

# Check network requests
Open browser devtools → Network tab
```

## 📚 Key Files & Directories

### Backend
- `backend/src/main.rs` - Main application entry point
- `backend/src/features/` - All feature modules
- `backend/migrations/` - Database migration scripts
- `backend/data/app.db` - SQLite database
- `backend/config/` - Configuration files

### Frontend
- `frontend/src/main.tsx` - Frontend entry point
- `frontend/src/features/` - Feature components
- `frontend/src/lib/` - Shared libraries and types
- `frontend/src/routes/` - Route definitions
- `frontend/public/` - Static assets

### Documentation
- `docs/` - Comprehensive project documentation
- `docs/START_HERE_DECISION_SYSTEM.md` - Best starting point
- `docs/BDA_*.md` - Battle Damage Assessment docs
- `docs/scenarios/` - Use case scenarios

## 🎯 Feature-Specific Development

### Targeting Cell (NATO COPD)

**Backend:**
- Module: `backend/src/features/targeting/`
- Key files: `domain/mod.rs`, `handlers/*.rs`, `repositories/mod.rs`
- API endpoints: `/api/targeting/*`

**Frontend:**
- Components: `frontend/src/features/targeting/`
- Routes: `/smartops/targeting/*`
- Types: `frontend/src/lib/smartops/types.ts`

### Battle Damage Assessment (BDA)

**Backend:**
- Module: `backend/src/features/bda/`
- Key files: `domain/bda_report.rs`, `repositories/bda_repository.rs`
- API endpoints: `/api/bda/*`

**Frontend:**
- Components: `frontend/src/features/bda/`
- Routes: `/smartops/bda/*`
- Services: `frontend/src/lib/bda.ts`

## 🔐 Authentication & Security

### JWT Authentication
- Key generation: `backend/utils/jwt_keys.rs`
- Key rotation: Every 90 days
- Token storage: HTTP-only cookies
- Middleware: `backend/src/middleware/auth.rs`

### Access Control
- **ABAC**: Attribute-Based Access Control
- **RBAC**: Role-Based Access Control
- **CSRF**: Cross-Site Request Forgery protection
- **Rate Limiting**: Tower Governor integration

## 🧪 Testing Strategy

### Test Types
1. **Unit Tests**: Rust `cargo test`, JavaScript `vitest`
2. **E2E Tests**: Playwright (`*.spec.ts` files)
3. **Integration Tests**: `test_integration.sh`

### Running Tests
```bash
# Backend unit tests
cd backend && cargo test

# Frontend unit tests
cd frontend && npm run test

# E2E tests
cd frontend && npx playwright test

# Specific E2E test
cd frontend && npx playwright test tests/targeting-workbench-integration.spec.ts

# Integration tests
./test_integration.sh
```

### Test Data
- Test users: Created via `backend/scripts/create_test_user.rs`
- Test credentials: `targeting_cell@test.mil` / `TargetingCell2026!`

## 📦 Deployment

### Docker Deployment
```bash
# Build and start containers
docker-compose up --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

### Environment Variables
**Backend:**
- `DATABASE_URL`: SQLite connection string
- `RUST_LOG`: Logging level (info, debug, trace)
- `JWT_*`: JWT configuration (keys auto-generated)

**Frontend:**
- `VITE_API_URL`: Backend API base URL

## 🔄 CI/CD

**Current Status:** CI is intentionally disabled (see `.github/workflows/ci-disabled.yml`)

**Local Testing Only:** All testing must pass locally before considering features complete

## 📝 Code Style & Conventions

### Backend (Rust)
- Feature-based architecture
- Domain-driven design
- Error handling with `thiserror` and `anyhow`
- Async/await with Tokio

### Frontend (TypeScript)
- Functional components with hooks
- Explicit TypeScript types
- TanStack Router for navigation
- Tailwind CSS for styling

### Documentation
- Feature documentation in `docs/`
- Code-level documentation with `///` comments
- Migration to README when features stabilize

## 🎓 Learning Resources

### For New Developers
1. **Backend**: Study `backend/src/features/assumptions/` as reference
2. **Frontend**: Study `frontend/src/features/targeting/` components
3. **Architecture**: Read `docs/DECISION_SYSTEM_ARCHITECTURE.md`

### Key Documentation Files
- `docs/START_HERE_DECISION_SYSTEM.md` - Best starting point
- `docs/WEEK_1_IMPLEMENTATION_PLAN.md` - Implementation guide
- `docs/BDA_WORKBENCH_IMPLEMENTATION_PLAN.md` - BDA implementation
- `docs/ARCHITECTURE_COMPARISON.md` - Architecture evolution

## ⚠️ Important Notes

1. **CI Disabled**: All testing must be done locally
2. **Feature Flags**: None - all features are always enabled
3. **Database**: SQLite (file-based, no separate server needed)
4. **Authentication**: JWT with auto-generated keys
5. **Ports**: Backend: 3000, Frontend: 5173

## 🚀 Quick Development Cycle

```bash
# Terminal 1: Backend
cd backend && cargo run

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Testing
cd frontend && npx playwright test --ui
```

Then open:
- Dashboard: `http://localhost:5173/smartops/`
- API Docs: `http://localhost:3000/api/discovery`
- Targeting: `http://localhost:5173/smartops/targeting-cell-dashboard`
