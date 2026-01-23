# Product Requirements Document (PRD)

## 1. Overview
**Product Name:** SmartOps
**Version:** 2.0
**Date:** 2026-01-05

## 2. Purpose
A data-driven military operational process platform supporting the full planning cycle from capacity planning through assessment, aligned with NATO COPD (Comprehensive Operations Planning Directive). Designed for single-nation training and simulation with unclassified/mock data.

## 3. Goals
- Build a foundation that supports multiple services
- Implement robust authentication and authorization (ABAC)
- Support military operational planning lifecycle (COPD-aligned)
- Enable training scenarios with realistic data simulation
- Provide role-based access for HQ staff sections
- Track uncertainty and information quality for decision traceability
- Enable impact analysis when assumptions change
- Create a Digital Twin state engine for predictive analysis and wargaming
- Enable Multi-Domain Operations (MDO) synchronization across 5 domains
- Detect and prevent insider threats via behavioral analytics (UBA)
- Support Table-Top Exercises (TTX) with time dilation and event injection
- Model environmental impacts (Weather) on operational capabilities
- **Fuse disparate data sources to reduce noise and discover insights**

## 4. Technical Stack
- **Backend:** Rust with Axum framework
- **Database:** SQLite (with potential for PostgreSQL migration)
- **Frontend:** React with Vite and TanStack Router
- **Authentication:** JWT with refresh tokens, ABAC
- **Testing:** Playwright (E2E), Rust test framework (unit/integration)

## 5. Architecture
### Feature-Based Architecture
Both frontend and backend will use feature-based organization:
- `backend/src/features/{feature_name}/`
- `frontend/src/features/{feature_name}/`

### Core Features
1. **Authentication & Authorization**
   - User registration and login
   - JWT token management with ABAC
   - Role-based access for HQ staff sections

2. **Military Operations Modules** (COPD-aligned)
   - Capacity Planning (J5)
   - Projects & Procurement (J5/J8)
   - Inventory Management (J4)
   - Campaign Planning & Operational Design (J3/J5)
   - Pre-Approved Plans (J3/J5)
   - Targeting (Targeting Cell, J2/J3)
   - Assessment (Assessment Cell)

3. **Ontology Layer**
   - Core C2 Ontology (OWL 2)
   - Domain ontologies: Military Organization, Operational Design, Targeting, Assessment
   - Knowledge Graph with SPARQL queries
   - Relational ↔ Graph data sync

4. **AI Capabilities**
   - LLM integration (Ollama/OpenAI/Azure)
   - CoA generation and risk analysis
   - Target nomination suggestions
   - Natural language knowledge queries
   - Lessons learned extraction (NLP)

5. **Uncertainty & Information Quality** 🆕
   - Assumption registry and tracking
   - Information quality metadata (NATO STANAG)
   - Decision dependency graph
   - Impact analysis when assumptions fail
   - Confidence scoring for plans and decisions

6. **Operational Digital Twin** 🆕
   - Event-sourced state engine (Past, Present, Future)
   - 3D Geospatial visualization
   - Simulation branching for "What-If" analysis
   - Real-time logical network graphs (Supply, C2)

7. **Multi-Domain Operations (MDO)** 🆕
   - 5-Domain Synchronization Matrix (Land, Sea, Air, Space, Cyber)
   - "Any-Sensor, Best-Shooter" recommendation engine
   - Effect-based planning (Kinetic vs. Non-Kinetic)
   - Target Systems Analysis (TSA) integration

8. **Counter-Intelligence & Security** 🆕
   - User Behavior Analytics (UBA) & Anomaly Detection
   - Canary Tokens (Honeytokens) for leak detection
   - Dynamic "Need-to-Know" access enforcement
   - Digital Watermarking on exports

9. **Simulation & Environment** 🆕
   - **EXCON**: "God Mode," MSEL Injection, Time Dilation (Table-Top Mode)
   - **Weather**: Real-time feeds, sensor degradation modeling, mobility impact

