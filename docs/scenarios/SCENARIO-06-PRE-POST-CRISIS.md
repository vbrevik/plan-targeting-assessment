# Scenario 6: Pre-Crisis vs. Post-Crisis Mode Switching
## "The Gear Shift: From Peacetime Management to Crisis Response"

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Status:** Detailed Design Phase  
**Priority:** P1 (High Value - Critical Capability)  
**Estimated Timeline:** 8-10 months  
**Innovation Level:** ⭐⭐⭐⭐⭐ Very High (Highly Innovative)

---

## Executive Summary

**The Dual Nature of Command:**

Military commanders operate in two fundamentally different modes:

**PRE-CRISIS (Normal Operations):**
- Focus on **long-term** strategic planning
- Manage **routine** operations and maintenance
- Optimize **efficiency** and resource utilization
- Develop **capability** for future needs
- Measure success in **months and years**
- Decision pace: **Hours to days**
- Acceptable risk: **Low to medium**

**POST-CRISIS (Emergency Response):**
- Focus on **immediate** threat response
- Manage **urgent** life-threatening situations
- Prioritize **effectiveness** over efficiency
- Deploy **available** capability NOW
- Measure success in **minutes and hours**
- Decision pace: **Seconds to minutes**
- Acceptable risk: **Medium to high**

**The Core Problem:**

**Current dashboards don't adapt to mode changes:**
```
PRE-CRISIS DASHBOARD:
• Fleet Readiness: 94% 🟢
• Training Status: 87% 🟢
• Budget Execution: 62% 🟢
• Supply Levels: 91% 🟢
• Staff Assignments: [Long table of personnel]
• Monthly Reports: [15 different metrics]

CRISIS HITS (e.g., Natural Disaster)

SAME DASHBOARD (Still showing long-term metrics):
• Fleet Readiness: 94% 🟢  ← Useless in crisis
• Training Status: 87% 🟢   ← Irrelevant right now
• Budget Execution: 62% 🟢  ← Don't care in crisis
• Supply Levels: 91% 🟢     ← Need SPECIFIC supplies, not %

WHAT COMMANDER ACTUALLY NEEDS IN CRISIS:
• Where are my response teams RIGHT NOW?
• What assets are available in next 30 minutes?
• What's the current situation at disaster site?
• What decisions need to be made in next hour?
• What's blocking our response?
```

**The Consequence:**
- Commanders waste critical minutes manually filtering irrelevant information
- Wrong metrics displayed for current operational mode
- Decision-critical information buried under routine reports
- Muscle memory from peacetime doesn't match crisis needs

**This Scenario Addresses:**

An **Adaptive Mode-Switching Dashboard** that:
1. **Auto-detects** crisis situations and switches modes
2. **Transforms display** to show crisis-relevant information
3. **Changes decision support** tools based on operational tempo
4. **Adjusts information granularity** (strategic → tactical)
5. **Modifies time horizons** (long-term → immediate)
6. **Recalibrates metrics** (efficiency → effectiveness)
7. **Enables smooth transition** back to normal operations

**Core Innovation:** Dashboard that **intelligently adapts** its entire information architecture to match the operational mode, not a static display expecting humans to mentally filter.

---

## Problem Statement

### The Mode Mismatch

**Metaphor: Driving Gears**

A car has different gears for different situations:
- **1st gear:** Starting from stop, climbing steep hills (high power, low speed)
- **5th gear:** Highway cruising (low power, high speed)

**Trying to use 5th gear from a stop → Engine stalls**
**Trying to use 1st gear on highway → Engine redlines, inefficient**

**Military Command Equivalent:**

**PRE-CRISIS MODE = 5th Gear (Efficient Cruising)**
- Long planning cycles
- Detailed analysis
- Consensus building
- Risk aversion
- Comprehensive reviews

**CRISIS MODE = 1st Gear (High Power, Immediate Action)**
- Rapid decision cycles
- Quick assessment
- Commander-driven
- Accept higher risk
- Streamlined approvals

**Problem:** Most command dashboards are designed only for "5th gear" and don't shift gears when crisis hits.

### Real-World Case Study: The Earthquake Response

