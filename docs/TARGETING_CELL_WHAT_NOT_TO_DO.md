# Targeting Cell Dashboard - What NOT to Do

## Purpose

This document clearly defines scope boundaries, technical constraints, and anti-patterns for the NATO COPD Targeting Cell Dashboard implementation. Following these guidelines ensures we stay focused on delivering a high-value operational dashboard without scope creep.

---

## Scope Boundaries

### ❌ DO NOT Build Full Systems

1. **Mission Planning System**
   - ✅ Display: Show targets, priorities, timelines
   - ❌ Build: Complete mission planning workflow, asset allocation, deconfliction solver
   - **Why**: Mission planning is a separate domain; we visualize outputs, not replace JOPES/ATP

2. **Weapon System C2**
   - ✅ Display: Platform status, munitions availability, sortie counts
   - ❌ Build: Direct weapon system interfaces, fire control, launch authority
   - **Why**: Actual weapon control requires certified systems; we show status only

3. **GIS/Mapping Platform**
   - ✅ Display: Use third-party map libraries (Leaflet, Mapbox) for overlays
   - ❌ Build: Custom GIS engine, terrain analysis, 3D visualization
   - **Why**: GIS is a specialty domain; integrate existing tools, don't rebuild

4. **Full Chat/Collaboration Platform**
   - ✅ Display: Simple annotations, comments on targets
   - ❌ Build: Slack/Teams clone, video conferencing, file sharing
   - **Why**: Use existing secure chat systems; we provide context-specific notes only

5. **ML/AI Training Platform**
   - ✅ Display: Show AI/ML predictions with confidence scores (mock data for MVP)
   - ❌ Build: Model training infrastructure, feature engineering pipeline, hyperparameter tuning
   - **Why**: ML infrastructure is Phase 3+; use mock predictions for UI validation

6. **Document Management System**
   - ✅ Display: Links to target packages, intelligence reports
   - ❌ Build: Full DMS with versioning, workflows, search, indexing
   - **Why**: Integrate with existing DMS (SharePoint, Alfresco); link, don't store

7. **Live Video Streaming**
   - ✅ Display: ISR platform status, collection windows, sensor types
   - ❌ Build: Video streaming infrastructure for ISR feeds
   - **Why**: Video requires specialized infrastructure; status only for MVP

8. **Cryptographic Communications**
   - ✅ Display: Use standard HTTPS/TLS for web traffic
   - ❌ Build: Custom crypto protocols, key management, secure voice
   - **Why**: Crypto is external; rely on network security infrastructure

9. **Personnel Management**
   - ✅ Display: Use existing auth system for user roles
   - ❌ Build: HR system, personnel tracking, training records
   - **Why**: Personnel data is managed elsewhere; we only need auth/authz

10. **Weather Forecasting**
    - ✅ Display: Consume external weather APIs, show impact on operations
    - ❌ Build: Meteorological models, forecasting engine
    - **Why**: Use DoD weather services; display their data, don't forecast

---

## Technical Constraints

### ❌ DO NOT Create Custom Infrastructure

1. **WebSockets Everywhere**
   - ✅ Use: For TST countdown, critical alerts (real-time required)
   - ❌ Use: For all data (historical targets, archived BDAs)
   - **Why**: Polling is sufficient for most data; WebSockets add complexity

2. **Custom Charting Library**
   - ✅ Use: Recharts, Chart.js, D3.js (established libraries)
   - ❌ Build: Custom SVG/Canvas charting from scratch
   - **Why**: Charting is solved; use battle-tested libraries

3. **Custom State Management**
   - ✅ Use: React hooks (useState, useEffect, useContext)
   - ❌ Build: Custom Redux clone, global state framework
   - **Why**: React hooks sufficient for this dashboard; avoid over-engineering

4. **Custom Authentication**
   - ✅ Use: Existing SmartOps JWT auth with RS256
   - ❌ Build: New auth system, OAuth provider, SSO server
   - **Why**: Auth already implemented; extend, don't replace

