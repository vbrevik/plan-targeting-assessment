# SmartOps Agile Backlog

> **Agile Dashboard**: [View in Digital Twin](/smartops/digital-twin?layer=SYSTEM)
> **Current Sprint**: Sprint 1 (Foundation & Connectors)

---

## 📅 Roadmap Overview

| Sprint | Theme | Goal | Status |
|:---|:---|:---|:---|
| **Sprint 1** | Foundation & Connectors | C2 workflow backend, System Twin visibility. | Active |
| **Sprint 2** | Trusted Data Layer | Uncertainty quantization & API refactoring. | Planning |
| **Sprint 3** | Fusion & Cognitive Core | Level 1-2 Data Fusion & Local RAG deployment. | Backlog |
| **Sprint 4** | Advanced Ops (MDO) | Multi-domain sync, StratCom, and HFI Simulation. | Backlog |
| **Sprint 5** | Autonomous Sync | Prescriptive AI, ROE Shield, & Auto-RFIs. | Backlog |

---

## 🏃 Sprint 1: Foundation & Connectors (Active)

**Goal**: Connect the disparate parts of the system and establish the "Observer" loops.

### EPIC-1: Foundation & Feedback
*   **Feature: Feedback Loops Interface**
    *   [ ] **Story**: As a Planner, I want to see a "Feedback Dashboard" so I can track variances and lessons learned. `frontend` `dashboard`
    *   [ ] **Story**: As a J5 Planner, I want to see "Plan vs. Actual" variance markers on the Digital Twin timeline. `frontend` `digital-twin`
    *   [ ] **Story**: As a Developer, I want a "Feedback Event" service to route notifications between modules. `backend` `api`

*   **Feature: C2 Workflow Backbone**
    *   [ ] **Story**: As a Staff Officer, I want to save Plans/orders (CONOPS/FRAGOs) to a real database so they persist between sessions. `backend` `db`
    *   [ ] **Story**: As a Commander, I want valid state transitions (Draft -> Review -> Approved) enforced by the backend. `backend` `workflow`
    *   [ ] **Story**: As a J5, I want to persist Strategic Guidance and Intent in a structured store. `backend` `db`

*   **Feature: System Digital Twin**
    *   [x] **Story**: As a PO, I want to visualize the project progress within the Digital Twin module itself. `frontend` `digital-twin`
    *   [ ] **Story**: As a PO, I want visual indicators for "Mocked" vs "Integrated" modules in the System View. `frontend` `digital-twin`

*   **Feature: ROE Status & Compliance (Enhancements)**
    *   [x] **Story**: As a Commander, I want to see ROE status on every decision card so I know if authorization is needed. `frontend` `decisions` ✅
    *   [x] **Story**: As a Staff Officer, I want to create ROE requests via API so I can request authorization. `backend` `api` ✅
    *   [ ] **Story**: As a System, I want to automatically determine if a decision requires ROE based on its characteristics. `backend` `roe` `enhancement`
    *   [ ] **Story**: As a J3, I want decisions blocked from meeting routing if ROE is required but not approved. `backend` `routing` `enhancement`
    *   [ ] **Story**: As a LEGAD, I want comprehensive unit tests for ROE logic to ensure legal compliance. `backend` `testing` `enhancement`
    *   [ ] **Story**: As a Developer, I want integration tests for ROE workflow to verify end-to-end functionality. `backend` `frontend` `testing` `enhancement`

---

## 📝 Sprint 2: Trusted Data Layer (Planning)

**Goal**: Move from "Data Display" to "Trusted Intelligence".

### EPIC-2: Uncertainty & Quality
*   **Feature: Assumption Registry Backend**
    *   [ ] **Story**: As a J2, I want to persist assumptions with confidence scores in the database. `backend` `db`
    *   [ ] **Story**: As a Planner, I want to link Decisions to Assumptions so I know what to review if intel changes. `backend` `graph`