**Fictional but Realistic Scenario:**

```
HEADQUARTERS: Multi-National Division South
DATE: Tuesday, 1430hrs
SITUATION: Routine peacetime operations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRE-CRISIS DASHBOARD (1430hrs - Normal Operations):

┌─────────────────────────────────────────────────────────────┐
│ HEADQUARTERS OPERATIONAL STATUS                              │
│ Week 23, 2026 - Tuesday                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 📊 READINESS OVERVIEW:                                       │
│ • Fleet Readiness: 94% 🟢 GREEN                             │
│ • Personnel Readiness: 92% 🟢 GREEN                         │
│ • Training Currency: 88% 🟢 GREEN                           │
│ • Supply Status: 91% 🟢 GREEN                               │
│ • Budget Execution: 64% 🟢 ON TRACK                         │
│                                                               │
│ 📋 ONGOING OPERATIONS (5):                                   │
│ 1. Exercise Autumn Shield (Week 23-24)                       │
│ 2. Equipment Modernization (Month 6 of 12)                   │
│ 3. Partner Training Program (Ongoing)                        │
│ 4. Routine Security Patrols (Daily)                          │
│ 5. Infrastructure Maintenance (Scheduled)                    │
│                                                               │
│ 📅 UPCOMING MILESTONES:                                      │
│ • Next Week: Equipment inspection (J4)                       │
│ • Next Month: Readiness certification (J3)                   │
│ • Quarter End: Budget review (J8)                            │
│                                                               │
│ 📄 REPORTS PENDING REVIEW (12):                              │
│ • Monthly personnel report (J1)                              │
│ • Quarterly training assessment (J3)                         │
│ • Annual budget projection (J8)                              │
│ • ... [9 more reports]                                        │
│                                                               │
│ 👥 STAFF ASSIGNMENTS (150 personnel):                        │
│ [Long detailed table showing who's assigned where...]        │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Commander: Reviewing monthly training report, sipping coffee ☕
Staff: Working on next quarter's budget projections 📊
Pace: Relaxed, methodical, long-term focus ⏰

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1445hrs: EARTHQUAKE HITS (Magnitude 7.2, 50km away)

Building shakes violently 🌊
Staff scramble 🏃‍♂️💨
Commander drops coffee ☕💥
Alarms blaring 🚨🚨🚨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1446hrs: Commander rushes to Operations Center

Commander: "What's the situation?! What do we know?!"

DASHBOARD STILL SHOWS:
┌─────────────────────────────────────────────────────────────┐
│ HEADQUARTERS OPERATIONAL STATUS                              │
│ Week 23, 2026 - Tuesday                                       │
├─────────────────────────────────────────────────────────────┤
│ 📊 READINESS OVERVIEW:                                       │
│ • Fleet Readiness: 94% 🟢 GREEN                             │
│ ... [same long-term metrics] ...                             │
└─────────────────────────────────────────────────────────────┘

Commander (frustrated): "I don't need to know our budget execution right now! 
  I need to know:
  • Where's my quick reaction force?
  • What helicopters are available NOW?
  • What supplies do we have for disaster response?
  • What's the damage assessment?!"

Staff Officer: "Sir, let me pull up the crisis management checklist..."
  [Fumbles through different screens, looking for crisis procedures]

Commander: "We don't have TIME for this! We need information NOW!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT 15 MINUTES: Chaos
• Staff manually switching to different systems
• Commander asking same questions multiple times
• Information scattered across different displays
• No one sure what the priorities are in crisis mode
• Critical decisions delayed while finding information

RESULT:
• Response delayed by 20 minutes (finding information + figuring out crisis procedures)
• Initial response team dispatched at 1505hrs (should have been 1450hrs)
• 15-minute delay = Lives potentially lost

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT SHOULD HAVE HAPPENED (With Auto Mode-Switching):

1445hrs: EARTHQUAKE HITS

1446hrs: System detects seismic activity + command center alarm

DASHBOARD AUTOMATICALLY SWITCHES TO CRISIS MODE:

┌─────────────────────────────────────────────────────────────┐
│ 🚨 CRISIS RESPONSE MODE ACTIVATED                           │
│ EVENT: Earthquake (Mag 7.2, 50km SW, 1445hrs)                │
│ AUTO-ACTIVATED: Disaster Response Protocols                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚡ IMMEDIATE ACTIONS REQUIRED (Next 30 minutes):            │
│                                                               │
│ 1. ✅ Activate Quick Reaction Force (AUTO-INITIATED)        │
│    • Status: Team alerted, assembling at staging area        │
│    • ETA to ready: 8 minutes                                  │
│                                                               │
│ 2. ⏳ Launch Damage Assessment (Awaiting Commander Approval) │
│    • Helicopter Helo-2 fueled and ready                      │
│    • Assessment team standing by                             │
│    • [APPROVE LAUNCH] ← Commander clicks                    │
│                                                               │
│ 3. ⏳ Request Host Nation Support (Awaiting Commander)       │
│    • Pre-drafted request ready to send                       │
│    • [APPROVE & SEND] ← Commander clicks                    │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                               │
│ 🚁 AVAILABLE RESPONSE ASSETS (Real-Time):                   │
│                                                               │
│ Helicopters: 2 available NOW                                 │
│ • Helo-2: Ready (fueled, crew onboard) - RESERVED for recon │
│ • Helo-3: Ready (fueled, crew 5min away)                     │
│ • Helo-1: Unavailable (maintenance) - ETA: 4 hours           │
│                                                               │
│ Ground Vehicles: 8 trucks available NOW                      │
│ • 4 trucks: Staged at motor pool (crews ready)               │
│ • 4 trucks: Available within 15 minutes                      │
│                                                               │
│ Personnel: Quick Reaction Force (QRF) - 60 personnel         │
│ • Status: Assembling now (ETA: 8 minutes)                    │
│ • Equipment: Search & rescue, medical, engineering           │
│                                                               │
│ Medical: Field Hospital (Mobile)                              │
│ • Status: Packing equipment (ETA: 30 minutes)                │
│ • Capacity: 50 casualties, surgical capability               │
│                                                               │
│ Supplies (Disaster Response Pre-Positioned):                  │
│ • Water: 5,000 liters (ready to load)                        │
│ • Food: 2,000 MREs (ready to load)                           │
│ • Medical: Trauma kits, blood supply (ready)                 │
│ • Shelter: 100 tents (ready to load)                         │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                               │
│ 📍 SITUATION MAP (Live):                                     │
│                                                               │
│ [Interactive map showing:]                                    │
│ • Earthquake epicenter (50km SW)                             │
│ • Affected cities (estimated damage zones)                   │
│ • HQ location + available assets                             │
│ • Response team locations (GPS real-time)                    │
│ • Infrastructure status (roads, bridges - from sensors)      │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                               │
│ ⏰ DECISION TIMELINE (Next 2 Hours):                         │
│                                                               │
│ Now (+0min): Approve damage assessment flight                │
│ +10min: Receive initial damage assessment                    │
│ +15min: Decide scale of response (based on assessment)       │
│ +20min: Request additional support (if needed)               │
│ +30min: First response teams arrive on site                  │
│ +60min: Establish forward operating base                     │
│ +120min: Reassess and adjust response                        │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                               │
│ 🔄 SUSPENDED OPERATIONS (Automatically Paused):              │
│                                                               │
│ • Exercise Autumn Shield: PAUSED (resources redirected)      │
│ • Equipment Modernization: PAUSED (personnel redirected)     │
│ • Routine Patrols: PAUSED (vehicles reallocated)             │
│                                                               │
│ Non-essential operations automatically suspended to free     │
│ resources for crisis response.                                │
│                                                               │
│ [REVIEW SUSPENDED OPS] [MANUALLY ADJUST]                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Commander sees EXACTLY what's needed:
• Immediate actions (auto-initiated and awaiting approval)
• Available assets RIGHT NOW (not monthly readiness %)
• Real-time situation map
• Clear decision timeline
• Non-essential ops suspended automatically

Commander: [Clicks APPROVE LAUNCH and APPROVE & SEND]
  "Perfect. Damage assessment airborne, host nation notified, 
   QRF deploying. Exactly what I needed to see."

Time from earthquake to decisions: 2 minutes ✅
Time to first response team dispatched: 10 minutes ✅
Lives potentially saved: Multiple ❤️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6 HOURS LATER (Response Ongoing):

Commander: "Okay, crisis is under control. Teams are on site, rescue operations 
  proceeding. I need to start thinking about recovery and return to normal ops."

Dashboard: "Crisis appears stabilized. Transition to recovery mode?"
Commander: [Clicks YES]

DASHBOARD TRANSITIONS TO RECOVERY MODE:

┌─────────────────────────────────────────────────────────────┐
│ 🔄 RECOVERY MODE ACTIVE                                      │
│ Transitioning from Crisis Response to Normal Operations      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🚨 CRISIS OPERATIONS (Ongoing - 6 hours):                   │
│ • Response teams on site (60 personnel)                      │
│ • Field hospital operational (25 casualties treated)         │
│ • Rescue operations continuing (estimated 12 more hours)     │
│                                                               │
│ 🔄 RECOVERY ACTIONS (Transitioning):                         │
│                                                               │
│ 1. Plan return of resources to normal operations             │
│    • Which units can be released from response?              │
│    • Timeline for resuming suspended operations?             │
│                                                               │
│ 2. Reconstitute response capability                          │
│    • Restock supplies used in response                       │
│    • Service vehicles/helicopters used                       │
│    • Rest personnel for next potential crisis                │
│                                                               │
│ 3. Resume suspended operations (Priority Order):             │
│    • Exercise Autumn Shield: Resume in 48 hours?             │
│    • Equipment Modernization: Resume immediately (not urgent)│
│    • Routine Patrols: Resume tonight (security requirement)  │
│                                                               │
│ 4. After-Action Review Planning                              │
│    • Schedule debrief (3 days post-crisis)                   │
│    • Capture lessons learned                                 │
│    • Update crisis response procedures                       │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                               │
│ ⏰ TRANSITION TIMELINE (Next 48-72 Hours):                   │
│                                                               │
│ +12h: Last rescue operations complete, focus shifts to relief│
│ +24h: Field hospital transitions to local authorities        │
│ +48h: Most response personnel return to HQ                   │
│ +72h: All resources reconstituted, normal ops resumed        │
│                                                               │
│ [APPROVE TRANSITION PLAN] [ADJUST TIMELINE] [VIEW DETAILS]  │
└─────────────────────────────────────────────────────────────┘

Commander: "Good. I can see the path back to normal. Approve transition plan."

72 HOURS LATER:

DASHBOARD RETURNS TO PRE-CRISIS MODE (Normal Operations):

┌─────────────────────────────────────────────────────────────┐
│ HEADQUARTERS OPERATIONAL STATUS                              │
│ Week 24, 2026 - Friday (3 days post-earthquake)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ✅ CRISIS RESOLVED: Earthquake response completed            │
│    • All personnel returned safely                           │
│    • Resources reconstituted                                 │
│    • After-Action Review scheduled (Monday)                  │
│                                                               │
│ 📊 READINESS OVERVIEW:                                       │
│ • Fleet Readiness: 89% 🟡 YELLOW (↓5% from supplies used)  │
│ • Personnel Readiness: 88% 🟢 GREEN (slight fatigue)        │
│ • Supply Status: 82% 🟡 YELLOW (resupply in progress)      │
│                                                               │
│ 📋 ONGOING OPERATIONS (Resumed):                             │
│ 1. Exercise Autumn Shield (RESUMED - Week 24)                │
│ 2. Equipment Modernization (Ongoing)                         │
│ 3. Partner Training Program (Ongoing)                        │
│ 4. Routine Security Patrols (RESUMED)                        │
│                                                               │
│ Back to normal operations mode ✅                            │
└─────────────────────────────────────────────────────────────┘
```