5. **Custom CSS Framework**
   - ✅ Use: Tailwind CSS (already in project)
   - ❌ Build: Custom CSS-in-JS, styled-components, emotion
   - **Why**: Tailwind is established; consistency with existing codebase

6. **Custom Icon Library**
   - ✅ Use: Lucide React (already in project)
   - ❌ Build: Custom SVG icon system, icon font
   - **Why**: Lucide has 1000+ icons; sufficient for all needs

7. **Custom Date/Time Handling**
   - ✅ Use: date-fns, dayjs (lightweight, established)
   - ❌ Build: Custom date parser, timezone calculator
   - **Why**: Date/time is solved; use libraries, avoid bugs

8. **Custom Validation**
   - ✅ Use: Zod (TypeScript-first schema validation)
   - ❌ Build: Custom validation framework
   - **Why**: Zod provides type safety + validation; no need to rebuild

9. **Custom HTTP Client**
   - ✅ Use: Fetch API (native), or existing client
   - ❌ Build: Custom HTTP wrapper, request queue, retry logic
   - **Why**: Fetch is sufficient; add retry logic only if needed

10. **Custom Logging**
    - ✅ Use: Console logging (development), structured logger (production)
    - ❌ Build: Custom logging framework, log aggregation
    - **Why**: Logging infrastructure exists; use it, don't rebuild

---

## UX/UI Constraints

### ❌ DO NOT Add Unnecessary Features

1. **Animated 3D Visualizations**
   - ✅ Use: 2D maps, charts, diagrams (clear, focused)
   - ❌ Use: 3D terrain, particle effects, animated transitions
   - **Why**: Operations center needs clarity, not entertainment; 3D distracts

2. **Sound Effects / Audio Alerts**
   - ✅ Use: Visual alerts (red flash, toast notification)
   - ❌ Use: Alarm sounds, voice synthesis, audio cues
   - **Why**: Ops center is noisy; visual is more reliable; audio is Phase 2+

3. **Mobile-First Design**
   - ✅ Use: Desktop/tablet first (1920x1080, 1024x768)
   - ❌ Use: Mobile responsive (phone screens)
   - **Why**: Targeting cell uses workstations; mobile is future enhancement

4. **Custom Fonts**
   - ✅ Use: System fonts (Inter, Roboto Mono) or Google Fonts
   - ❌ Use: Custom military fonts, branded typefaces
   - **Why**: Web fonts load fast, accessible; custom fonts add load time

5. **Gamification**
   - ✅ Use: Status indicators, completion percentages (informational)
   - ❌ Use: Points, badges, leaderboards, achievements
   - **Why**: This is life-and-death operations, not a game

6. **Customizable Dashboard**
   - ✅ Use: Fixed layout (consistency across operators)
   - ❌ Use: Drag-and-drop panels, user themes, widget library
   - **Why**: Standard layout ensures all operators see same information

7. **User Theme Customization**
   - ✅ Use: Dark mode only (24/7 ops center standard)
   - ❌ Use: Light mode, color themes, custom backgrounds
   - **Why**: Dark mode reduces eye strain; consistency is critical

8. **Tutorial / Onboarding Flows**
   - ✅ Use: Documentation, quick reference cards
   - ❌ Use: Interactive tutorials, tooltips everywhere, wizard flows
   - **Why**: Assume trained operators; onboarding is classroom, not UI

9. **Social Sharing**
   - ✅ Use: Export target packages (internal only)
   - ❌ Use: Share to social media, public links, embeds
   - **Why**: Classified environment; no external sharing ever

10. **Feedback / Rating System**
    - ✅ Use: Bug reporting (separate system)
    - ❌ Use: In-app ratings, feedback forms, surveys
    - **Why**: Command tool, not consumer app; feedback via proper channels

---

## Data Constraints

### ❌ DO NOT Handle Classified Data Improperly

