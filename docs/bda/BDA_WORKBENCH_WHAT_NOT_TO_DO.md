# BDA Workbench: What NOT to Do
## Scope Boundaries & Anti-Patterns

**Date:** 2026-01-21  
**Purpose:** Clear boundaries to prevent scope creep and ensure project success

---

## ❌ DO NOT: Build These Features (Initial Implementation)

### 1. ❌ DO NOT Build Machine Learning / AI Systems

**Excluded Features:**
- Automated damage detection using computer vision
- ML-powered change detection
- Neural networks for object recognition
- Crater detection algorithms
- Automated vehicle/equipment counting
- Thermal signature analysis
- Predictive analytics for targeting effectiveness
- Pattern recognition engines

**Why Excluded:**
- Requires ML infrastructure (GPU clusters, training pipelines)
- Requires massive labeled training datasets (10,000+ images)
- Requires ML expertise (data scientists, model engineers)
- Adds 6-12 months to timeline
- Can operate effectively with manual analysis

**When to Add:** Phase 7+ (after 12 months of operational data collected)

---

### 2. ❌ DO NOT Integrate External Intelligence Systems

**Excluded Integrations:**
- DCGS (Distributed Common Ground System)
- MIDB (Modernized Integrated Database)
- National Geospatial-Intelligence Agency (NGA) systems
- SIGINT feeds
- HUMINT reporting systems
- MASINT sensors
- OSINT aggregators
- TECHINT databases

**Why Excluded:**
- Requires security clearances and system access
- Requires interface agreements with external organizations
- Requires handling multiple classification levels
- Each integration adds 2-4 months
- Initial system can function with manual intelligence input

**When to Add:** Phase 6+ (after core BDA proven, with proper agreements)

---

### 3. ❌ DO NOT Build Real-Time Video Processing

**Excluded Features:**
- Full-motion video (FMV) ingest
- Real-time frame extraction
- Video annotation and analysis
- On-board sensor data streaming
- Time-sensitive BDA (< 15 minute turnaround)
- Streaming video protocols

**Why Excluded:**
- Requires video processing infrastructure
- Requires real-time streaming protocols
- Requires high bandwidth (100+ Mbps)
- Adds complexity to architecture
- Static imagery sufficient for 95% of BDA assessments

**When to Add:** Phase 8+ (after time-sensitive targeting requirements validated)

---

### 4. ❌ DO NOT Build 3D Visualization Systems

**Excluded Features:**
- 3D damage modeling
- 3D structure visualization
- Photogrammetry from multiple angles
- Virtual reality (VR) assessment environments
- Line-of-sight analysis in 3D
- Multi-azimuth imagery fusion
- Point cloud generation

**Why Excluded:**
- Requires 3D rendering engine (Unity, Unreal, WebGL)
- Requires photogrammetry expertise
- Requires high-performance graphics
- 2D imagery sufficient for most assessments
- Adds 4-6 months to timeline

**When to Add:** Phase 9+ (after user demand for complex structure assessment)

---

### 5. ❌ DO NOT Build Collection Management Integration

**Excluded Features:**
- ISR collection requirements generation
- Imagery collection requests (ICRs)
- Collection asset scheduling
- Named Area of Interest (NAI) creation
- Interface with ISR planning systems
- Collection gap tracking
- Collection prioritization algorithms

**Why Excluded:**
- Requires integration with ISR systems
- Requires understanding of collection management workflows
- Analysts can manually submit collection requests
- Adds 3-4 months
- Not critical path for BDA

**When to Add:** Phase 10+ (after operational need demonstrated)

---

### 6. ❌ DO NOT Implement NATO/Coalition Interoperability

**Excluded Features:**
- STANAG 4545 imagery format support
- STANAG 7023 BDA reporting format
- NATO NFFI (NATO Friendly Force Information) interfaces
- BFSA (Battlefield Spectrum Architecture) integration
- Mission Partner Environment (MPE) data sharing
- Coalition-releasable product generation
- Multi-national security classification handling

**Why Excluded:**
- Requires NATO system access
- Requires interoperability testing with allies
- Requires multi-national security agreements
- Adds 6-12 months
- US-only operations sufficient for initial deployment

**When to Add:** Phase 11+ (when coalition operations required)

---

### 7. ❌ DO NOT Build Enterprise-Scale Infrastructure

**Excluded Capabilities:**
- Theater-wide operations (10,000+ strikes/month)
- Distributed deployment across multiple geographies
- 200% surge capacity handling
- Petabyte-scale imagery archive
- Multi-region replication
- Disaster recovery across continents
- 99.9% uptime SLA

**Why Excluded:**
- Requires distributed systems architecture
- Requires DevOps infrastructure (Kubernetes, load balancers, CDN)
- Requires 24/7 operations team
- Overkill for 100 strikes/month
- Can scale later based on demand

**When to Add:** Phase 13+ (after operational volume exceeds single-node capacity)

---

### 8. ❌ DO NOT Implement Full TS/SCI Security

