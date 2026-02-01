# START HERE: MshnCtrl Development

## 🎯 System Overview

**MshnCtrl** is a military C2 dashboard system focused on:
- Targeting Cell operations (NATO COPD)
- Battle Damage Assessment (BDA)
- Information Management (Ontology-based)

## ⚡ Current Status (2026-01-31)

### ✅ Production Ready
- **Auth/ABAC/Users**: Complete
- **BDA Workbench**: Phase 0, 1, 4 complete (70% overall)
- **Targeting Cell**: Substantial (12 components)
- **IM Dashboard**: MVP with ontology backend

### ⚠️ In Development
- **BDA Phase 2**: Weaponeering integration
- **ROE Management**: Backend integration needed

### 🔴 Not Started
- **Decision System Backend**: Frontend exists, no API
- **Battle Rhythm**: Documented but not built

> **Read**: [REALITY_CHECK.md](REALITY_CHECK.md) for honest feature assessment

---

## 📚 Essential Reading

### 1. Honest Assessment (5 min)
📄 **[REALITY_CHECK.md](REALITY_CHECK.md)**
- What actually works vs. what's documented
- Feature status matrix

### 2. BDA Workbench (10 min)
📄 **[bda/BDA_MASTER_GUIDE.md](bda/BDA_MASTER_GUIDE.md)**
- Current phase status
- API reference
- Implementation plan

### 3. Development Guide
📄 **[../CLAUDE.md](../CLAUDE.md)**
- Quick start commands
- Architecture overview
- Testing strategy

---

## 🚀 Getting Started

```bash
# Backend (port 3000)
cd backend && cargo run

# Frontend (port 5173)
cd frontend && npm run dev
```

**Access**: http://localhost:5173/mshnctrl/

---

## 📂 Documentation Structure

| Directory | Contents |
|-----------|----------|
| `docs/` | Current documentation |
| `docs/bda/` | BDA Workbench guides |
| `docs/scenarios/` | Use case scenarios |
| `docs/ARCHIVE/` | Historical/legacy docs |

---

## 🎯 Current Focus

1. **Complete BDA Phase 2** (Weaponeering)
2. **Fix ROE backend integration**
3. **Polish Targeting Cell**

---

_Last Updated: 2026-01-31_
_Docs Status: ✅ Cleanup Complete_