**Key Difference:**

| Metric | Without Mode-Switching | With Mode-Switching |
|--------|------------------------|---------------------|
| Time to first decision | 20 minutes (finding info) | 2 minutes (auto-displayed) |
| Commander cognitive load | High (manual filtering) | Low (relevant info only) |
| Staff coordination time | 15 min (manual mode switch) | 0 min (automatic) |
| Response deployment time | 35 minutes | 10 minutes |
| Lives potentially saved | Baseline | +Multiple ❤️ |

---

## Detailed Scenario Narrative

### Act 1: The Two Modes

**PRE-CRISIS MODE Characteristics:**

```
INFORMATION PRIORITY: Strategic → Tactical
• Long-term readiness metrics (monthly, quarterly)
• Budget and resource planning (annual cycles)
• Training and certification status
• Personnel assignments and development
• Equipment maintenance schedules
• Strategic coordination (allies, partners)

DECISION PACE: Hours to Days
• Deliberate planning processes
• Staff coordination and consensus
• Detailed analysis and options
• Commander approval after review

RISK TOLERANCE: Low
• Prefer thorough analysis over speed
• Avoid unnecessary risks
• Comprehensive reviews before decisions

METRICS FOCUS: Efficiency
• Cost-effectiveness
• Resource optimization
• Long-term capability development
```