1. **Store Real Classified Data in Development**
   - ✅ Use: Mock data, synthetic targets, test intelligence
   - ❌ Use: Actual classified targets, real coordinates, true intelligence
   - **Why**: Development environment is not accredited; mock only

2. **Real-Time Database Replication**
   - ✅ Use: Standard database with periodic backups
   - ❌ Build: Multi-region replication, active-active clustering
   - **Why**: Single database sufficient for MVP; replication is Phase 2+

3. **Build Data Warehouse**
   - ✅ Use: Operational database (SQLite → PostgreSQL later)
   - ❌ Build: Separate data warehouse, OLAP cubes, historical archive
   - **Why**: Operational data only; analytics is separate system

4. **Implement Blockchain**
   - ✅ Use: Standard audit log (timestamped, immutable via append-only)
   - ❌ Use: Blockchain, distributed ledger, smart contracts
   - **Why**: Blockchain is overkill; audit log is sufficient for accountability

5. **Custom Encryption Schemes**
   - ✅ Use: Standard TLS 1.3, HTTPS, database encryption at rest
   - ❌ Build: Custom encryption algorithm, key derivation, cipher
   - **Why**: Crypto is hard; use standards (AES-256, RSA-2048), don't invent

6. **Build Backup/Restore System**
   - ✅ Use: Database backup tools (pg_dump, SQLite backup)
   - ❌ Build: Custom backup scheduler, incremental backups, point-in-time recovery
   - **Why**: Database tools sufficient; use them, don't rebuild

7. **Implement Data Versioning**
   - ✅ Use: Audit log with created_at, updated_at timestamps
   - ❌ Build: Full version control (git-like), diff viewer, rollback
   - **Why**: Audit trail sufficient; versioning is complex

8. **Create Data Migration Tool**
   - ✅ Use: SQL migration scripts (sqlx, diesel)
   - ❌ Build: Custom ETL tool, data mapping GUI, transformation engine
   - **Why**: SQL migrations sufficient; no need for complex ETL

9. **Build ETL Pipeline**
   - ✅ Use: Direct database queries, simple SQL transformations
   - ❌ Build: Apache Airflow, Luigi, custom DAG scheduler
   - **Why**: Simple queries sufficient for MVP; ETL is Phase 2+

10. **Implement Real-Time Analytics**
    - ✅ Use: Pre-computed metrics (updated every 30s)
    - ❌ Build: Streaming analytics, complex event processing, real-time aggregations
    - **Why**: Pre-computed is fast enough; real-time analytics is complex

---

## Integration Constraints

### ❌ DO NOT Build External System Interfaces

1. **DCGS Integration**
   - ✅ Phase: Planning only (document interface requirements)
   - ❌ Phase: MVP implementation (complex integration)
   - **Why**: DCGS integration requires accreditation, security review; Phase 2+

2. **TBMCS Integration**
   - ✅ Phase: Mock data showing TBMCS-like structure
   - ❌ Phase: Live connection to TBMCS database
   - **Why**: TBMCS integration is complex, requires coordination; Phase 2+

3. **AOC System Interfaces**
   - ✅ Phase: Document data flow, API requirements
   - ❌ Phase: Build AOC connectors, sync logic
   - **Why**: AOC integration is multi-month effort; design first, build later

4. **National-Level Intelligence**
   - ✅ Phase: Mock intelligence reports with classification markings
   - ❌ Phase: Connect to actual JWICS, SIPRNet feeds
   - **Why**: National intel access requires clearance, accreditation; Phase 2+

5. **External Weather APIs**
   - ✅ Phase: Mock weather data with impact assessments
   - ❌ Phase: Live connection to DoD weather services
   - **Why**: Weather API integration is nice-to-have; mock for MVP

6. **Geospatial Services (WMS/WFS)**
   - ✅ Phase: Static map overlays, coordinate display
   - ❌ Phase: Dynamic WMS layers, terrain analysis, route planning
   - **Why**: GIS integration is complex; static maps sufficient for MVP

