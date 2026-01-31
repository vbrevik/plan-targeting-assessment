# START HERE: Decision System Implementation

## 🎯 System Overview

**MshnCtrl** (formerly SmartOpz) is a decision support system that integrates with headquarters' meeting structure and battle rhythm to streamline decision-making.

## ⚡ Current Status (2026-01-30)

- **Frontend:** ✅ Complete (100%)
- **Backend:** ✅ Phase 0 & 1 Complete (Foundation & Core Workflow)
- **BDA Workbench:** ✅ Phase 0, 1, 4 Complete (Assessment, Reporting, History)
- **Next Focus:** ⏳ BDA Phase 2 (Effects & Weaponeering)

---

## 📚 Essential Reading Path

### 1. Executive Summary (15 min)
📄 **[UPDATED_ARCHITECTURE_SUMMARY.md](UPDATED_ARCHITECTURE_SUMMARY.md)**
- Current architecture state
- Recent rebranding changes
- Integration points

### 2. BDA Workbench Guide (10 min)
📄 **[bda/BDA_MASTER_GUIDE.md](bda/BDA_MASTER_GUIDE.md)**
- **CRITICAL**: Read this if working on Targeting/Assessment
- Current phase status
- API reference links
- Implementation plan

### 3. Understanding the System (30 min)
📄 **[DECISION_SYSTEM_WITH_BATTLE_RHYTHM.md](DECISION_SYSTEM_WITH_BATTLE_RHYTHM.md)**
- Meeting structure integration
- Staff coordination workflows
- Decision routing logic

---

## 🚀 Getting Started

### For Developers
1. **Check Status**: Read `INDEX.md` for the latest document map.
2. **Review API**: See `bda/BDA_API_REFERENCE.md` for current endpoints.
3. **Run Environment**:
   ```bash
   # Backend
   cd backend && cargo run
   
   # Frontend
   cd frontend && npm run dev
   ```

### For New Features
- **Follow Standards**: See `DOCUMENTATION_STANDARDS.md` before creating docs.
- **Check Architecture**: Ensure alignment with `DECISION_SYSTEM_ARCHITECTURE.md`.

---

## 📂 Documentation Structure

- **`docs/`**: Entry points and high-level guides.
- **`docs/bda/`**: Current BDA Workbench documentation.
- **`docs/api/`**: API specifications.
- **`docs/ARCHIVE/`**: Historical logs and completed phase reports.

---

## 💡 Key Concepts

### BDA Workbench
A specialized tool for Battle Damage Assessment, fully integrated with the decision system. Currently in Phase 2 (Weaponeering).

### Battle Rhythm Integration
The system auto-routes decisions to the appropriate boards (CAB/DRB/RAB) based on urgency and authority levels.

### Role-Based Views
Dashboards are tailored for specific roles (Commander, J2, J3, J4, J5, LEGAD, IM).

---

_Last Updated: 2026-01-30_