**POST-CRISIS MODE Characteristics:**

```
INFORMATION PRIORITY: Tactical → Strategic
• Real-time situation awareness (NOW)
• Available assets and personnel (minutes)
• Immediate threats and opportunities
• Decision points in next hours
• Resource status (specific, not percentages)
• Coordination (operational, not strategic)

DECISION PACE: Seconds to Minutes
• Rapid decision cycles
• Commander-driven (limited staff coordination)
• Quick assessment tools
• Immediate approval/execution

RISK TOLERANCE: Medium-High
• Accept higher risk for speed/effectiveness
• "Good enough" analysis preferred over "perfect"
• Bias toward action over delay

METRICS FOCUS: Effectiveness
• Mission success (did it work?)
• Lives saved / threats neutralized
• Speed of response
• Adaptability to changing situation
```

### Act 2: The Automatic Mode Switch

**System Architecture for Mode Detection:**

```typescript
enum OperationalMode {
  NORMAL = 'normal',
  HEIGHTENED_ALERT = 'heightened',
  CRISIS = 'crisis',
  RECOVERY = 'recovery'
}

interface ModeTrigger {
  trigger_type: 'automatic' | 'manual' | 'scheduled';
  trigger_source: string;
  confidence: number;  // 0-1
  recommended_mode: OperationalMode;
  reasoning: string;
}

class ModeDetectionEngine {
  async detectMode(): Promise<OperationalMode> {
    const triggers = await this.evaluateAllTriggers();
    
    // Automatic triggers (high confidence = auto-switch)
    const highConfidenceTriggers = triggers.filter(t => t.confidence > 0.9);
    
    if (highConfidenceTriggers.length > 0) {
      // Auto-switch to recommended mode
      const mode = this.selectHighestPriorityMode(highConfidenceTriggers);
      await this.switchMode(mode, { automatic: true, triggers: highConfidenceTriggers });
      return mode;
    }
    
    // Medium confidence triggers (suggest mode switch to commander)
    const mediumConfidenceTriggers = triggers.filter(t => 
      t.confidence >= 0.6 && t.confidence <= 0.9
    );
    
    if (mediumConfidenceTriggers.length > 0) {
      await this.suggestModeSwitch(mediumConfidenceTriggers);
    }
    
    return this.getCurrentMode();
  }
  
  async evaluateAllTriggers(): Promise<ModeTrigger[]> {
    const triggers: ModeTrigger[] = [];
    
    // 1. Sensor-based triggers (earthquakes, explosions, etc.)
    const sensorTriggers = await this.evaluateSensors();
    triggers.push(...sensorTriggers);
    
    // 2. Intel-based triggers (threat warnings)
    const intelTriggers = await this.evaluateIntelligence();
    triggers.push(...intelTriggers);
    
    // 3. Communications-based triggers (emergency calls, alarms)
    const commsTriggers = await this.evaluateCommunications();
    triggers.push(...commsTriggers);
    
    // 4. Activity-based triggers (rapid personnel movements, asset deployments)
    const activityTriggers = await this.evaluateActivity();
    triggers.push(...activityTriggers);
    
    // 5. Manual triggers (commander or staff initiated)
    const manualTriggers = await this.evaluateManualInputs();
    triggers.push(...manualTriggers);
    
    return triggers;
  }
  
  async evaluateSensors(): Promise<ModeTrigger[]> {
    const triggers: ModeTrigger[] = [];
    
    // Seismic sensors
    const seismicData = await this.getSeismicData();
    if (seismicData.magnitude >= 6.0) {
      triggers.push({
        trigger_type: 'automatic',
        trigger_source: 'Seismic Sensor Network',
        confidence: 0.95,  // High confidence (objective measurement)
        recommended_mode: OperationalMode.CRISIS,
        reasoning: `Earthquake detected: Magnitude ${seismicData.magnitude}, ${seismicData.distance}km away. Automatic crisis mode activation.`
      });
    }
    
    // Explosion detection
    const explosionData = await this.getExplosionData();
    if (explosionData.detected && explosionData.yield > 100) {  // kg TNT equivalent
      triggers.push({
        trigger_type: 'automatic',
        trigger_source: 'Acoustic Sensor Network',
        confidence: 0.90,
        recommended_mode: OperationalMode.CRISIS,
        reasoning: `Large explosion detected: ${explosionData.yield}kg TNT equivalent, ${explosionData.location}. Potential attack.`
      });
    }
    
    // Chemical/biological sensors
    const cbrnData = await this.getCBRNData();
    if (cbrnData.threat_level === 'high') {
      triggers.push({
        trigger_type: 'automatic',
        trigger_source: 'CBRN Sensor Array',
        confidence: 0.92,
        recommended_mode: OperationalMode.CRISIS,
        reasoning: `CBRN threat detected: ${cbrnData.agent_type}. Immediate protective measures required.`
      });
    }
    
    return triggers;
  }
  
  async evaluateIntelligence(): Promise<ModeTrigger[]> {
    const triggers: ModeTrigger[] = [];
    
    // Threat intelligence
    const threats = await this.getActiveThreats();
    const highThreats = threats.filter(t => t.severity === 'critical');
    
    if (highThreats.length > 0) {
      triggers.push({
        trigger_type: 'automatic',
        trigger_source: 'Intelligence Assessment',
        confidence: 0.75,  // Lower confidence (subject to interpretation)
        recommended_mode: OperationalMode.HEIGHTENED_ALERT,
        reasoning: `${highThreats.length} critical threat(s) identified. Recommend heightened alert status.`
      });
    }
    
    return triggers;
  }
  
  async evaluateCommunications(): Promise<ModeTrigger[]> {
    const triggers: ModeTrigger[] = [];
    
    // Emergency communications spike
    const commActivity = await this.getCommunicationsActivity();
    if (commActivity.emergency_calls_last_5min > 10) {
      triggers.push({
        trigger_type: 'automatic',
        trigger_source: 'Communications Network',
        confidence: 0.80,
        recommended_mode: OperationalMode.CRISIS,
        reasoning: `Spike in emergency communications: ${commActivity.emergency_calls_last_5min} calls in last 5 minutes. Potential incident.`
      });
    }
    
    // Command post alarm
    if (await this.isAlarmActive()) {
      triggers.push({
        trigger_type: 'automatic',
        trigger_source: 'Command Post Alarm',
        confidence: 0.98,  // Very high confidence
        recommended_mode: OperationalMode.CRISIS,
        reasoning: `Command post alarm activated. Immediate crisis response required.`
      });
    }
    
    return triggers;
  }
}
```

