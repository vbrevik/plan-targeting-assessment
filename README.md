# MshnCtrl - Military C2 Dashboard

> **Formerly**: SmartOps, Plan-Target-Assessment  
> **Status**: Active Development  
> **Last Updated**: 2026-01-31

## Quick Start

```bash
# Backend (Rust/Axum on port 3000)
cd backend && cargo run

# Frontend (React/Vite on port 5173)
cd frontend && npm run dev
```

**Access**: http://localhost:5173/mshnctrl/

---

## 🎯 Production-Ready Features

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| **Authentication** | ✅ JWT | ✅ Login | ✅ Production |
| **User Management** | ✅ CRUD | ✅ Admin Panel | ✅ Production |
| **ABAC Permissions** | ✅ Full | ✅ Role-based nav | ✅ Production |
| **Rate Limiting** | ✅ Tower | N/A | ✅ Production |
| **BDA Reports** | ✅ Full CRUD | ✅ Forms, Lists | ✅ Ready |
| **BDA Annotations** | ✅ API | ✅ Image Annotator | ⚠️ Testing |
| **Targeting Cell** | ✅ Substantial | ✅ 12 components | ⚠️ Testing |
| **Ontology/IM** | ✅ CRUD | ✅ Dashboard | ⚠️ MVP |

## ⚠️ Development Features (Mock Data)

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| Decision System | ❌ | ✅ Mock | Backend not started |
| Battle Rhythm | ❌ | ❌ | Docs exist, no code |
| Meeting Agendas | ❌ | ❌ | Not started |
| Planning Modules | ⚠️ Scaffold | ✅ Mock | CONOPS, COA |
| Logistics | ⚠️ Scaffold | ✅ Mock | Supply, Convoy |
| ROE Management | ⚠️ Partial | ✅ Complete | Integration needed |

---

## Project Structure

```
mshnctrl/
├── backend/                 # Rust (Axum, SQLx, SQLite)
│   └── src/features/
│       ├── auth/           # JWT authentication
│       ├── abac/           # Permission system
│       ├── targeting/      # NATO COPD targeting (27 files)
│       ├── bda/            # Battle Damage Assessment (35 files)
│       ├── roe/            # Rules of Engagement (14 files)
│       ├── ontology/       # Entity/relationship management
│       └── ...
├── frontend/               # React 19 + TypeScript + Vite
│   └── src/
│       ├── features/       # Feature components
│       │   ├── targeting/  # 12 targeting components
│       │   ├── bda/        # 14 BDA components
│       │   ├── decisions/  # 9 decision components (mock)
│       │   └── ...
│       ├── routes/         # TanStack Router (102+ routes)
│       └── lib/            # Shared services, types
└── docs/                   # Documentation (80+ files)
```

---

## Key Routes

| Route | Purpose |
|-------|---------|
| `/mshnctrl/` | Main dashboard |
| `/mshnctrl/targeting-cell-dashboard` | NATO COPD targeting |
| `/mshnctrl/bda` | Battle Damage Assessment |
| `/mshnctrl/information-management` | IM ontology dashboard |
| `/mshnctrl/ontology` | Ontology manager |
| `/admin/` | Admin panels (ABAC, Users) |

> **Note**: Routes changed from `/smartops/` to `/mshnctrl/`

---

## Technology Stack

**Backend**: Rust, Axum, SQLx, SQLite, JWT  
**Frontend**: React 19, TypeScript, Vite, TanStack Router, Tailwind  
**Testing**: Playwright (E2E), Vitest (unit)

---

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development guide.

```bash
# Run backend with debug logging
cd backend && RUST_LOG=debug cargo run

# Run frontend
cd frontend && npm run dev

# Run E2E tests
cd frontend && npx playwright test
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/START_HERE_DECISION_SYSTEM.md` | Entry point |
| `docs/bda/BDA_MASTER_GUIDE.md` | BDA workbench guide |
| `docs/BACKLOG.md` | Feature backlog (Agile) |
| `docs/REALITY_CHECK.md` | Honest feature assessment |
| `docs/ports.md` | Port configuration |

**Archived**: 53+ legacy docs in `docs/ARCHIVE/legacy/`

---

## Current Focus

1. **BDA Phase 2**: Weaponeering integration
2. **ROE Backend**: Complete integration
3. **Targeting Polish**: Testing and refinement

---

_Version 3.0 - 2026-01-31_