*   **Feature: Quality Impact Visualization**
    *   [ ] **Story**: As a Targeteer, I want to see "Data Quality Badges" on target cards based on source reliability. `frontend` `targeting`
    *   [ ] **Story**: As a Commander, I want an "Impact Cascade" view showing which plans are at risk due to low confidence. `frontend` `uncertainty`
    *   [ ] **Story**: As a J2, I want to monitor "Human Domain" stability metrics via a persistent PMESII-PT data store. `backend` `social`

---

## 🚀 Sprint 3: Fusion & State (Backlog)

**Goal**: The "Brain" of the system comes online.

## Loose Ends & Inconsistencies (Identified Jan 2026)
> [!NOTE]
> These items were identified during a deep scan of the codebase and should be prioritized for UI Polish.

### Interactive Gaps
- [ ] **Strategic Direction**: 'Propose New Alignment' and 'Manual Sync Override' buttons are visual-only. Need explicit `onClick` handlers or "Future Feature" tooltips.
- [ ] **Targeting Management**: 'Nominate Target' button is non-functional.
- [ ] **Digital Twin**: System modules (Network/Dev/Assets) scale on hover but have no click interaction. Should open a detail view or modal.

### Codebase Clean-up
- [x] **Orphan Check**: `COGAnalyzer.tsx` and `UncertaintyManagement.tsx` verified as linked in Sidebar (Planning/Intel sections).

### EPIC-3: Digital Twin Core
*   **Feature: State Engine**
    *   [ ] **Story**: As a Simulator, I want an Event Sourcing store to replay historical operation states. `backend` `digital-twin`
    *   [ ] **Story**: As a Developer, I want a WebSocket feed for real-time entity updates. `backend` `realtime`

### EPIC-4: Data Fusion & Cognitive Core
*   **Feature: Entity Resolution**
    *   [ ] **Story**: As an Intel Analyst, I want the system to auto-merge duplicate tracks from different sensors. `backend` `fusion`
    *   [ ] **Story**: As a J2, I want a "Truth Resolution" UI to manually de-conflict confusing data. `frontend` `fusion`
*   **Feature: Doctrine-Aware RAG (Phase 2 AI)**
    *   [ ] **Story**: As a Planner, I want an AI Assistant that retrieves NATO doctrine (COPD) to help draft orders. `ai` `rag`
    *   [ ] **Story**: As an Admin, I want to manage a local Vector Store for air-gapped document processing. `backend` `it`

---

## 🔮 Sprint 4: Advanced Operations (Backlog)

**Goal**: High-level synchronization of kinetic and non-kinetic maneuver.

### EPIC-5: Multi-Domain Operations
*   **Feature: Synchronization Matrix**
    *   [x] **Story**: As an MDO Planner, I want a functional Sync Matrix that detects timing conflicts between domains. `frontend` `mdo`
    *   [x] **Story**: As a StratCom Planner, I want Information Effects (Info Ops) visualized on the matrix. `frontend` `stratcom`
*   **Feature: Social Domain Picture (COPD Phase 3)**
    *   [x] **Story**: As a Commander, I want a PMESII-PT dashboard to monitor non-kinetic factors. `frontend` `social`

### EPIC-6: Simulation & Wargaming (Phase 2 AI)
*   **Feature: CoA Wargamer**
    *   [x] **Story**: As a Planner, I want to compare CoAs based on PoS and Risk scores. `frontend` `wargaming`
    *   [ ] **Story**: As a Simulator, I want to link the Wargamer to a High-Fidelity Interaction (HFI) engine. `backend` `simulation`

---

### EPIC-7: Adversarial Context (A2/AD & Advisory)
*   **Feature: LEGAD/POLAD Advisory Integration**
    *   [ ] **Story**: As a LEGAD, I want to see an "Advisory Review" queue so I can approve targeting nominations and ROE updates. `frontend` `advisory`
    *   [ ] **Story**: As a POLAD, I want to provide "Political Impact" assessments on non-kinetic effects. `frontend` `advisory`