### Act 3: The Recovery Transition

**Transitioning Back to Normal:**

```typescript
class RecoveryTransitionManager {
  async assessReadinessForRecovery(): Promise<RecoveryAssessment> {
    // Evaluate if crisis is winding down
    const crisisIntensity = await this.measureCrisisIntensity();
    
    // Criteria for recovery mode:
    // 1. No active life-threatening situations
    // 2. Response teams deployed and operational
    // 3. Situation stabilized (not escalating)
    // 4. Commander has breathing room for planning
    
    const assessment: RecoveryAssessment = {
      crisis_intensity: crisisIntensity,
      active_threats: await this.getActiveThreats(),
      response_effectiveness: await this.measureResponseEffectiveness(),
      resource_status: await this.getResourceStatus(),
      recommended_transition_time: null,
      reasoning: []
    };
    
    if (crisisIntensity < 30 && assessment.active_threats.length === 0) {
      // Crisis appears over, but need reconstitution time
      assessment.recommended_transition_time = this.estimateRecoveryTime();
      assessment.reasoning.push('Crisis intensity low, no active threats');
      assessment.reasoning.push('Recommend transition to recovery mode');
      assessment.reasoning.push(`Estimated time to full recovery: ${assessment.recommended_transition_time} hours`);
    } else if (crisisIntensity < 50 && assessment.response_effectiveness > 0.8) {
      // Crisis ongoing but well-managed
      assessment.reasoning.push('Crisis ongoing but stabilized');
      assessment.reasoning.push('Maintain crisis mode, prepare for recovery');
    } else {
      // Still in active crisis
      assessment.reasoning.push('Active crisis continues');
      assessment.reasoning.push('Maintain crisis mode');
    }
    
    return assessment;
  }
  
  async generateRecoveryPlan(): Promise<RecoveryPlan> {
    // What needs to happen to return to normal?
    
    const plan: RecoveryPlan = {
      phases: [
        {
          name: 'Stabilization',
          duration_hours: 6,
          objectives: [
            'Complete rescue operations',
            'Establish temporary relief infrastructure',
            'Transition to sustained relief (vs. emergency response)'
          ],
          success_criteria: [
            'No active rescue operations',
            'Relief operations self-sustaining'
          ]
        },
        {
          name: 'Transition',
          duration_hours: 24,
          objectives: [
            'Hand over relief to local/host nation authorities',
            'Begin return of personnel to HQ',
            'Start reconstitution of response capability'
          ],
          success_criteria: [
            'Local authorities in lead role',
            '50% of personnel returned to HQ'
          ]
        },
        {
          name: 'Reconstitution',
          duration_hours: 48,
          objectives: [
            'Restore all personnel to HQ',
            'Restock supplies used in response',
            'Service vehicles and equipment',
            'Resume suspended operations'
          ],
          success_criteria: [
            '100% personnel returned',
            'Response capability at 80%+ readiness',
            'Normal operations resumed'
          ]
        },
        {
          name: 'Lessons Learned',
          duration_hours: 72,
          objectives: [
            'Conduct after-action review',
            'Update crisis response procedures',
            'Recognize outstanding performance',
            'Address identified gaps'
          ],
          success_criteria: [
            'AAR completed',
            'Procedures updated'
          ]
        }
      ],
      total_duration_hours: 150,  // ~6 days total
      resources_required: [
        'Logistics support for reconstitution',
        'Maintenance support for equipment',
        'Personnel time for AAR'
      ]
    };
    
    return plan;
  }
}
```

