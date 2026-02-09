# Role Gap Analysis: NATO COPD + Modern Warfare Roles

**Status:** Backlog
**Priority:** High
**Date:** 2026-02-08
**Type:** Feature Gap Analysis
**Sources:** NATO COPD, AJP-3.9, AJP-3.20, AJP-5, Ukraine lessons learned (2022-2026), NATO MDO Concept

---

## Current State: 9 Roles Implemented

| # | Role ID | Name | Sidebar | Dashboard |
|---|---------|------|---------|-----------|
| 1 | `commander` | Commander (CDR) | Yes | Yes (COP Summary) |
| 2 | `j2-intel` | J2 Intelligence Officer | Yes | Yes |
| 3 | `j3-ops` | J3 Operations Officer | Yes | Yes |
| 4 | `j4-log` | J4 Logistics Officer | Yes | **Missing** |
| 5 | `j5-plans` | J5 Plans Officer | Yes | **Missing** |
| 6 | `legad` | Legal Advisor (LEGAD) | Yes | Yes |
| 7 | `targeting-cell` | Targeting Cell | Yes | Yes |
| 8 | `analyst` | Intelligence Analyst | Yes | Yes |
| 9 | `im` | Information Manager | Yes | Yes |

---

## Recommended New Roles

### Tier 1: Should Add (High operational relevance, distinct workflows)

These roles have fundamentally different information needs and workflows that justify a dedicated sidebar and dashboard.

#### 1. POLAD -- Political Advisor
- **NATO Basis:** Personal staff advisor to JFC. Required participant in JTCB (Joint Targeting Coordination Board). Reviews political sensitivity of targeting decisions.
- **Why distinct:** Political assessment is fundamentally different from legal review (LEGAD). POLAD evaluates alliance cohesion, diplomatic implications, escalation risk, media impact. In Ukraine, political considerations drive targeting constraints as much as legal ones.
- **Dashboard focus:** Political sensitivity assessments, national caveat tracker, escalation risk matrix, media impact analysis, diplomatic context briefings
- **Permissions:** `advisory.view`, `targeting.view`, `decision_board.view`, `strategic.view`, `roe.view`

#### 2. J6 Cyber/CIS Officer
- **NATO Basis:** ACOS J6 manages all C4/CIS. Since 2016, NATO recognized cyberspace as an operational domain. The NATO CyOC (Cyberspace Operations Centre) at SHAPE has ~70 personnel. AJP-3.20 governs cyber operations.
- **Why distinct:** Cyber effects are now part of the targeting process. Cyber ISR feeds intelligence. Defensive cyber protects own C2. Ukraine showed that cyber attacks precede and accompany kinetic operations. This role has a completely different toolset and information flow.
- **Dashboard focus:** Network status, cyber threat dashboard, defensive cyber posture, offensive cyber effects tracker (synced with targeting cycle), CIS availability, electromagnetic spectrum status
- **Permissions:** `cyber.view`, `cyber.manage`, `cop.view`, `targeting.view`, `ew.view`

#### 3. J9 CIMIC Officer
- **NATO Basis:** ACOS J9 is responsible for Civil-Military Cooperation. Provides critical input to targeting decisions regarding civilian presence, infrastructure, and humanitarian considerations. NATO CIMIC Functional Planning Guide mandates J9 input to targeting.
- **Why distinct:** Protection of Civilians (PoC) is a NATO priority. J9 provides unique civilian environment data that directly constrains targeting (no-strike lists, protected sites, civilian density). Ukraine highlighted the importance of civilian infrastructure protection.
- **Dashboard focus:** Civilian population density overlays, protected sites/no-strike list, humanitarian corridor status, NGO coordination, civil infrastructure status, cultural property register
- **Permissions:** `cimic.view`, `cimic.manage`, `cop.view`, `targeting.view`, `infrastructure.view`

#### 4. UAS/Drone Coordinator
- **NATO Basis:** Ukraine created a dedicated "drone army" with 60+ attack-drone squadrons. NATO is adopting its first counter-drone doctrine (2025). NAGSF (NATO Alliance Ground Surveillance Force) has ~600 personnel.
- **Why distinct:** Drones have become the dominant sensor AND strike platform. The UAS coordinator manages ISR drone tasking, strike drone allocation, counter-UAS defense, and airspace deconfliction. This is a completely new workflow that didn't exist at this scale before Ukraine.
- **Dashboard focus:** UAS fleet status, ISR coverage map, drone strike queue, counter-UAS threat picture, airspace deconfliction, drone-artillery coordination, FPV operator status
- **Permissions:** `uas.view`, `uas.manage`, `targeting.view`, `isr.view`, `cop.view`, `fires.view`