10. **Data Fusion** 🆕
   - JDL Level 1-3 Fusion Engine (Tracking, Aggregation, Intent)
   - Multi-INT Correlation (SIGINT + IMINT + HUMINT)
   - Automated Entity Resolution
   - Track Lineage & Provenance

11. **Advisory & Governance (LEGAD/POLAD)** 🆕
    - Legal (LEGAD) & Political (POLAD) advisory integration
    - LOAC/Rules of Engagement (ROE) compliance checking
    - Specialized advisory review workflows for Targeting and Decision Boards
    - Ethical impact assessment for non-kinetic effects

12. **A2/AD Strategic Planning** 🆕
    - Anti-Access/Area Denial (A2/AD) bubble visualization
    - Strategic "Bubble Breaking" phase planning
    - Multi-domain entry/exit point simulation
    - Scenario-based option generation for contested environments

13. **Cognitive Triage & Sensor Management** 🆕
    - "Triage Mode" for high-intensity sensor saturation
    - Automated decoy detection and signal/noise resolution
    - Priority-based cognitive load shedding for operators
    - Adversarial deception analysis (A2A - Anti-Adversarial Analytics)

14. **Dashboard & Navigation**
   - Staff section views
   - Operational status overview
   - Cross-module navigation

## 6. Target Users
| Role | Primary Modules |
|------|-----------------|
| J2 (Intelligence) | Targeting, RxP, Triage |
| J3 (Operations) | Campaign, Plans, Targeting, A2/AD |
| J3-5 (Plans) | Campaign, Plans, A2/AD |
| J5 (Strategic Plans) | Capacity, Projects, Campaign, Plans, A2/AD |
| Targeting Cell | Targeting (full access), Advisory Review |
| Assessment Cell | Assessment (full access) |
| LEGAD / POLAD | Advisory Review, ROE, Decision Board |

## 7. Current State (2026-01-05)

### Platform Status
The SmartOps platform has completed its frontend mocking phase. All 20 operational modules have working UI with mock data services. The sidebar has been reorganized into 7 logical groups aligned with military staff functions.

### Completed Capabilities
| Area | Status |
|:---|:---|
| Authentication (JWT/RS256) | ✅ Production-ready |
| ABAC (Roles, Permissions) | ✅ Production-ready |
| Admin Dashboard | ✅ Production-ready |
| System Metrics | ✅ Production-ready |
| SmartOps UI (20 modules) | ✅ Mocked with sample data |

### Current Priority
**Phase 2: Backend Integration** - Connect existing frontend mocks to real Rust backend services, starting with the C2 Workflow Engine (Proposals) and Data Quality (Uncertainty) foundation.

---

## 8. Development Process

### MVP Phases
1. **MVP 1: Core Infrastructure** ✅
   - Project structure, authentication, ABAC, database

2. **MVP 2: Feature Development** ✅
   - Dashboard, admin, user management, real-time metrics

3. **MVP 3: SmartOps Frontend Mocking** ✅
   - All 20 operational modules with mock data
   - Sidebar reorganized into 7 logical groups

4. **MVP 4: Backend Integration** (Current)
   - Connect mocks to real Rust APIs
   - C2 Workflow Engine
   - Data Quality / Uncertainty foundation

5. **MVP 5: Connective Tissue**
   - Ontology Layer
   - Digital Twin State Engine
   - Data Fusion

6. **MVP 6: Advanced Capabilities**
   - MDO Reasoning Engine
   - AI-Assisted Planning
   - Simulation / EXCON

7. **MVP 7: Hardening & Scale**
   - Security Module (CI) full implementation
   - Performance optimization
   - CI/CD and deployment

## 9. Testing Strategy
- **Unit Tests:** Individual components and functions
- **Integration Tests:** Feature interactions, cross-module workflows
- **E2E Tests:** Military planning user flows with Playwright
- **Scenario Tests:** Full operational cycle validation

## 10. Security Requirements
- Secure JWT implementation with ABAC
- Role-based module access
- Input validation
- Rate limiting
- Audit logging for sensitive operations

## 11. Success Metrics
- 100% of planned modules implemented
- Complete operational cycle coverage (capacity → assessment)
- Role-based access correctly enforced
- Simulation data supports training scenarios