7. **Email/Notification Systems**
   - ✅ Phase: In-app notifications (toast alerts)
   - ❌ Phase: Email alerts, SMS, push notifications
   - **Why**: External notifications require infrastructure; in-app sufficient

8. **Active Directory / LDAP**
   - ✅ Phase: Use existing JWT auth with role claims
   - ❌ Phase: Integrate with AD for user sync, group management
   - **Why**: Auth integration is Phase 2+; JWT is sufficient for MVP

9. **SharePoint / DMS Integration**
   - ✅ Phase: External links to documents
   - ❌ Phase: Embedded document viewer, inline editing
   - **Why**: DMS integration is complex; links sufficient for MVP

10. **Video Teleconference (VTC) Systems**
    - ✅ Phase: Meeting schedule display (JTB sessions)
    - ❌ Phase: Embedded VTC client, screen sharing
    - **Why**: VTC is separate infrastructure; schedule only for MVP

---

## Performance Constraints

### ❌ DO NOT Over-Optimize Prematurely

1. **Database Sharding**
   - ✅ Use: Single database with proper indexes
   - ❌ Use: Horizontal sharding, distributed database
   - **Why**: 500 targets is small; single DB handles millions of rows

2. **Microservices Architecture**
   - ✅ Use: Monolithic Rust backend (feature modules)
   - ❌ Use: Separate services per component (8+ services)
   - **Why**: Monolith is simpler; microservices add complexity without benefit

3. **CDN for Static Assets**
   - ✅ Use: Vite build output served by backend
   - ❌ Use: CloudFront, Fastly, multi-region CDN
   - **Why**: Internal network; CDN adds no value

4. **Caching Layer (Redis)**
   - ✅ Use: In-memory caching in Rust (if needed)
   - ❌ Use: Separate Redis server, cache invalidation logic
   - **Why**: Database is fast enough; add caching only if proven bottleneck

5. **Load Balancer**
   - ✅ Use: Single backend instance
   - ❌ Use: Multiple backends with Nginx/HAProxy
   - **Why**: 10-50 concurrent users; single instance sufficient

6. **Database Connection Pooling**
   - ✅ Use: Default SQLite (single connection) or small pool (5-10 connections)
   - ❌ Use: Large connection pool (100+ connections)
   - **Why**: Low concurrent query load; small pool sufficient

7. **Server-Side Rendering (SSR)**
   - ✅ Use: Client-side React (SPA)
   - ❌ Use: Next.js, server-side rendering
   - **Why**: Authenticated app, no SEO needed; SPA is simpler

8. **Image Optimization Pipeline**
   - ✅ Use: Optimize images manually before commit
   - ❌ Build: Automatic image compression, format conversion, lazy loading
   - **Why**: Few images; manual optimization sufficient

9. **Code Splitting**
   - ✅ Use: Single bundle (Vite default)
   - ❌ Use: Route-based splitting, dynamic imports everywhere
   - **Why**: Small app; single bundle loads fast, simpler caching

10. **Web Workers**
    - ✅ Use: Main thread for all operations
    - ❌ Use: Web Workers for background processing
    - **Why**: No heavy computation in browser; backend handles processing

---

## Security Constraints

### ❌ DO NOT Implement Security Theatre

1. **Custom Encryption**
   - ✅ Use: Standard TLS 1.3, bcrypt/argon2 for passwords
   - ❌ Build: Custom crypto algorithm, "military-grade" encryption
   - **Why**: Crypto is hard; use standards, don't invent

2. **Security Questions**
   - ✅ Use: Strong passwords + MFA (if available)
   - ❌ Use: "Mother's maiden name", security questions
   - **Why**: Security questions are weak; use real 2FA

3. **CAPTCHA**
   - ✅ Use: Rate limiting, account lockout
   - ❌ Use: CAPTCHA, reCAPTCHA on login
   - **Why**: Internal system; CAPTCHA is for public sites