#### 5. Fires/Effects Coordinator (JFE)
- **NATO Basis:** J3 Fires / Joint Fires Element (JFE) coordinates all joint fire support across domains. This is the primary executor in the targeting cycle. AJP-3.9 Phase 5 (Mission Planning and Force Execution) is centered on this role.
- **Why distinct:** While J3 manages overall operations, the Fires/Effects coordinator has a specialized workflow: weaponeering, effects coordination, fire support coordination measures, ATO integration, sensor-to-shooter kill chains. Ukraine's GIS Arta system was built specifically for this role.
- **Dashboard focus:** Active fire missions, weapon-target pairing, effects assessment, fire support coordination measures (FSCL, CFL), ATO status, kill chain timelines, ammunition status, collateral damage estimation
- **Permissions:** `fires.view`, `fires.manage`, `targeting.view`, `bda.view`, `roe.view`, `cop.view`

### Tier 2: Consider Adding (Relevant, could be phased in later)

These roles are operationally relevant but could initially be handled as variants of existing roles.

#### 6. GENAD -- Gender Advisor
- **NATO Basis:** Mandated by UNSCR 1325 and NATO policy. Increasingly required participant in targeting boards. Assesses differential impact of military actions on civilian populations.
- **Why consider:** NATO mandates gender perspective integration into operations. GENAD reviews targeting decisions for impact on vulnerable populations. However, the workflow is similar to LEGAD/POLAD (advisory review of targeting decisions).
- **Dashboard focus:** Gender impact assessments, vulnerability mapping, population analysis, UNSCR 1325 compliance tracker
- **Permissions:** `advisory.view`, `targeting.view`, `cimic.view`, `cop.view`

#### 7. Chief of Staff (COS)
- **NATO Basis:** Manages and coordinates the entire staff effort. Chairs the JCB and may chair the JTCB. The COS sees everything the Commander sees but focuses on staff coordination rather than command decisions.
- **Why consider:** Different focus than Commander -- COS is about process management, staff synchronization, battle rhythm coordination. Could be a Commander variant with additional staff management tools.
- **Dashboard focus:** Staff coordination tracker, battle rhythm calendar, decision pipeline, cross-staff tasking, meeting agenda management, staff estimates status
- **Permissions:** `*` (all access, similar to Commander)

#### 8. Space Operations Coordinator
- **NATO Basis:** NATO Space Operations Centre (NSpOC) established 2024 at Ramstein. Space recognized as operational domain since 2019. Alliance Persistent Surveillance from Space (APSS) signed by 17 Allies (July 2024).
- **Why consider:** Space provides ISR, communications, PNT, and missile warning. However, this is still an emerging capability and may be too specialized for the current system scope.
- **Dashboard focus:** Satellite coverage windows, space weather, PNT availability, space-based ISR tasking, SATCOM status
- **Permissions:** `space.view`, `isr.view`, `cop.view`

#### 9. EW/Spectrum Coordinator
- **NATO Basis:** Electromagnetic Spectrum Operations Coordinator (EMSCA) is designated by JFCs. NATO JEWCS (Joint Electronic Warfare Core Staff) provides EW expertise. Ukraine showed battalion-scale distributed EW is decisive.
- **Why consider:** EW is critical to both drone operations and cyber. However, EW coordination could be a specialized view within J6 or J3 rather than a standalone role.
- **Dashboard focus:** Spectrum usage map, jamming coverage, friendly/hostile emitter tracking, EW asset status, frequency deconfliction
- **Permissions:** `ew.view`, `ew.manage`, `cop.view`, `cyber.view`

#### 10. StratCom/Info Ops Officer
- **NATO Basis:** J10 or StratCom Advisor. NATO published first StratCom fundamentals doctrine in 2024. Information environment is now considered a dimension alongside physical domains.
- **Why consider:** Information operations and cognitive warfare are increasingly part of the targeting process (non-kinetic effects). Ukraine's information war has been as important as the kinetic fight.
- **Dashboard focus:** Narrative tracking, information activities coordination, PSYOPS campaign status, media monitoring, disinformation detection, cognitive warfare indicators
- **Permissions:** `stratcom.view`, `stratcom.manage`, `cop.view`, `targeting.view`

### Tier 3: Not Recommended as Standalone Roles

These are operationally relevant but too specialized or overlap significantly with existing roles.

| Role | Reason | Covered By |
|------|--------|------------|
| J1 Personnel | Not core to targeting/planning system | Commander (admin view) |
| J7 Training | Not core to operational C2 | Out of scope |
| J8 Resources | Financial/resource focus | Commander (admin view) |
| MEDAD (Medical Advisor) | Specialized input to targeting (hospitals as protected sites) | J9 CIMIC (protected sites list) |
| CULAD (Cultural Advisor) | Protected cultural sites | J9 CIMIC (protected sites list) |
| RELAD (Religious Advisor) | Protected religious sites | J9 CIMIC (protected sites list) |
| SCIAD (Science Advisor) | Too specialized | J2 or J6 |
| Component Commanders (JFACC, JFLCC, JFMCC, JFSOCC) | Component-level, not JFC staff | Could be permission variants of Commander |
| OSINT Analyst | Specialized J2 function | J2 or Analyst role |
| SOCMINT Analyst | Specialized J2 function | J2 or Analyst role |
| Kill Chain Automation Specialist | Specialized targeting function | Targeting Cell or Fires Coordinator |
| Counter-Battery Coordinator | Specialized fires function | Fires/Effects Coordinator |
| C-UAS Operator | Specialized UAS function | UAS Coordinator |