*   **Feature: A2/AD Strategic View**
    *   [ ] **Story**: As a Planner, I want a "Strategic A2/AD Dashboard" to visualize denial zones and simulate entry options. `frontend` `strategic`
    *   [ ] **Story**: As a Commander, I want to compare "Bubble Breaking" options over time. `frontend` `simulation`
*   **Feature: Cognitive Triage Mode**
    *   [ ] **Story**: As an Operator, I want a "Triage Mode" to filter noise and prioritize critical tracks during saturation. `frontend` `fusion`
    *   [ ] **Story**: As an Intel Analyst, I want "Decoy Probability" markers on tracks in the RxP. `frontend` `intel`

---

## 🤖 Sprint 5: Autonomous Synchronization (Backlog)

**Goal**: Closing the loop with prescriptive intelligence.

### EPIC-7: Autonomous Lifecycle
*   **Feature: Information Loop Closure (Phase 3 AI)**
    *   [ ] **Story**: As a J2, I want the AI to suggest RFIs when data confidence in a COG drops below threshold. `ai` `intel`
*   **Feature: Dynamic ROE Shield (Security/AI)**
    *   [ ] **Story**: As a LEGAD, I want real-time ROE violation alerts based on live track position. `ai` `compliance`
*   **Feature: Self-Healing Sync Matrix**
    *   [ ] **Story**: As a J3, I want the matrix to auto-update timing if an effect fails its MOEs. `ai` `sync`

## ✅ Completed (Pre-Agile)

*   **Foundation**: Project Setup, Auth/ABAC, Admin Dashboard, Metrics
*   **COPD Alignment (Phase 1-3)**: CoA Wargamer, CONOPS Builder, COP Summary, Strategic Direction, Social Domain, MDO Sync Matrix.

---

## 🔍 Gap Analysis Framework

> **Purpose**: A structured checklist of perspectives to evaluate during each sprint planning cycle. Each perspective surfaces gaps that inform backlog prioritization.
> **Process**: Review each perspective, document gaps, and link findings to Sprint Epics/Stories.

### Improvement Categories (POT Triangle)

All gaps and improvements are categorized using the **People-Organization-Technology** framework:

| Category | Focus | Examples |
|:---|:---|:---|
| 🧑 **People** | Competencies, training, cognitive factors | Operator training, UX simplification, workload reduction |
| 🏛️ **Organization** | Processes, workflows, doctrine, governance | SOP alignment, approval workflows, COPD compliance |
| 💻 **Technology** | Systems, integrations, infrastructure | API development, AI/ML features, data persistence |

### Perspective Registry