4. **IP Whitelisting in Application**
   - ✅ Use: Firewall rules (network layer)
   - ❌ Build: IP whitelist in application code
   - **Why**: Network controls are more reliable; app shouldn't enforce network policy

5. **Password Complexity Rules**
   - ✅ Use: Minimum length (12+ characters), no other rules
   - ❌ Use: "Must have 1 uppercase, 1 number, 1 symbol" rules
   - **Why**: Length matters most; complexity rules encourage weak patterns (Password1!)

6. **Session Timeout Everywhere**
   - ✅ Use: 8-hour session timeout (shift length)
   - ❌ Use: 15-minute timeout causing constant re-auth
   - **Why**: Operators need to work uninterrupted; reasonable timeout balance

7. **Audit Everything**
   - ✅ Use: Audit classified data access, critical decisions
   - ❌ Use: Log every mouse click, page view, button press
   - **Why**: Excessive logging is noise; focus on security-relevant events

8. **Obfuscate Frontend Code**
   - ✅ Use: Minification (Vite default)
   - ❌ Use: Code obfuscation, string encryption
   - **Why**: Security by obscurity is not security; focus on backend

9. **Client-Side Validation Only**
   - ✅ Use: Client + server validation (redundant is good)
   - ❌ Use: Client-side only (bypassable)
   - **Why**: Always validate server-side; client is convenience only

10. **Store Secrets in Code**
    - ✅ Use: Environment variables, secrets manager
    - ❌ Use: Hardcoded API keys, passwords in code
    - **Why**: Code is version controlled; secrets must be external

---

## Testing Constraints

### ❌ DO NOT Over-Test or Under-Test

1. **100% Code Coverage**
   - ✅ Target: 70-80% coverage on critical paths
   - ❌ Target: 100% coverage including trivial code
   - **Why**: 100% coverage is expensive; focus on high-value tests

2. **Test Private Functions**
   - ✅ Test: Public APIs, user workflows, integration points
   - ❌ Test: Private helper functions, internal utilities
   - **Why**: Test behavior, not implementation; private functions change

3. **Visual Regression Testing**
   - ✅ Test: Manual visual review during development
   - ❌ Build: Automated screenshot comparison, pixel-perfect tests
   - **Why**: Visual regression is fragile; manual review sufficient for MVP

4. **Load Testing**
   - ✅ Test: Manual testing with 10-20 concurrent users
   - ❌ Build: JMeter/Gatling with 1000+ virtual users
   - **Why**: Low concurrent user count; load testing overkill for MVP

5. **Penetration Testing**
   - ✅ Test: Basic security review (OWASP Top 10)
   - ❌ Build: Full pentest, red team exercise
   - **Why**: Pentest is Phase 2+; basic security review sufficient for MVP

6. **Cross-Browser Testing**
   - ✅ Test: Chrome/Edge (primary), Firefox (secondary)
   - ❌ Test: IE11, Safari, Opera, legacy browsers
   - **Why**: Internal app; standardize on modern browsers

7. **Accessibility Testing**
   - ✅ Test: Keyboard navigation, screen reader basics
   - ❌ Test: WCAG 2.1 AAA compliance, full audit
   - **Why**: Operations center is specialist environment; basic accessibility sufficient

8. **Internationalization (i18n)**
   - ✅ Use: English only
   - ❌ Build: Multi-language support, translation system
   - **Why**: NATO standard is English; i18n is unnecessary complexity

9. **Backwards Compatibility**
   - ✅ Use: Latest stable dependencies
   - ❌ Maintain: Support for old API versions, legacy database schemas
   - **Why**: New system; no legacy to support, move fast

10. **Test Data Generators**
    - ✅ Use: Manual mock data creation
    - ❌ Build: Faker.js, synthetic data generators, seed scripts
    - **Why**: Small dataset; manual mocks are sufficient and more realistic