---

## Summary: Proposed Role Roster (14 roles)

### Updated Role List

| # | Role ID | Name | Short | Color | Status |
|---|---------|------|-------|-------|--------|
| 1 | `commander` | Commander | CDR | red | **Existing** |
| 2 | `j2-intel` | J2 Intelligence Officer | J2 | blue | **Existing** |
| 3 | `j3-ops` | J3 Operations Officer | J3 | green | **Existing** |
| 4 | `j4-log` | J4 Logistics Officer | J4 | amber | **Existing** (needs dashboard) |
| 5 | `j5-plans` | J5 Plans Officer | J5 | purple | **Existing** (needs dashboard) |
| 6 | `j6-cyber` | J6 Cyber/CIS Officer | J6 | indigo | **NEW** |
| 7 | `j9-cimic` | J9 CIMIC Officer | J9 | emerald | **NEW** |
| 8 | `legad` | Legal Advisor (LEGAD) | LEGAD | slate | **Existing** |
| 9 | `polad` | Political Advisor (POLAD) | POLAD | rose | **NEW** |
| 10 | `targeting-cell` | Targeting Cell | TC | orange | **Existing** |
| 11 | `fires` | Fires/Effects Coordinator | JFE | red | **NEW** |
| 12 | `uas` | UAS/Drone Coordinator | UAS | sky | **NEW** |
| 13 | `analyst` | Intelligence Analyst | ANLY | cyan | **Existing** |
| 14 | `im` | Information Manager | IM | teal | **Existing** |

### Change Summary
- **Keep:** 9 existing roles (fix J4/J5 missing dashboards)
- **Add Tier 1:** 5 new roles (POLAD, J6 Cyber, J9 CIMIC, UAS Coordinator, Fires/Effects)
- **Consider Tier 2:** 5 additional roles for future phases (GENAD, COS, Space Ops, EW, StratCom)

---

## Implementation Priority

### Phase 1: Fix Existing Gaps
1. Create J4 dashboard (`mshnctrl.j4-dashboard.tsx`)
2. Create J5 dashboard (`mshnctrl.j5-dashboard.tsx`)

### Phase 2: Add Tier 1 Roles (Highest Impact)
3. Add POLAD role + sidebar + dashboard
4. Add J6 Cyber role + sidebar + dashboard
5. Add J9 CIMIC role + sidebar + dashboard
6. Add UAS/Drone Coordinator role + sidebar + dashboard
7. Add Fires/Effects Coordinator role + sidebar + dashboard

### Phase 3: Add Tier 2 Roles (Stretch)
8. Add GENAD role
9. Add COS role
10. Add Space Operations role
11. Add EW/Spectrum role
12. Add StratCom/Info Ops role

---

## Implementation Checklist Per New Role

For each new role, the following files need to be created/modified:

### Files to Create
- [ ] `frontend/src/routes/mshnctrl.{role-id}-dashboard.tsx` -- Dashboard route
- [ ] Navigation config entry in `frontend/src/features/layout/config/navigation.config.ts`

### Files to Modify
- [ ] `frontend/src/lib/mshnctrl/hooks/useRoleContext.tsx` -- Add role to `AVAILABLE_ROLES`
- [ ] `frontend/src/features/shared/RoleSelector.tsx` -- May need icon updates
- [ ] `frontend/src/routeTree.gen.ts` -- Auto-generated, will update on build

### Optional Backend Work
- [ ] Add role-specific API endpoints if needed
- [ ] Add role to seed data / migrations
- [ ] Update ABAC permissions for new role

---

## References

### NATO Doctrine
- **COPD**: Comprehensive Operations Planning Directive (Joint staff structure)
- **AJP-3.9**: Allied Joint Doctrine for Joint Targeting (Targeting cycle, JTCB)
- **AJP-3.20**: Allied Joint Doctrine for Cyberspace Operations
- **AJP-5**: Allied Joint Doctrine for Planning of Operations
- **UNSCR 1325**: Women, Peace and Security (GENAD mandate)

### NATO Organizational
- NATO CyOC: ~70 personnel at SHAPE
- NATO NSpOC: Established 2024 at Ramstein
- NATO NAGSF: ~600 personnel (drone ISR)
- NATO NICC: Cyber Defence Centre (operational by 2028)
- NATO JEWCS: Electronic Warfare Core Staff

### Ukraine Lessons Learned
- Ukraine's "drone army": 60+ FPV squadrons at brigade level
- GIS Arta / Kropyva: Sensor-to-shooter fire coordination apps
- Counter-UAS: NATO's first counter-drone doctrine (2025)
- Cyber domain: Attacks precede and accompany kinetic operations
- Information warfare: As decisive as kinetic operations
- Civilian infrastructure: Critical infrastructure protection is a NATO priority
- Distributed EW: Battalion-scale distributed jamming is decisive