---

## System Architecture

### Mode-Specific Dashboard Configurations

**Configuration Schema:**

```typescript
interface DashboardConfiguration {
  mode: OperationalMode;
  layout: LayoutConfiguration;
  widgets: WidgetConfiguration[];
  update_frequency_seconds: number;
  decision_support_tools: DecisionSupportTool[];
}

const NORMAL_MODE_CONFIG: DashboardConfiguration = {
  mode: OperationalMode.NORMAL,
  layout: {
    primary_area: 'strategic_overview',  // Top level summaries
    secondary_area: 'long_term_metrics',  // Monthly/quarterly stats
    tertiary_area: 'reports_pending'  // Documents awaiting review
  },
  widgets: [
    { type: 'readiness_overview', priority: 1, timeframe: 'monthly' },
    { type: 'budget_execution', priority: 2, timeframe: 'quarterly' },
    { type: 'training_status', priority: 3, timeframe: 'annual' },
    { type: 'personnel_assignments', priority: 4, detail_level: 'high' },
    { type: 'upcoming_milestones', priority: 5, timeframe: '90_days' }
  ],
  update_frequency_seconds: 300,  // 5 minutes (low frequency)
  decision_support_tools: [
    { type: 'scenario_planning', enabled: true },
    { type: 'resource_optimization', enabled: true },
    { type: 'long_term_forecasting', enabled: true }
  ]
};

const CRISIS_MODE_CONFIG: DashboardConfiguration = {
  mode: OperationalMode.CRISIS,
  layout: {
    primary_area: 'situation_map',  // Real-time tactical picture
    secondary_area: 'immediate_actions',  // Next 30-60 min decisions
    tertiary_area: 'available_resources'  // Assets ready NOW
  },
  widgets: [
    { type: 'situation_map', priority: 1, update_frequency: 30 },  // 30 sec
    { type: 'immediate_actions_required', priority: 2, timeframe: '30_minutes' },
    { type: 'available_assets_now', priority: 3, detail_level: 'specific' },
    { type: 'decision_timeline', priority: 4, timeframe: '2_hours' },
    { type: 'crisis_metrics', priority: 5, update_frequency: 60 }  // 1 min
  ],
  update_frequency_seconds: 30,  // 30 seconds (high frequency)
  decision_support_tools: [
    { type: 'rapid_decision_aid', enabled: true },
    { type: 'resource_allocation_optimizer', enabled: true, mode: 'crisis' },
    { type: 'course_of_action_comparison', enabled: true, simplified: true }
  ]
};

const RECOVERY_MODE_CONFIG: DashboardConfiguration = {
  mode: OperationalMode.RECOVERY,
  layout: {
    primary_area: 'recovery_timeline',  // Path back to normal
    secondary_area: 'crisis_operations_status',  // Winding down
    tertiary_area: 'reconstitution_tasks'  // Restoring capability
  },
  widgets: [
    { type: 'recovery_timeline', priority: 1 },
    { type: 'ongoing_crisis_ops', priority: 2 },
    { type: 'reconstitution_status', priority: 3 },
    { type: 'suspended_ops_resumption', priority: 4 },
    { type: 'lessons_learned_capture', priority: 5 }
  ],
  update_frequency_seconds: 120,  // 2 minutes (medium frequency)
  decision_support_tools: [
    { type: 'recovery_planning', enabled: true },
    { type: 'transition_management', enabled: true },
    { type: 'after_action_review_prep', enabled: true }
  ]
};
```

