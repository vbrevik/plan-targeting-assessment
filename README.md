# MshnCtrl - Military C2 Dashboard

> **MshnCtrl** is a modern Command & Control (C2) dashboard system designed for high-stakes military operations, focusing on Targeting Cell workflows, Battle Damage Assessment (BDA), and Ontology-driven Information Management.

## 🏗️ The Honest Reality (Project Status)

This project contains a mix of production-ready features, substantial proofs-of-concept, and exploratory mock-ups. We prioritize transparency over marketing.

### 🟢 Production Ready (Functional & Integrated)
These features have functional backend APIs, frontend UI, and have passed integration testing.
- **Auth & Access**: JWT-based authentication with refresh tokens, ABAC permission system (Action/Subject/Attribute), and rate limiting.
- **User Management**: Full CRUD for users with administrative controls.
- **BDA Workbench**: Report lifecycle management, component assessments, and image annotation.
- **Ontology/IM**: Graph-based entity/relationship management for Information Management (RFI/Tasks).

### 🟡 Substantial (Code Exists, Needs Refinement)
- **Targeting Cell**: Extensive frontend components (JTB, CDE, Nominations) with substantial backend handlers. Some endpoints still utilize mock data while integration stabilizes.
- **ROE Management**: Fully designed frontend with a comprehensive backend module; final wiring/integration is currently in progress.

### 🔴 High-Fidelity Mocks (Frontend Only)
These modules provide a visual implementation of the workflow but **do not have a backend implementation**.
- **Decision System**: Visual dashboard and components for decision tracking and battle rhythm.
- **Planning Modules**: Scaffolding for CONOPS builders, COA wargaming, and Campaign planning.
- **Logistics**: Visual tracking for supply, convoys, and readiness.

---

## 🚀 Getting Started

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

---

## 📂 Documentation Structure

| Directory | Purpose |
|-----------|---------|
| `docs/` | Current system documentation and architecture |
| `docs/bda/` | Consolidated guides for the BDA Workbench |
| `docs/scenarios/` | Realistic military usage scenarios |
| `docs/ARCHIVE/` | History of the project and legacy designs |

---

## 🌍 Technology Stack

- **Backend**: Rust (Axum, SQLx, SQLite, JWT)
- **Frontend**: React 19 (TypeScript, Vite, TanStack Router, Tailwind)
- **Security**: Attribute-Based Access Control (ABAC), Rate Limiting (Tower)
- **Testing**: Playwright (E2E Integration), Vitest/Cargo (Unit)

---

## 🎯 Current Roadmap
1. **BDA Phase 2 Integration**: Finalizing weaponeering performance validation.
2. **ROE Stabilization**: Completing the bridge between frontend and backend handler.
3. **Targeting Maturity**: Transitioning mock endpoints to live ontology-backed data.

---

_Project Version: 3.0.0-dev_  
_Last Honest Update: 2026-01-31_