**Excluded Security Features:**
- TOP SECRET//SCI classification handling
- Special Access Programs (SAP) compartmentation
- ICD 503 full compliance
- ICD 731 imagery handling (full spec)
- Cross-Domain Solutions (CDS) integration
- TEMPEST certification
- SCIF-only deployment requirements

**Why Excluded:**
- TS/SCI accreditation takes 6-12 months
- Requires dedicated security team
- Requires physical security infrastructure (SCIF)
- SECRET classification sufficient for 90% of BDA
- Can upgrade later if operational need exists

**When to Add:** Phase 12+ (after ATO process for TS/SCI)

---

### 9. ❌ DO NOT Build Advanced Geospatial Features

**Excluded Features:**
- Advanced GIS analysis (buffer zones, viewshed, least-cost path)
- 3D terrain visualization
- Multi-spectral imagery analysis
- Hyperspectral data processing
- Change detection algorithms (automated)
- Geofencing and alerting
- Integration with ArcGIS/QGIS

**Why Excluded:**
- Requires GIS expertise
- Requires commercial GIS software licenses
- Basic coordinate tracking sufficient for BDA
- Can add advanced features later
- Adds 3-4 months

**When to Add:** Phase 14+ (after advanced geospatial requirements identified)

---

### 10. ❌ DO NOT Create Custom Workflow Orchestration

**Excluded Features:**
- BPMN workflow designer
- Complex multi-step approval workflows (beyond basic review/approve)
- Workflow analytics and optimization
- Dynamic workflow routing based on rules
- Parallel approval paths
- Escalation and SLA management

**Why Excluded:**
- Simple linear workflow sufficient (draft → review → approve)
- Workflow engines add complexity
- Can use database status flags instead
- Adds 2-3 months

**When to Add:** Phase 15+ (after workflow complexity increases)

---

## ❌ DO NOT: Adopt These Technical Approaches

### 1. ❌ DO NOT Use Microservices Architecture (Initially)

**Why Not:**
- Increases operational complexity
- Requires container orchestration (Kubernetes)
- Requires service mesh, API gateway, service discovery
- Overkill for single-team, single-location deployment
- Monolithic Rust backend is faster to develop and deploy

**Use Instead:** Monolithic Rust backend with feature-based modules

---

### 2. ❌ DO NOT Use NoSQL Databases for Primary Storage

**Why Not:**
- BDA data is highly relational (reports → imagery → strikes)
- Transactions required for data consistency
- Complex queries needed for analytics
- SQL is industry standard for operational systems

**Use Instead:** SQLite (dev) → PostgreSQL (production)

---

### 3. ❌ DO NOT Build Custom Authentication System

**Why Not:**
- Authentication is complex and security-critical
- Existing JWT system already implemented
- Custom systems prone to vulnerabilities

**Use Instead:** Existing JWT-based authentication with RBAC

---

### 4. ❌ DO NOT Create Custom UI Component Library

**Why Not:**
- Time-consuming to build and maintain
- Existing component library (shadcn/ui) already in use
- Consistency with rest of SmartOps dashboard important

**Use Instead:** Existing shadcn/ui components with BDA-specific styles

---

### 5. ❌ DO NOT Use GraphQL API

**Why Not:**
- REST API simpler for CRUD operations
- Team already familiar with REST
- No complex nested queries required
- GraphQL adds learning curve and complexity

**Use Instead:** RESTful API with Axum (existing backend framework)

---

### 6. ❌ DO NOT Deploy to Cloud (AWS/Azure/GCP) Initially

**Why Not:**
- Requires cloud expertise
- Requires cloud billing and procurement
- Security compliance more complex in cloud
- On-premise deployment simpler for SECRET classification

**Use Instead:** On-premise Docker Compose deployment (Mac M2 compatible)

---

### 7. ❌ DO NOT Use Message Queues (RabbitMQ, Kafka) Initially

**Why Not:**
- Adds architectural complexity
- Not needed for 100 strikes/month
- Direct database writes sufficient
- Can add later if async processing needed

**Use Instead:** Synchronous API calls with database transactions

---

## ❌ DO NOT: Follow These Process Anti-Patterns

### 1. ❌ DO NOT Skip Backend Implementation

**Anti-Pattern:** Build frontend-only with mock data  
**Why Bad:** Creates rework later, delays real functionality  
**Correct:** Backend-first per project guidelines

---

### 2. ❌ DO NOT Create .sh Test Scripts

**Anti-Pattern:** Use shell scripts for testing  
**Why Bad:** Not cross-platform, not integrated with CI  
**Correct:** Use Playwright E2E tests per project guidelines

---

### 3. ❌ DO NOT Replace Existing Libraries Without Approval

**Anti-Pattern:** Swap out TanStack Router, Axum, etc.  
**Why Bad:** Breaks consistency, requires approval  
**Correct:** Use existing technology stack

---

### 4. ❌ DO NOT Skip Documentation

**Anti-Pattern:** "Code is self-documenting"  
**Why Bad:** User guide required, API docs required  
**Correct:** Create docs in `/docs/` folder