---

## Success Metrics

### Primary Metrics

1. **Mode Switch Latency**
   - **Target:** <60 seconds from trigger to mode switch
   - **Measurement:** Time from crisis event to dashboard reconfiguration

2. **Decision Time Reduction**
   - **Target:** 70% faster initial crisis decisions
   - **Measurement:** Time to first commander decision (crisis vs. normal)

3. **Information Relevance**
   - **Target:** 95% of displayed information rated "relevant" by commander
   - **Measurement:** Post-incident survey on information usefulness

4. **False Mode Switch Rate**
   - **Target:** <5% inappropriate mode switches
   - **Measurement:** Track mode switches that required immediate manual override

### Secondary Metrics

5. **Recovery Time**
   - **Target:** 90% return to normal operations within projected timeframe
   - **Measurement:** Actual vs. projected recovery time

6. **Commander Cognitive Load**
   - **Target:** 50% reduction in mental filtering effort during crisis
   - **Measurement:** Cognitive load assessment (post-incident)

---

## Implementation Roadmap

### Phase 1: Mode Detection (Months 1-3)
- Build sensor integration
- Implement trigger evaluation
- Create auto-switch logic

### Phase 2: Mode-Specific Configurations (Months 4-6)
- Design crisis mode dashboard
- Design recovery mode dashboard
- Implement dynamic reconfiguration

### Phase 3: Transition Management (Months 7-8)
- Build recovery assessment
- Create transition planning
- Implement smooth mode changes

### Phase 4: Testing & Validation (Months 9-10)
- Exercise-based testing
- Validate trigger accuracy
- User training & refinement

**Total Timeline:** 10 months

---

**End of Scenario 6 Document**

This scenario enables dashboards to intelligently adapt from peacetime management to crisis response and back, matching information architecture to operational mode.