---

## Documentation Constraints

### ❌ DO NOT Over-Document or Under-Document

1. **Auto-Generated API Docs**
   - ✅ Use: Manual Markdown API reference
   - ❌ Build: Swagger/OpenAPI, auto-generated from code
   - **Why**: Manual docs force you to think; auto-gen is often unhelpful

2. **Architecture Decision Records (ADRs)**
   - ✅ Use: Key decisions in implementation plan
   - ❌ Build: Formal ADR process for every decision
   - **Why**: Small team; formal ADRs are overhead

3. **UML Diagrams**
   - ✅ Use: Simple ASCII diagrams, component trees
   - ❌ Build: Formal UML class diagrams, sequence diagrams
   - **Why**: UML is time-consuming; simple diagrams communicate better

4. **User Stories**
   - ✅ Use: Requirements in plain language
   - ❌ Build: Formal user stories, acceptance criteria, story points
   - **Why**: Small project; requirements doc is sufficient

5. **Change Log for Every Commit**
   - ✅ Use: Git commit messages (conventional commits)
   - ❌ Build: Separate CHANGELOG.md updated with every commit
   - **Why**: Git history is the source of truth; CHANGELOG for releases only

6. **Video Tutorials**
   - ✅ Use: Written documentation with screenshots
   - ❌ Build: Video walkthroughs, screencasts
   - **Why**: Video is hard to maintain; text is searchable, updatable

7. **Comments on Every Function**
   - ✅ Use: Comments on complex logic, non-obvious code
   - ❌ Use: Comments on obvious getters, setters, trivial functions
   - **Why**: Good names > comments; comment why, not what

8. **API Versioning**
   - ✅ Use: Single API version (v1)
   - ❌ Build: v1, v2, v3 with deprecation warnings
   - **Why**: New system; no legacy API to support

9. **Database Migration Documentation**
   - ✅ Use: SQL migration files are self-documenting
   - ❌ Build: Separate docs explaining each migration
   - **Why**: Migration SQL is the documentation; keep it readable

10. **Runbook for Every Scenario**
    - ✅ Use: Basic troubleshooting guide
    - ❌ Build: Detailed runbooks for every error condition
    - **Why**: System is simple; comprehensive runbooks come with maturity

---

## Summary: Focus on Value

### ✅ DO THIS
- **Build a focused, operational dashboard** that targeting cell operators love
- **Use existing tools and libraries** rather than rebuilding solved problems
- **Prioritize clarity and speed** over fancy features
- **Test the critical paths** that operators rely on
- **Document what matters** (APIs, workflows, deployment)

### ❌ DON'T DO THIS
- **Build infrastructure** (auth, logging, monitoring from scratch)
- **Integrate with external systems** (DCGS, TBMCS) in MVP
- **Over-engineer** (microservices, caching, CDN when not needed)
- **Add unnecessary features** (3D, animations, gamification)
- **Premature optimization** (test first, optimize later)

---

## When in Doubt

**Ask these questions:**

1. **Does this directly help a targeting cell operator make better decisions faster?**
   - YES → Consider building
   - NO → Defer or skip

2. **Can I use an existing library/tool instead of building custom?**
   - YES → Use existing
   - NO → Validate custom is truly needed

3. **Is this critical for MVP or can it wait for Phase 2?**
   - CRITICAL → Build now
   - NICE TO HAVE → Defer

4. **Will this feature still be valuable in 5 years?**
   - YES → Build solid foundation
   - NO → Build simple, plan to replace

5. **Am I building this because it's needed or because it's interesting?**
   - NEEDED → Build
   - INTERESTING → Resist

---

**Remember**: A good dashboard shows the right information at the right time. A great dashboard shows only the right information and nothing else.

**Ship the MVP. Get feedback. Iterate.**

---

**Version**: 1.0  
**Last Updated**: 2026-01-21  
**Next Review**: After Phase 1 completion
