# MshnCtrl - Military C2 Dashboard

> **MshnCtrl** is a modern Command & Control (C2) dashboard system designed for high-stakes military operations, focusing on Targeting Cell workflows, Battle Damage Assessment (BDA), and Ontology-driven Information Management.

## The Honest Reality (Project Status)

This project contains a mix of production-ready features, substantial proofs-of-concept, and exploratory mock-ups. We prioritize transparency over marketing. See `docs/REALITY_CHECK.md` for the authoritative status.

### Production Ready (Functional & Integrated)
These features have functional backend APIs, frontend UI, and have passed integration testing.
- **Auth & Access**: JWT-based authentication (RSA, 90-day key rotation) with refresh tokens, ABAC permission system, and rate limiting.
- **User Management**: Full CRUD for users with administrative controls.
- **BDA Workbench**: Report lifecycle management, component assessments, peer review, and image annotation (Phases 0, 1, 4 complete).
- **Ontology/IM**: Graph-based entity/relationship management for Information Management (RFI/Tasks).
- **Administration**: User admin, system admin, ABAC management via dedicated admin module.

### Substantial (Code Exists, Needs Refinement)
- **Targeting Cell**: Extensive frontend components (JTB, CDE, DTL, Nominations, Strike Optimizer) with substantial backend handlers. Some endpoints still utilize mock data while integration stabilizes.
- **ROE Management**: Fully designed frontend with a comprehensive backend module; final wiring/integration is currently in progress.
- **Strategy Module**: Strategic planning and intent management with backend service.
- **BDA Phase 2**: Weaponeering performance validation in progress.

### High-Fidelity Mocks (Frontend Only)
These modules provide a visual implementation of the workflow but **do not have a backend implementation**.
- **Decision System**: Visual dashboard and components for decision tracking and battle rhythm.
- **Planning Modules**: Scaffolding for CONOPS builders, COA wargaming, and Campaign planning.
- **Logistics**: Visual tracking for supply, convoys, and readiness.
- **Digital Twin / MDO**: Multi-domain operations visualization.

---

## Architecture

### Modular Rust Workspace

The backend is organized as a Cargo workspace with **6 module groups** containing **18 independent crates**:

```
plan-target-assessment/           # Root workspace
├── backend/                      # Main server binary (Axum)
└── modules/
    ├── bcknd-ctrl/               # Core framework (9 crates)
    │   └── crates/
    │       ├── core-auth          # JWT authentication, sessions
    │       ├── core-users         # User management
    │       ├── core-abac          # Attribute-based access control
    │       ├── core-ontology      # Entity/relationship graph
    │       ├── core-system        # System operations
    │       ├── core-discovery     # API discovery
    │       ├── core-rate-limit    # Rate limiting
    │       ├── core-common-types  # Shared type definitions
    │       └── core-server        # HTTP server utilities
    ├── trgtn-ctrl/               # Targeting domain (4 crates)
    │   └── crates/
    │       ├── targeting          # Target management, JTB, DTL
    │       ├── bda                # Battle Damage Assessment
    │       ├── roe                # Rules of Engagement
    │       └── targeting-server   # Server integration
    ├── c2-ctrl/                  # Command & Control (3 crates)
    │   └── crates/
    │       ├── meetings           # Meeting scheduling
    │       ├── decisions          # Decision tracking
    │       └── c2-server          # C2 server integration
    ├── strtgy-ctrl/              # Strategy (2 crates)
    │   └── crates/
    │       ├── strategy           # Strategic planning & intent
    │       └── strategy-server    # Server integration
    ├── plnng-ctrl/               # Planning (2 crates)
    │   └── crates/
    │       ├── assumptions        # Assumption management
    │       └── planning-server    # Server integration
    └── admn-ctrl/                # Administration (5 crates)
        └── crates/
            ├── admn-server        # Admin API server
            ├── admn-users         # User administration
            ├── admn-abac          # Admin ABAC
            ├── admn-system        # System admin
            └── admn-rate-limit    # Admin rate limits
```

### Frontend (React 19 + TypeScript)

```
frontend/src/features/           # 20 feature modules
├── targeting/                   # NATO COPD Targeting Cell
├── bda/                         # Battle Damage Assessment
├── intelligence/                # Intelligence Management
├── operations/                  # Operations Dashboard
├── planning/                    # Campaign Planning
├── decisions/                   # Decision Tracking
├── admin/                       # Administration
├── shared/                      # Shared Components
├── auth/                        # Authentication
├── layout/                      # Layout Components
├── cockpit/                     # Operational Cockpit
├── dashboard/                   # IM Dashboard
├── roe/                         # ROE Management
├── legal/                       # Legal/Compliance
├── logistics/                   # Supply Chain
└── ...                          # Additional modules
```

### API Routes

All backend APIs are served under `/api/`:

| Route | Module | Description |
|-------|--------|-------------|
| `/api/health` | core | Health check |
| `/api/auth/*` | core-auth | Authentication (login, refresh, logout) |
| `/api/users/*` | core-users | User management |
| `/api/abac/*` | core-abac | Access control |
| `/api/ontology/*` | core-ontology | Entity/relationship management |
| `/api/system/*` | core-system | System operations |
| `/api/discovery/*` | core-discovery | API discovery |
| `/api/rate-limits/*` | core-rate-limit | Rate limit management |
| `/api/targeting/*` | targeting | NATO COPD targeting |
| `/api/bda/*` | bda | Battle damage assessment |
| `/api/roe/*` | roe | Rules of engagement |
| `/api/operations/*` | meetings | Operations & meetings |
| `/api/assumptions/*` | assumptions | Assumption management |
| `/api/strategy/*` | strategy | Strategic planning |
| `/api/c2/*` | c2-server | Command & control |
| `/api/admin/*` | admn-server | Administration |

---

## Getting Started

### Prerequisites
- **Rust**: 1.75+ for backend
- **Node.js**: 20+ (with npm) for frontend

### Run the System
```bash
# 1. Start Backend (Port 3000)
cd backend && cargo run

# 2. Start Frontend (Port 5173)
cd frontend && npm run dev
```

**Access**: [http://localhost:5173/mshnctrl/](http://localhost:5173/mshnctrl/)

### Docker
```bash
docker-compose up --build    # Start both services
```

---

## Technology Stack

- **Backend**: Rust (Axum 0.7, SQLx 0.8, SQLite, JWT/RSA)
- **Frontend**: React 19 (TypeScript 5.7, Vite 7, TanStack Router, Tailwind CSS 4)
- **UI**: Radix UI primitives, Recharts, Framer Motion, Lucide icons
- **Security**: ABAC, Rate Limiting (Tower Governor), CSRF protection
- **Testing**: Playwright (E2E), Vitest (Unit), Cargo test (Rust)

---

## Documentation

| Directory | Purpose |
|-----------|---------|
| `docs/` | Current system documentation and architecture |
| `docs/bda/` | Consolidated guides for the BDA Workbench |
| `docs/scenarios/` | 9 realistic military usage scenarios |
| `docs/REALITY_CHECK.md` | Authoritative feature status (ground truth) |
| `docs/ARCHIVE/` | History of the project and legacy designs |

---

## Current Roadmap
1. **BDA Phase 2 Integration**: Finalizing weaponeering performance validation.
2. **ROE Stabilization**: Completing the bridge between frontend and backend handler.
3. **Targeting Maturity**: Transitioning mock endpoints to live ontology-backed data.
4. **Decision System Backend**: Implementing backend for decision tracking.

---

_Project Version: 0.1.1_
_Last Updated: 2026-02-08_