| # | Perspective | Focus Area | POT | Last Reviewed | Link |
|:--|:---|:---|:---:|:---|:---|
| 1 | **COPD Alignment** | Operational Doctrine (NATO Planning) | 🏛️ | 2026-01-05 | [copd_gap_analysis.md](file:///Users/vidarbrevik/.gemini/antigravity/brain/3729e5b5-09d8-4cdc-94cf-cc26e31f0a50/copd_gap_analysis.md) |
| 2 | **IT Service & Architecture** | Scalability, API, Security | 💻 | 2026-01-05 | [it_ai_gap_analysis.md](file:///Users/vidarbrevik/.gemini/antigravity/brain/3729e5b5-09d8-4cdc-94cf-cc26e31f0a50/it_ai_gap_analysis.md) |
| 3 | **AI & Cognitive Augmentation** | RAG, ML, Prescriptive AI | 💻 | 2026-01-05 | [it_ai_gap_analysis.md](file:///Users/vidarbrevik/.gemini/antigravity/brain/3729e5b5-09d8-4cdc-94cf-cc26e31f0a50/it_ai_gap_analysis.md) |
| 4 | **Human Factors (UX)** | Cognitive Load, Accessibility | 🧑 | — | *To be created* |
| 5 | **Interoperability (FMN)** | NATO Standards, Coalition | 💻 | — | *To be created* |
| 6 | **Legal & Ethical (LOAC)** | Audit, ROE, Compliance | 🏛️ | — | *To be created* |
| 7 | **Resilience (DDIL)** | Offline, Edge, Failover | 💻 | — | *To be created* |
| 8 | **Training & Simulation** | Sandbox, AAR, HFI | 🧑 | — | *To be created* |
| 9 | **Intelligence (TCPED)** | ISR, Collection, ATR | 🏛️💻 | — | *To be created* |
| 10 | **Cybersecurity** | SOC, UEBA, SOAR | 💻 | — | *To be created* |
| 11 | **Logistics (J4)** | Supply Chain, CBM+ | 🏛️💻 | — | *To be created* |
| 12 | **Space Domain** | SSA, SATCOM, PNT | 💻 | — | *To be created* |
| 13 | **Disruptive Technologies** | Emerging & Paradigm-Shifting Tech | 💻🏛️ | — | *To be created* |

### Disruptive Technologies Taxonomy

> **Definition**: Technologies that fundamentally alter operational paradigms, create asymmetric advantages, or render existing capabilities obsolete. Unlike incremental improvements, disruptive tech requires organizational adaptation.

| Category | Technologies | Operational Impact | SmartOps Relevance |
|:---|:---|:---|:---|
| **Autonomy** | UAS swarms, Unmanned platforms, Robotic logistics | Reduced human risk, persistent presence | Track integration, autonomous RxP |
| **AI/ML** | LLMs, Computer Vision, Reinforcement Learning | Accelerated OODA, pattern recognition | Staff Assistant, ATR, CoA prediction |
| **Quantum** | Quantum computing, Quantum-resistant crypto | Crypto vulnerability, optimization | Security posture, future-proofing |
| **Hypersonics** | Hypersonic glide vehicles, Maneuvering warheads | Compressed decision timelines | Time-critical targeting |
| **Directed Energy** | Lasers, HPM, EMP | Cost-per-shot economics, magazine depth | Weapon-target pairing |
| **Synthetic Bio** | Human enhancement, Threat detection | Personnel optimization, CBRN | Personnel tracking |
| **Edge/5G** | Tactical cloud, Mobile edge compute | DDIL resilience, distributed C2 | Offline-first architecture |
| **Digital Twins** | High-fidelity simulation, Predictive maintenance | Rehearsal, logistics optimization | Wargaming, CoA evaluation |

**Adoption Criteria (for prioritization)**:
- **Force Multiplier**: Does it significantly amplify existing capabilities?
- **Threat Parity**: Are adversaries already deploying this?
- **Integration Feasibility**: Can it work with current doctrine/training?
- **Ethical/Legal Clarity**: Are LOAC/IHL implications understood?

### Template for New Perspective Analysis

```markdown
# Gap Analysis: [Perspective Name]

> **Last Updated**: YYYY-MM-DD
> **Maturity Level**: 1-5

## Current State
- Bullet points describing what exists today.

## Target State
- Bullet points describing the desired end state.

## Gaps Identified
| Gap | POT | Cynefin | Impact | Mitigation | Sprint Link |
|:---|:---:|:---:|:---|:---|:---|
| Description | 🧑/🏛️/💻 | Simple/Complicated/Complex | High/Med/Low | Proposed fix | EPIC-X |

## Actions
- [ ] Story or task linked to backlog.
```

---

## 🧠 Analytical Models & Frameworks

> **Purpose**: Multiple analytical lenses for comprehensive understanding. Each model offers a unique perspective on gaps and improvements.

### Active Models (Integrated)

#### 1. POT Triangle (People-Organization-Technology)
Categorizes improvements by domain of change.
- **People** 🧑: Training, competencies, cognitive factors
- **Organization** 🏛️: Processes, workflows, doctrine, governance
- **Technology** 💻: Systems, integrations, infrastructure

#### 2. Hermeneutic Circle (Whole ↔ Part)
Iterative understanding through alternating perspectives.
```
┌─────────────────────────────────────────────┐
│  HOLISTIC VIEW (Strategic Summary)          │
│  ↓                                          │
│  DEEP DIVE (Single Perspective)             │
│  ↓                                          │
│  HOLISTIC VIEW (Revalidate Understanding)   │
└─────────────────────────────────────────────┘
```
*Implementation*: UI toggle between Dashboard (whole) and Detail (part) views.

#### 3. Maturity Levels (CMMI-style)
Rates capability progression for each perspective.

| Level | Name | Description |
|:---:|:---|:---|
| 1 | **Initial** | Ad-hoc, reactive, undocumented |
| 2 | **Managed** | Basic processes, some documentation |
| 3 | **Defined** | Standardized, repeatable processes |
| 4 | **Measured** | Quantitative metrics, data-driven |
| 5 | **Optimizing** | Continuous improvement, predictive |

---

### Backlog Models (Future Integration)

#### 4. DOTMLPF-P (Military Taxonomy)
Extended improvement categorization for defense systems.

| Code | Domain | Examples |
|:---|:---|:---|
| **D** | Doctrine | TTPs, SOPs, COPD alignment |
| **O** | Organization | Unit structure, command relationships |
| **T** | Training | Exercises, certifications, simulations |
| **M** | Materiel | Equipment, platforms, weapons |
| **L** | Leadership | Command development, decision authority |
| **P** | Personnel | Manning, skills, retention |
| **F** | Facilities | Infrastructure, bases, networks |
| **P** | Policy | Legal constraints, ROE, authorities |

*Sprint Target*: Sprint 4 (extend POT to full DOTMLPF-P)

#### 5. Cynefin Framework (Problem Classification)
Guides intervention strategy based on problem type.

| Domain | Characteristics | Approach |
|:---|:---|:---|
| **Simple** | Clear cause-effect | Sense → Categorize → Respond (Best Practice) |
| **Complicated** | Requires expertise | Sense → Analyze → Respond (Good Practice) |
| **Complex** | Emergent patterns | Probe → Sense → Respond (Emergent Practice) |
| **Chaotic** | No clear patterns | Act → Sense → Respond (Novel Practice) |

*Sprint Target*: Sprint 3 (add Cynefin tags to gaps)

#### 6. Double Diamond (Design Process)
Structures the analysis-to-action workflow.

```
  DISCOVER          DEFINE          DEVELOP          DELIVER
  (Diverge)        (Converge)      (Diverge)        (Converge)
     ◇                ◇                ◇                ◇
    / \              / \              / \              / \
   /   \            /   \            /   \            /   \
  ─────────────────────────────────────────────────────────
  Identify gaps    Prioritize       Ideate fixes     Implement
```

*Sprint Target*: Sprint 5 (workflow state machine)

#### 7. TOGAF Layers (Enterprise Architecture)
Aligns gaps with architecture layers.

| Layer | Focus | Examples |
|:---|:---|:---|
| **Business** | Processes, capabilities | Workflow automation, SOP digitization |
| **Application** | Systems, modules | UI components, service integration |
| **Data** | Information models | Entity schemas, data fusion |
| **Technology** | Infrastructure | APIs, databases, edge deployment |

*Sprint Target*: Sprint 4 (architecture mapping)


### Loose Ends & Carry-Over (Consolidated)

#### From Task Tracking
- [ ] **Social Domain Dashboard**: PMESII-PT analysis view (Sprint 4).
- [ ] **StratCom Sync**: Integration of Info Ops into MDO Matrix (Sprint 4).
- [ ] **Meeting Minutes View**: Read-only view for concluded governance sessions (Sprint 1/Cleanup).

#### From Gap Analysis
- [ ] **HFI Simulation Bridge**: API connector for VBS4/Synthetic envs (Sprint 4).
- [ ] **Strategic Direction Module**: SACEUR guidance parsing (Sprint 4).
- [ ] **Zero-Trust Architecture**: IL6+ security and MLS handlers (Future).
- [ ] **Edge/DDIL Support**: Offline-first architecture for tactical edge (Future).
- [ ] **Automated Target Recognition**: CV pipeline for RxP (Sprint 5/AI).