---

### 5. ❌ DO NOT Skip Memory Updates

**Anti-Pattern:** Complete work without updating knowledge graph  
**Why Bad:** Context lost, future sessions impaired  
**Correct:** Always update entities/relations after major work

---

### 6. ❌ DO NOT Create Temporary Helper Scripts

**Anti-Pattern:** Create one-off scripts to work around limitations  
**Why Bad:** Technical debt, not maintainable  
**Correct:** Use standard tools, implement properly

---

### 7. ❌ DO NOT Skip User Approval on Scope Changes

**Anti-Pattern:** Add features because "it would be nice"  
**Why Bad:** Scope creep, delays delivery  
**Correct:** Strictly follow approved Phase 0-5 scope

---

## ❌ DO NOT: Make These Architecture Decisions

### 1. ❌ DO NOT Store Images in Database

**Why Not:**
- Database bloat
- Poor performance
- Difficult to serve via CDN

**Use Instead:** Filesystem storage with database metadata (paths, URLs)

---

### 2. ❌ DO NOT Use Separate Database per Feature

**Why Not:**
- Breaks referential integrity
- Complex cross-feature queries
- Multiple connection pools

**Use Instead:** Single database with BDA tables alongside existing tables

---

### 3. ❌ DO NOT Implement Custom Encryption

**Why Not:**
- Cryptography is hard
- High risk of vulnerabilities
- Libraries exist

**Use Instead:** Standard encryption libraries (TLS for transport, AES for data)

---

### 4. ❌ DO NOT Bypass Existing Middleware

**Why Not:**
- Authentication/authorization exists
- Rate limiting exists
- CSRF protection exists

**Use Instead:** Use existing middleware stack

---

### 5. ❌ DO NOT Create Multiple API Versions

**Why Not:**
- Maintenance burden
- Complexity
- Not needed for v1.0

**Use Instead:** Single API version, evolve carefully

---

## ✅ DO: Follow These Guidelines

### 1. ✅ DO Start with Backend

- Create Rust feature module first
- Implement database schema and migrations
- Build API endpoints
- Test with REST client
- Then integrate frontend

### 2. ✅ DO Use Existing Patterns

- Follow `assumptions` feature as reference
- Use feature-based architecture
- Use existing components (SecurityBadge, Cards, etc.)
- Follow existing routing patterns

### 3. ✅ DO Create Playwright Tests

- E2E tests for complete workflows
- No shell scripts
- Run before considering work complete

### 4. ✅ DO Document Everything

- User guide in `/docs/`
- API reference
- Database schema
- Update ports.md if needed
- Update README.md

### 5. ✅ DO Update Memory

- Create entities for major features
- Define relationships
- Store observations
- Reference as "memory" in future sessions

### 6. ✅ DO Ensure Mac M2 Compatibility

- Docker images must run on Apple Silicon
- Test on Mac M2 before completion
- Use appropriate base images

### 7. ✅ DO Seek Approval Before Proceeding

- Get user confirmation on scope (Phases 0-5)
- Get confirmation on exclusions
- Get confirmation on timeline
- Get confirmation on team availability

---

## Summary: The BDA "DON'T" List

**DON'T Build:**
1. ML/AI systems ❌
2. External system integrations ❌
3. Real-time video processing ❌
4. 3D visualization ❌
5. Collection management ❌
6. NATO interoperability ❌
7. Enterprise-scale infrastructure ❌
8. TS/SCI security (initially) ❌
9. Advanced geospatial features ❌
10. Custom workflow orchestration ❌

**DON'T Use:**
1. Microservices architecture ❌
2. NoSQL databases ❌
3. Custom authentication ❌
4. Custom UI library ❌
5. GraphQL ❌
6. Cloud deployment (initially) ❌
7. Message queues ❌

**DON'T Do:**
1. Skip backend ❌
2. Create .sh scripts ❌
3. Replace libraries ❌
4. Skip documentation ❌
5. Skip memory updates ❌
6. Create helper scripts ❌
7. Add features without approval ❌

---

## What We WILL Build (Phases 0-5)

✅ Backend BDA feature (Rust)  
✅ Database schema (SQLite → PostgreSQL)  
✅ Imagery management (basic upload/view)  
✅ Physical damage assessment (ND/SD/MD/SVD/D)  
✅ Functional damage assessment (FMC/PMC/NMC)  
✅ Effects assessment (1st/2nd/3rd order)  
✅ Weaponeering validation  
✅ Collateral damage assessment  
✅ Re-attack recommendations  
✅ Quality control workflow  
✅ BDA reporting (initial/interim/final)  
✅ Historical database (7-year retention)  
✅ Pattern analysis (basic trends)  
✅ Security classification (SECRET)  
✅ Geospatial integration (basic coordinates)  

**Timeline:** 5 months (20 weeks)  
**Target:** 100 strikes/month, SECRET classification  

---

_Last Updated: 2026-01-21_  
_Purpose: Prevent scope creep, ensure project success_
