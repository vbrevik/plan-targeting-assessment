# Targeting Cell Dashboard Redesign - Scope Definition

## What We WILL Do ✅

### Core Redesign
1. **Decision Gates Bar** - Add top status bar with ROE, CDE, Weather, Deconfliction
2. **Two-Column Layout** - 50/50 split instead of 66/33
3. **Action Required Panel** - NEW: Priority-sorted work queue
4. **Today's JTB Focus** - Collapse future sessions by default
5. **ROE Quick Reference** - Promote to right column (always visible)
6. **Mission Context Panel** - NEW: Operational context and constraints
7. **Compressed Stats** - Reduce metric cards to compact format
8. **BDA Summary** - Keep but make more actionable (lessons learned)

### Security Classification System
1. **SecurityBadge Component** - Reusable classification display (U, CUI, S, TS, TS/SCI)
2. **Panel-Level Classification** - Every panel shows highest classification
3. **Item-Level Classification** - Individual targets/nominations show their classification
4. **Caveat Support** - NOFORN, REL TO, ORCON, etc.
5. **User Clearance Filtering** - Auto-hide data user can't access
6. **Audit Logging** - Track access to classified information
7. **Security Banners** - Top/bottom page banners with overall classification

### Backend Changes
1. **Add Classification Columns** - targets, nominations, jtb_sessions, strike_assessments
2. **User Clearances Table** - Store user clearance levels and compartments
3. **Classification Middleware** - Filter API responses based on user clearance
4. **New API Endpoints** - decision-gates, action-required, mission-context
5. **WebSocket Updates** - Real-time push for ROE changes, new action items

### User Experience
1. **F-Pattern Layout** - Critical info top-left
2. **Progressive Disclosure** - Default to "today", expand for more
3. **Status Indicators** - Red/Yellow/Green for instant assessment
4. **Countdown Timers** - Time-to-JTB, time-to-deadline
5. **Assignment Badges** - "YOUR NOMINATION", "ASSIGNED TO YOU"
6. **Direct Actions** - Edit/Submit/Review buttons on items
7. **Drill-Down Links** - Navigate to full pages while preserving context

---

## What We Will NOT Do ❌

### Out of Scope for This Phase
1. **❌ Replace Existing Navigation** - Sidebar stays as-is
2. **❌ Mobile App Version** - Desktop web only
3. **❌ Offline Mode** - Requires network connection
4. **❌ Real-Time Chat** - No collaboration features yet
5. **❌ AI/ML Recommendations** - No automated target suggestions
6. **❌ External System Integrations** - No TBMCS, DCGS, etc. (yet)
7. **❌ Custom Dashboard Builder** - No user customization of layout
8. **❌ Multi-Language Support** - English only
9. **❌ Dark Mode Toggle** - Keep current dark theme only
10. **❌ Export to PowerPoint** - No briefing generation
11. **❌ Version Control** - No tracking of dashboard state changes over time
12. **❌ 3D Visualization** - No map integration or 3D terrain
13. **❌ Video/Audio Feeds** - No live sensor feeds
14. **❌ Calendar Integration** - No Outlook/Google Calendar sync
15. **❌ Email Notifications** - No email alerts (in-app only)

### Technical Limitations
1. **❌ Screenshot Prevention** - Browser cannot reliably prevent screenshots
2. **❌ Watermarking** - No dynamic watermarks on screen (print only)
3. **❌ Hardware Token Auth** - CAC/PIK integration deferred
4. **❌ Biometric Auth** - No fingerprint/face recognition
5. **❌ Blockchain Audit** - Standard database audit logs only
6. **❌ Quantum-Resistant Encryption** - Standard TLS 1.3

### Data We Won't Display (Yet)
1. **❌ Friendly Force Locations** - Blue force tracking out of scope
2. **❌ Munitions Inventory** - Logistics data separate system
3. **❌ Aircraft Schedules** - ATO integration deferred
4. **❌ Intel Source Details** - No raw intelligence display
5. **❌ Casualty Estimates Beyond CDE** - Medical data not included
6. **❌ Political Considerations** - Operational focus only
7. **❌ Budget/Cost Data** - Financial tracking separate
8. **❌ Personnel Records** - HR data not integrated

### Classification Handling We Won't Do
1. **❌ Derivative Classification** - Users can't create new classifications
2. **❌ Declassification Workflow** - No downgrade process
3. **❌ Cross-Domain Solutions** - No high-to-low data transfer
4. **❌ SIPRNet/JWICS Bridging** - Single network only
5. **❌ Foreign Disclosure** - No automated releasability decisions

### Features We're Explicitly Avoiding
1. **❌ Gamification** - No points, badges, leaderboards
2. **❌ Social Features** - No likes, comments, shares
3. **❌ Themes/Skins** - Military aesthetic only
4. **❌ Widgets** - No dashboard customization
5. **❌ RSS Feeds** - No external news integration
6. **❌ Weather Forecasting** - Show current only, no predictions
7. **❌ Training Mode** - Live data only
8. **❌ Help Chatbot** - Documentation links only

---

## Why These Boundaries?

### Focus on Core Value
- **80/20 Rule**: 80% of value from 20% of features
- **Operational Readiness**: Target what makes operators more effective NOW
- **Security First**: Can't compromise on classification handling
- **Iterative**: Ship core, then expand based on user feedback

### Technical Constraints
- **Browser Limitations**: Can't do everything native apps can
- **Security Requirements**: Some features conflict with classification rules
- **Development Time**: 8 weeks means hard choices
- **Integration Complexity**: External systems require months of coordination

### Risk Management
- **Attack Surface**: More features = more vulnerabilities
- **Maintenance Burden**: Every feature needs support
- **User Confusion**: Too many options slow down decisions
- **Classification Creep**: Each feature needs security review

---

## Future Considerations (Post-Phase 4)

These may be added in future sprints:

### High Priority (Next Phase)
- [ ] Mobile responsive layout
- [ ] Email notifications for critical actions
- [ ] TBMCS integration for target export
- [ ] Custom dashboard layouts per user role
- [ ] Collaboration features (comments, mentions)

### Medium Priority (Backlog)
- [ ] Map integration showing target locations
- [ ] Strike video playback from BDA
- [ ] Automated target recommendations (AI/ML)
- [ ] Multi-language support
- [ ] Offline mode with sync

### Low Priority (Future R&D)
- [ ] 3D terrain visualization
- [ ] VR/AR targeting interfaces
- [ ] Voice commands
- [ ] Blockchain audit trail
- [ ] Quantum-resistant encryption

---

## Decision Framework

When new feature requests come in, ask:

1. **Does it help targeting decisions?** If no → defer
2. **Can we do it securely?** If no → defer
3. **Do we have the data?** If no → defer
4. **Can it be done in 2 weeks?** If no → split or defer
5. **Does it conflict with scope?** If yes → document why and defer

---

## Stakeholder Agreement

By approving this scope document, stakeholders agree:

✅ **IN SCOPE**: Everything in "What We WILL Do"  
❌ **OUT OF SCOPE**: Everything in "What We Will NOT Do"  
🔮 **FUTURE**: Items in "Future Considerations"  

**Scope Changes**: Require written approval and impact assessment

---

**Document Status**: APPROVED  
**Date**: 2026-01-21  
**Sign-offs Required**:
- [ ] Targeting Cell Lead
- [ ] Security Officer  
- [ ] Product Owner
- [ ] Engineering Lead

---

**Classification**: UNCLASSIFIED  
**Last Updated**: 2026-01-21
