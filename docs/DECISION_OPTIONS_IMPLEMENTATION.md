# Decision Options & Consequences Implementation Guide

## Overview

Based on the scenarios created (particularly Scenarios 3 and 8), every critical decision in the dashboard should present the commander with:
1. **Multiple options** (typically 3-5 alternatives)
2. **Primary consequences** for each option (immediate, direct impacts)
3. **Secondary consequences** (cascading, indirect, long-term impacts)
4. **Trade-off analysis** across multiple accountability dimensions
5. **Risk assessment** and confidence scoring

This document provides implementation specifications for integrating decision trees into the Situation Awareness Cockpit.

---

## Decision Structure Model

### Data Schema

```typescript
// Core Decision Type
interface Decision {
  id: UUID;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  complexity: 'high' | 'medium' | 'low';
  deadline?: string; // ISO datetime
  context: DecisionContext;
  options: DecisionOption[];
  riskFactors: RiskFactor[];
  requiredApprovers: string[]; // User IDs
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred';
  createdAt: string;
  createdBy: string;
}

// Decision Context (what this decision is about)
interface DecisionContext {
  category: 'strike' | 'maneuver' | 'resource_allocation' | 'policy' | 'personnel';
  relatedEntityIds: UUID[]; // Links to targets, units, operations, etc.
  backgroundBriefId?: UUID; // Link to detailed briefing
  triggeringEvent?: string; // What caused this decision to be needed
  stakeholders: Stakeholder[];
  politicalSensitivity: 'high' | 'medium' | 'low';
  mediaVisibility: 'high' | 'medium' | 'low';
}

// Stakeholder affected by or involved in decision
interface Stakeholder {
  name: string;
  role: string;
  impact: 'direct' | 'indirect';
  mustConsult: boolean;
}

// Each option available to the commander
interface DecisionOption {
  id: UUID;
  label: string; // "APPROVE", "DEFER 24H", "MODIFY & APPROVE", "REJECT"
  description: string;
  recommended: boolean; // System recommendation based on analysis
  immediateConsequences: Consequence[];
  secondaryConsequences: Consequence[];
  resourceRequirements?: ResourceRequirement[];
  timeline: Timeline;
  confidence: number; // 0-1, AI/system confidence in consequence predictions
  precedents?: string[]; // Similar past decisions
}

// A specific consequence (positive or negative)
interface Consequence {
  domain: 'operational' | 'political' | 'economic' | 'environmental' | 'personnel' | 'legal';
  type: 'positive' | 'negative' | 'neutral';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  likelihood: number; // 0-1 probability
  impactScore: number; // -100 to +100
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  affectedMetrics?: string[]; // Links to balanced scorecard metrics
  cascades?: Consequence[]; // Secondary consequences triggered by this one
}

// Resource requirements for an option
interface ResourceRequirement {
  resourceType: 'personnel' | 'equipment' | 'budget' | 'time';
  quantity: number;
  unit: string;
  availability: 'available' | 'constrained' | 'unavailable';
  conflict?: string; // Description of resource conflict if exists
}

// Timeline for option execution and consequences
interface Timeline {
  executionDuration: string; // "30 minutes", "6 hours", "3 days"
  firstImpactTime: string; // When first consequences appear
  fullImpactTime: string; // When all consequences manifest
  reversibilityWindow?: string; // How long to reverse if needed
}

// Risk factor that should influence the decision
interface RiskFactor {
  id: UUID;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'political' | 'operational' | 'legal' | 'environmental' | 'safety';
  mitigation?: string; // How to reduce this risk
  detected_by: 'system' | 'human' | 'ai';
}

// Trade-off analysis across balanced scorecard dimensions
interface TradeOffAnalysis {
  dimensions: {
    operational: DimensionImpact;
    personnel: DimensionImpact;
    budget: DimensionImpact;
    environmental: DimensionImpact;
    political: DimensionImpact;
    legal: DimensionImpact;
  };
  overallScore: number; // -100 to +100
  recommendedOption: UUID; // Option ID
}

interface DimensionImpact {
  currentScore: number; // 0-100
  projectedImpact: number; // -50 to +50
  newScore: number; // currentScore + projectedImpact
  threshold: number; // Minimum acceptable score
  breachesThreshold: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low'; // Based on operational context
}
```

---

## Visual Design: Decision Card in Dashboard

### Tier 1 (Critical Zone) - Compact View

When decision appears in Critical Actions zone:

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 DECISION REQUIRED                                     │
│                                                          │
│ Strike T-1002 Authorization                             │
│ High-value enemy command post                           │
│                                                          │
│ 🔴 3 options available                                   │
│ ⚠️  4 risk factors detected                             │
│ ⏰ Deadline: 6 hours                                     │
│                                                          │
│ [VIEW OPTIONS & ANALYSIS] ──────────────────────────→   │
└─────────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- Red border (critical urgency)
- Pulse animation on "3 options available" if new
- Badge count for risk factors
- Prominent "VIEW OPTIONS" button

### Expanded View - Decision Analysis Panel

When user clicks "VIEW OPTIONS", open full-screen decision panel:

```
┌───────────────────────────────────────────────────────────────────────┐
│ ◀ Back to Dashboard         DECISION ANALYSIS                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ Strike T-1002 Authorization                                           │
│ High-value enemy command post near civilian infrastructure            │
│                                                                        │
│ Created: 2026-01-21 14:30Z by J3 Ops | Deadline: 6 hours             │
│ Stakeholders: LEGAD, POLAD, J2, J4 (aviation) | Briefing: B-STRIKE-12│
│                                                                        │
├───────────────────────────────────────────────────────────────────────┤
│ ⚠️  RISK FACTORS DETECTED (4)                                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ 🔴 CRITICAL: Conflicts with Presidential Ultimatum guidance           │
│    Mitigation: Coordinate with POLAD before approval                  │
│                                                                        │
│ 🟠 HIGH: 200m from civilian hospital                                  │
│    Mitigation: Use precision munition + pre-strike warning            │
│                                                                        │
│ 🟡 MEDIUM: Target assessment 48h old (may be outdated)                │
│    Mitigation: Request updated imagery from J2                        │
│                                                                        │
│ 🟡 MEDIUM: High probability negative international media              │
│    Mitigation: Prepare coordinated messaging strategy                 │
│                                                                        │
├───────────────────────────────────────────────────────────────────────┤
│ 📊 OPTIONS ANALYSIS                                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ┌─ OPTION 1: APPROVE STRIKE (AS PLANNED) ───────────────────────┐   │
│ │                                                                 │   │
│ │ Execute strike within 6 hours using current plan               │   │
│ │                                                                 │   │
│ │ ✅ POSITIVE CONSEQUENCES (Immediate)                            │   │
│ │  • High-value target neutralized (80% confidence)              │   │
│ │    Impact: +40 Operational Effectiveness                       │   │
│ │  • Enemy C2 disrupted 24-48h                                   │   │
│ │    Impact: +25 Tactical Advantage                              │   │
│ │                                                                 │   │
│ │ ❌ NEGATIVE CONSEQUENCES (Immediate)                            │   │
│ │  • Civilian casualties likely (60% probability)                │   │
│ │    Impact: -30 Political Capital                               │   │
│ │  • International media backlash                                │   │
│ │    Impact: -25 Info Dominance                                  │   │
│ │                                                                 │   │
│ │ ⚠️  SECONDARY CONSEQUENCES (24-72h)                             │   │
│ │  • Presidential Ultimatum compromised                          │   │
│ │    Cascades to: Ministerial intervention required (-40 Political)│  │
│ │  • Campaign objective "Info Dominance" at risk                 │   │
│ │    Cascades to: Extended operation duration (+2 weeks)         │   │
│ │  • Force morale impact if civilian casualties                  │   │
│ │    Cascades to: Retention risk (-5% Personnel Satisfaction)    │   │
│ │                                                                 │   │
│ │ 📊 TRADE-OFF ANALYSIS                                           │   │
│ │  Operational:   87% → 92% (+5%)  🟢 Above threshold            │   │
│ │  Political:     75% → 50% (-25%) 🔴 BREACHES threshold (60%)   │   │
│ │  Personnel:     83% → 80% (-3%)  🟢 Above threshold            │   │
│ │  Legal:         100% → 100% (0%) 🟢 Compliant                  │   │
│ │                                                                 │   │
│ │ ⏰ TIMELINE                                                      │   │
│ │  • Execution: 30 minutes (aircraft to target)                  │   │
│ │  • First impact: Immediate (target destruction)                │   │
│ │  • Full impact: 72 hours (political fallout manifests)         │   │
│ │  • Reversibility: NONE (kinetic action irreversible)           │   │
│ │                                                                 │   │
│ │ 💼 RESOURCES REQUIRED                                           │   │
│ │  • 2x F-35 aircraft (Available ✅)                              │   │
│ │  • 4x Precision munitions (Available ✅)                        │   │
│ │  • POLAD/LEGAD time (Not consulted ⚠️ )                         │   │
│ │                                                                 │   │
│ │ 🎯 OVERALL SCORE: +10 (Positive but risky)                      │   │
│ │ 🤖 SYSTEM RECOMMENDATION: NOT RECOMMENDED                       │   │
│ │    Reason: Political threshold breach, reversible alternatives  │   │
│ │                                                                 │   │
│ │ [APPROVE & EXECUTE] ────────────────────────────────────────→  │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌─ OPTION 2: DEFER 24H + COORDINATE (RECOMMENDED) ✅ ───────────┐   │
│ │                                                                 │   │
│ │ Delay strike 24 hours to coordinate with POLAD and update      │   │
│ │ target assessment                                              │   │
│ │                                                                 │   │
│ │ ✅ POSITIVE CONSEQUENCES (Immediate)                            │   │
│ │  • Political coordination achieved                             │   │
│ │    Impact: +15 Political Capital                               │   │
│ │  • Updated target assessment                                   │   │
│ │    Impact: +10 Strike Confidence                               │   │
│ │  • Messaging strategy prepared                                 │   │
│ │    Impact: +20 Info Dominance                                  │   │
│ │                                                                 │   │
│ │ ❌ NEGATIVE CONSEQUENCES (Immediate)                            │   │
│ │  • Target may relocate (20% probability)                       │   │
│ │    Impact: -15 Operational Effectiveness (if relocates)        │   │
│ │  • 24h delay in campaign timeline                              │   │
│ │    Impact: -5 Momentum                                         │   │
│ │                                                                 │   │
│ │ ⚠️  SECONDARY CONSEQUENCES (24-72h)                             │   │
│ │  • Modified strike with lower civilian risk                    │   │
│ │    Cascades to: Higher force morale (+5% Personnel)            │   │
│ │  • Political support maintained                                │   │
│ │    Cascades to: Continued resource support (Budget stable)     │   │
│ │  • If target relocates: Alternative targets available          │   │
│ │    Cascades to: Extended targeting cycle (+48h)                │   │
│ │                                                                 │   │
│ │ 📊 TRADE-OFF ANALYSIS                                           │   │
│ │  Operational:   87% → 85% (-2%)  🟢 Above threshold            │   │
│ │  Political:     75% → 82% (+7%)  🟢 Above threshold            │   │
│ │  Personnel:     83% → 85% (+2%)  🟢 Above threshold            │   │
│ │  Legal:         100% → 100% (0%) 🟢 Compliant                  │   │
│ │                                                                 │   │
│ │ ⏰ TIMELINE                                                      │   │
│ │  • Coordination: 6 hours (POLAD/LEGAD consultation)            │   │
│ │  • Updated assessment: 12 hours (J2 imagery collection)        │   │
│ │  • Modified strike: 24 hours from now                          │   │
│ │  • Reversibility: 24 hours (can still cancel)                  │   │
│ │                                                                 │   │
│ │ 💼 RESOURCES REQUIRED                                           │   │
│ │  • POLAD consultation: 2 hours (Available ✅)                   │   │
│ │  • LEGAD review: 1 hour (Available ✅)                          │   │
│ │  • J2 updated imagery: 4 hours (Available ✅)                   │   │
│ │  • Aircraft (deferred 24h): Frees for other missions ✅        │   │
│ │                                                                 │   │
│ │ 🎯 OVERALL SCORE: +25 (Positive, balanced)                      │   │
│ │ 🤖 SYSTEM RECOMMENDATION: ✅ RECOMMENDED                         │   │
│ │    Reason: Balanced approach, maintains all thresholds          │   │
│ │                                                                 │   │
│ │ [DEFER 24H & COORDINATE] ───────────────────────────────────→  │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌─ OPTION 3: MODIFY STRIKE & APPROVE ────────────────────────────┐   │
│ │                                                                 │   │
│ │ Approve with modifications: precision munition + civilian      │   │
│ │ warning + POLAD coordination (expedited)                       │   │
│ │                                                                 │   │
│ │ ✅ POSITIVE CONSEQUENCES (Immediate)                            │   │
│ │  • Target neutralized within 12 hours                          │   │
│ │    Impact: +35 Operational Effectiveness                       │   │
│ │  • Reduced civilian casualty risk (20% probability)            │   │
│ │    Impact: -5 Political Capital (vs -30 unmodified)            │   │
│ │  • Maintains campaign momentum                                 │   │
│ │    Impact: +10 Momentum                                        │   │
│ │                                                                 │   │
│ │ ❌ NEGATIVE CONSEQUENCES (Immediate)                            │   │
│ │  • 6h delay (expedited coordination)                           │   │
│ │    Impact: -5 Operational Speed                                │   │
│ │  • Precision munition cost +$500K                              │   │
│ │    Impact: -0.5% Budget                                        │   │
│ │  • Target may be alerted by civilian warning                   │   │
│ │    Impact: -10 Surprise (reduced effectiveness)                │   │
│ │                                                                 │   │
│ │ ⚠️  SECONDARY CONSEQUENCES (24-72h)                             │   │
│ │  • Political support maintained (expedited coordination)       │   │
│ │    Cascades to: Continued operations authority                 │   │
│ │  • Media narrative managed (civilian warning shows care)       │   │
│ │    Cascades to: +10 Info Dominance                             │   │
│ │  • If target alerted: Partial effectiveness only               │   │
│ │    Cascades to: May require re-strike (+$1M, +48h)             │   │
│ │                                                                 │   │
│ │ 📊 TRADE-OFF ANALYSIS                                           │   │
│ │  Operational:   87% → 90% (+3%)  🟢 Above threshold            │   │
│ │  Political:     75% → 73% (-2%)  🟢 Above threshold            │   │
│ │  Budget:        95% → 94.5% (-0.5%) 🟢 Above threshold         │   │
│ │  Legal:         100% → 100% (0%) 🟢 Compliant                  │   │
│ │                                                                 │   │
│ │ ⏰ TIMELINE                                                      │   │
│ │  • Coordination: 2 hours (expedited POLAD)                     │   │
│ │  • Civilian warning: 30 minutes                                │   │
│ │  • Execution: 12 hours from now                                │   │
│ │  • Reversibility: 6 hours (before civilian warning)            │   │
│ │                                                                 │   │
│ │ 💼 RESOURCES REQUIRED                                           │   │
│ │  • Precision munition: +$500K (Available ✅)                    │   │
│ │  • Expedited POLAD: 2 hours (Requires priority ⚠️ )            │   │
│ │  • Civilian warning system: Ready ✅                            │   │
│ │  • Aircraft: 2x F-35 (Available ✅)                             │   │
│ │                                                                 │   │
│ │ 🎯 OVERALL SCORE: +18 (Positive, compromise)                    │   │
│ │ 🤖 SYSTEM RECOMMENDATION: ⚠️  ACCEPTABLE ALTERNATIVE             │   │
│ │    Reason: Balanced, faster than Option 2, safer than Option 1  │   │
│ │                                                                 │   │
│ │ [MODIFY & APPROVE] ──────────────────────────────────────────→ │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌─ OPTION 4: REJECT STRIKE ──────────────────────────────────────┐   │
│ │                                                                 │   │
│ │ Do not execute strike, seek alternative courses of action      │   │
│ │                                                                 │   │
│ │ ✅ POSITIVE CONSEQUENCES (Immediate)                            │   │
│ │  • No civilian casualty risk                                   │   │
│ │    Impact: +0 Political (neutral)                              │   │
│ │  • No political fallout                                        │   │
│ │    Impact: +0 Political (preserved)                            │   │
│ │  • Resources freed for other missions                          │   │
│ │    Impact: +10 Resource Availability                           │   │
│ │                                                                 │   │
│ │ ❌ NEGATIVE CONSEQUENCES (Immediate)                            │   │
│ │  • Target remains operational                                  │   │
│ │    Impact: -40 Operational Effectiveness                       │   │
│ │  • Enemy C2 continues functioning                              │   │
│ │    Impact: -20 Tactical Advantage                              │   │
│ │  • Campaign objective "Hostile Neutralized" delayed            │   │
│ │    Impact: -15 Campaign Progress                               │   │
│ │                                                                 │   │
│ │ ⚠️  SECONDARY CONSEQUENCES (24-72h)                             │   │
│ │  • Alternative targeting required                              │   │
│ │    Cascades to: Extended targeting cycle (+3-5 days)           │   │
│ │  • Opportunity cost (target may harden defenses)               │   │
│ │    Cascades to: More difficult strike later (+$2M, +risk)      │   │
│ │  • Staff morale impact (prepared strike cancelled)             │   │
│ │    Cascades to: -5% Personnel Satisfaction                     │   │
│ │                                                                 │   │
│ │ 📊 TRADE-OFF ANALYSIS                                           │   │
│ │  Operational:   87% → 75% (-12%) 🟡 Near threshold (70%)       │   │
│ │  Political:     75% → 75% (0%)   🟢 Maintained                 │   │
│ │  Personnel:     83% → 80% (-3%)  🟢 Above threshold            │   │
│ │  Legal:         100% → 100% (0%) 🟢 Compliant                  │   │
│ │                                                                 │   │
│ │ ⏰ TIMELINE                                                      │   │
│ │  • Immediate: No strike executed                               │   │
│ │  • Alternative targeting: 3-5 days                             │   │
│ │  • Campaign delay: +1 week                                     │   │
│ │  • Reversibility: Fully reversible (can re-propose later)      │   │
│ │                                                                 │   │
│ │ 💼 RESOURCES REQUIRED                                           │   │
│ │  • None (strike cancelled)                                     │   │
│ │  • Alternative targeting analysis: J2 (3-5 days)               │   │
│ │                                                                 │   │
│ │ 🎯 OVERALL SCORE: -25 (Negative, risk-averse)                   │   │
│ │ 🤖 SYSTEM RECOMMENDATION: ❌ NOT RECOMMENDED                     │   │
│ │    Reason: High operational cost, minimal political benefit     │   │
│ │                                                                 │   │
│ │ [REJECT STRIKE] ─────────────────────────────────────────────→ │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
├───────────────────────────────────────────────────────────────────────┤
│ 🧠 DECISION SUPPORT                                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ⚠️  COGNITIVE LOAD WARNING                                            │
│ • You've been on duty 12h 18m (High Fatigue Zone)                    │
│ • Consider consulting Deputy Commander (available now)                │
│ • Or defer decision 2h + take 20min break (improves quality 25%)     │
│                                                                        │
│ 📊 SIMILAR PAST DECISIONS (3 precedents found)                        │
│ • Strike AUTH-445 (2025-11): Deferred 24h → Success, zero casualties │
│ • Strike AUTH-318 (2025-09): Approved modified → Partial success     │
│ • Strike AUTH-201 (2025-06): Approved as-is → Political fallout      │
│                                                                        │
│ 🤖 AI CONFIDENCE: 78% (High)                                           │
│ Based on 127 similar decisions, 89 environmental factors, 34 metrics  │
│                                                                        │
│ [EXPORT ANALYSIS AS PDF] [SHARE WITH STAFF] [REQUEST CONSULTATION]   │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Architecture

### Backend Components

#### 1. Decision Engine Service

```rust
// Rust backend implementation
pub struct DecisionEngine {
    pub consequence_predictor: ConsequencePredictor,
    pub trade_off_analyzer: TradeOffAnalyzer,
    pub resource_checker: ResourceAvailabilityChecker,
    pub risk_detector: RiskFactorDetector,
    pub precedent_matcher: PrecedentMatcher,
}

impl DecisionEngine {
    pub async fn analyze_decision(&self, decision_id: UUID) -> DecisionAnalysis {
        // 1. Load decision context
        let decision = self.load_decision(decision_id).await?;
        
        // 2. For each option, predict consequences
        let mut analyzed_options = Vec::new();
        for option in decision.options {
            let immediate = self.consequence_predictor
                .predict_immediate(&option, &decision.context).await?;
            let secondary = self.consequence_predictor
                .predict_secondary(&immediate, &decision.context).await?;
            let trade_offs = self.trade_off_analyzer
                .analyze(&option, &immediate, &secondary).await?;
            let resources = self.resource_checker
                .check_availability(&option.resource_requirements).await?;
            
            analyzed_options.push(AnalyzedOption {
                option,
                immediate_consequences: immediate,
                secondary_consequences: secondary,
                trade_off_analysis: trade_offs,
                resource_availability: resources,
                overall_score: self.calculate_score(&trade_offs),
            });
        }
        
        // 3. Detect risk factors
        let risk_factors = self.risk_detector
            .detect(&decision, &analyzed_options).await?;
        
        // 4. Find similar precedents
        let precedents = self.precedent_matcher
            .find_similar(&decision, 5).await?;
        
        // 5. Generate recommendation
        let recommendation = self.generate_recommendation(
            &analyzed_options, 
            &risk_factors
        );
        
        DecisionAnalysis {
            decision_id,
            analyzed_options,
            risk_factors,
            precedents,
            recommendation,
            ai_confidence: self.calculate_confidence(&analyzed_options),
        }
    }
}
```

#### 2. Consequence Prediction Engine

```rust
pub struct ConsequencePredictor {
    // Machine learning models
    operational_model: MLModel,
    political_model: MLModel,
    environmental_model: MLModel,
    
    // Historical database
    historical_decisions: DecisionDatabase,
    
    // Real-time data feeds
    current_metrics: MetricsService,
}

impl ConsequencePredictor {
    pub async fn predict_immediate(
        &self, 
        option: &DecisionOption,
        context: &DecisionContext
    ) -> Vec<Consequence> {
        // Use ML models to predict immediate consequences
        let mut consequences = Vec::new();
        
        // Operational impact
        if let Some(operational) = self.operational_model
            .predict(option, context).await {
            consequences.push(operational);
        }
        
        // Political impact
        if context.political_sensitivity == "high" {
            if let Some(political) = self.political_model
                .predict(option, context).await {
                consequences.push(political);
            }
        }
        
        // ... other domains
        
        consequences
    }
    
    pub async fn predict_secondary(
        &self,
        immediate: &[Consequence],
        context: &DecisionContext
    ) -> Vec<Consequence> {
        // Predict cascading consequences
        let mut secondary = Vec::new();
        
        for consequence in immediate {
            // Check if this consequence cascades
            if let Some(cascades) = self.check_cascade_patterns(
                consequence, 
                context
            ).await {
                secondary.extend(cascades);
            }
        }
        
        secondary
    }
    
    async fn check_cascade_patterns(
        &self,
        consequence: &Consequence,
        context: &DecisionContext
    ) -> Option<Vec<Consequence>> {
        // Example: Political fallout → Resource constraints
        if consequence.domain == "political" && 
           consequence.type == "negative" &&
           consequence.impact_score < -20 {
            Some(vec![
                Consequence {
                    domain: "budget",
                    type: "negative",
                    description: "Budget scrutiny increased, approval delays".to_string(),
                    likelihood: 0.6,
                    impact_score: -15,
                    timeframe: "medium_term",
                    ...
                }
            ])
        } else {
            None
        }
    }
}
```

#### 3. Trade-Off Analysis Engine

```rust
pub struct TradeOffAnalyzer {
    pub current_scorecard: BalancedScorecard,
    pub thresholds: DimensionThresholds,
    pub priority_weights: PriorityWeights,
}

impl TradeOffAnalyzer {
    pub async fn analyze(
        &self,
        option: &DecisionOption,
        immediate: &[Consequence],
        secondary: &[Consequence]
    ) -> TradeOffAnalysis {
        let mut analysis = TradeOffAnalysis::default();
        
        // Calculate impact on each dimension
        for dimension in DIMENSIONS {
            let current_score = self.current_scorecard.get(dimension);
            let impact = self.calculate_impact(
                dimension, 
                immediate, 
                secondary
            );
            let new_score = current_score + impact;
            let threshold = self.thresholds.get(dimension);
            
            analysis.dimensions.insert(dimension, DimensionImpact {
                current_score,
                projected_impact: impact,
                new_score,
                threshold,
                breaches_threshold: new_score < threshold,
                priority: self.priority_weights.get(dimension),
            });
        }
        
        // Calculate overall score (weighted by priority)
        analysis.overall_score = self.calculate_weighted_score(&analysis.dimensions);
        
        analysis
    }
}
```

### Frontend Components

#### 1. DecisionAnalysisPanel Component

```typescript
// React component
export const DecisionAnalysisPanel: React.FC<{
  decisionId: string;
  onClose: () => void;
}> = ({ decisionId, onClose }) => {
  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCascades, setShowCascades] = useState<boolean>(false);
  
  useEffect(() => {
    // Fetch decision analysis from backend
    fetchDecisionAnalysis(decisionId).then(setAnalysis);
  }, [decisionId]);
  
  if (!analysis) return <LoadingSpinner />;
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <DecisionHeader decision={analysis.decision} onClose={onClose} />
        
        {/* Risk Factors */}
        <RiskFactorsSection factors={analysis.risk_factors} />
        
        {/* Options Analysis */}
        <div className="space-y-4 mt-8">
          {analysis.analyzed_options.map((analyzedOption) => (
            <OptionCard
              key={analyzedOption.option.id}
              analyzedOption={analyzedOption}
              recommended={analyzedOption.option.id === analysis.recommendation}
              onSelect={() => setSelectedOption(analyzedOption.option.id)}
              showCascades={showCascades}
            />
          ))}
        </div>
        
        {/* Decision Support */}
        <DecisionSupport
          cognitiveLoad={analysis.cognitive_load}
          precedents={analysis.precedents}
          aiConfidence={analysis.ai_confidence}
        />
        
        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button onClick={() => setShowCascades(!showCascades)}>
            {showCascades ? 'Hide' : 'Show'} Secondary Consequences
          </button>
          <button onClick={() => exportAnalysisAsPDF(analysis)}>
            Export as PDF
          </button>
          <button onClick={() => shareWithStaff(analysis)}>
            Share with Staff
          </button>
          <button onClick={() => requestConsultation(analysis)}>
            Request Consultation
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 2. OptionCard Component

```typescript
export const OptionCard: React.FC<{
  analyzedOption: AnalyzedOption;
  recommended: boolean;
  onSelect: () => void;
  showCascades: boolean;
}> = ({ analyzedOption, recommended, onSelect, showCascades }) => {
  const { option, immediate_consequences, secondary_consequences, trade_off_analysis } = analyzedOption;
  
  return (
    <div className={cn(
      "p-6 rounded-lg border-2 transition-all",
      recommended 
        ? "bg-blue-950/30 border-blue-500" 
        : "bg-slate-900/60 border-slate-700"
    )}>
      {/* Option Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-white uppercase">
            {option.label}
          </h3>
          {recommended && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-black border border-blue-500/30 rounded-full">
              ✅ RECOMMENDED
            </span>
          )}
        </div>
        <div className="text-2xl font-black text-white">
          {trade_off_analysis.overall_score > 0 ? '+' : ''}
          {trade_off_analysis.overall_score}
        </div>
      </div>
      
      <p className="text-sm text-slate-300 mb-4">{option.description}</p>
      
      {/* Immediate Consequences */}
      <ConsequencesSection
        title="POSITIVE CONSEQUENCES (Immediate)"
        consequences={immediate_consequences.filter(c => c.type === 'positive')}
        variant="positive"
      />
      
      <ConsequencesSection
        title="NEGATIVE CONSEQUENCES (Immediate)"
        consequences={immediate_consequences.filter(c => c.type === 'negative')}
        variant="negative"
      />
      
      {/* Secondary Consequences (Collapsible) */}
      {showCascades && (
        <ConsequencesSection
          title="SECONDARY CONSEQUENCES (24-72h)"
          consequences={secondary_consequences}
          variant="cascading"
        />
      )}
      
      {/* Trade-off Analysis */}
      <TradeOffVisualization analysis={trade_off_analysis} />
      
      {/* Timeline */}
      <TimelineVisualization timeline={option.timeline} />
      
      {/* Resources */}
      <ResourceRequirements requirements={option.resource_requirements} />
      
      {/* Action Button */}
      <button
        onClick={onSelect}
        className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase rounded-lg transition-colors"
      >
        {option.label} ──→
      </button>
    </div>
  );
};
```

#### 3. ConsequencesSection Component

```typescript
export const ConsequencesSection: React.FC<{
  title: string;
  consequences: Consequence[];
  variant: 'positive' | 'negative' | 'cascading';
}> = ({ title, consequences, variant }) => {
  const iconMap = {
    positive: '✅',
    negative: '❌',
    cascading: '⚠️ '
  };
  
  const colorMap = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    cascading: 'text-amber-400'
  };
  
  if (consequences.length === 0) return null;
  
  return (
    <div className="mt-4">
      <h4 className={cn(
        "text-xs font-black uppercase tracking-widest mb-2",
        colorMap[variant]
      )}>
        {iconMap[variant]} {title}
      </h4>
      <ul className="space-y-2">
        {consequences.map((consequence, idx) => (
          <li key={idx} className="text-sm">
            <div className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <div className="flex-1">
                <span className="text-slate-200">{consequence.description}</span>
                {consequence.likelihood < 1.0 && (
                  <span className="text-slate-500 text-xs ml-2">
                    ({Math.round(consequence.likelihood * 100)}% probability)
                  </span>
                )}
                <div className="text-slate-500 text-xs mt-1">
                  Impact: {consequence.impact_score > 0 ? '+' : ''}{consequence.impact_score} {consequence.domain}
                </div>
                
                {/* Cascades */}
                {consequence.cascades && consequence.cascades.length > 0 && (
                  <div className="ml-4 mt-2 border-l-2 border-amber-500/30 pl-3">
                    <span className="text-xs text-amber-400 font-bold">Cascades to:</span>
                    <ul className="space-y-1 mt-1">
                      {consequence.cascades.map((cascade, cidx) => (
                        <li key={cidx} className="text-xs text-slate-400">
                          • {cascade.description} ({cascade.impact_score > 0 ? '+' : ''}{cascade.impact_score} {cascade.domain})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

#### 4. TradeOffVisualization Component

```typescript
export const TradeOffVisualization: React.FC<{
  analysis: TradeOffAnalysis;
}> = ({ analysis }) => {
  return (
    <div className="mt-6 p-4 bg-slate-950/50 rounded-lg">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
        📊 TRADE-OFF ANALYSIS
      </h4>
      <div className="space-y-2">
        {Object.entries(analysis.dimensions).map(([dimension, impact]) => (
          <div key={dimension} className="flex items-center gap-3">
            <div className="w-32 text-xs text-slate-400 font-bold uppercase">
              {dimension}:
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-slate-300">
                {impact.current_score}%
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="currentColor" className="text-slate-600" />
              </svg>
              <span className={cn(
                "text-sm font-bold",
                impact.projected_impact > 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {impact.new_score}% 
                ({impact.projected_impact > 0 ? '+' : ''}{impact.projected_impact}%)
              </span>
              <span className={cn(
                "ml-auto px-2 py-0.5 rounded text-xs font-black",
                impact.breaches_threshold 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400'
              )}>
                {impact.breaches_threshold ? '🔴 BREACHES threshold' : '🟢 Above threshold'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Integration with Situation Awareness Cockpit

### Dashboard Integration Points

#### 1. Critical Actions Zone

When a decision is pending, show in Tier 1 (Critical Zone):

```typescript
// In SituationAwarenessCockpit.tsx
const pendingDecisions = await DecisionService.getPendingDecisions();

{pendingDecisions.map(decision => (
  <DecisionCard
    key={decision.id}
    decision={decision}
    onExpand={() => setSelectedDecision(decision.id)}
  />
))}
```

#### 2. Decision Modal

When user clicks "VIEW OPTIONS":

```typescript
{selectedDecision && (
  <DecisionAnalysisPanel
    decisionId={selectedDecision}
    onClose={() => setSelectedDecision(null)}
  />
)}
```

#### 3. Notification System

When new decision arrives:

```typescript
// WebSocket listener
socket.on('new_decision', (decision: Decision) => {
  toast({
    title: `🎯 Decision Required: ${decision.title}`,
    description: `${decision.options.length} options available, ${decision.risk_factors.length} risk factors detected`,
    variant: 'destructive',
    action: (
      <Button onClick={() => navigateToDecision(decision.id)}>
        View Analysis
      </Button>
    )
  });
});
```

---

## NOT TO DO List

### ❌ Don't Oversimplify Consequences
- Don't reduce to simple "good/bad" binary
- Don't hide secondary consequences by default
- Don't remove likelihood percentages

### ❌ Don't Show All Options Equally
- Don't give equal visual weight to all options
- Don't hide system recommendation
- Don't remove confidence scoring

### ❌ Don't Ignore Cognitive Load
- Don't present high-complexity decisions to fatigued commanders without safeguards
- Don't allow critical decisions without consultation option
- Don't remove decision safety checks

### ❌ Don't Overload with Data
- Don't show every possible consequence (prioritize by severity + likelihood)
- Don't display consequences with < 10% likelihood unless critical
- Don't make trade-off analysis overly complex

### ❌ Don't Remove Context
- Don't hide stakeholders and political sensitivity
- Don't remove links to background briefings
- Don't hide precedent decisions

---

## Testing Strategy

### 1. Unit Tests
- Consequence prediction accuracy
- Trade-off calculation correctness
- Risk factor detection sensitivity

### 2. Integration Tests
- Full decision flow (create → analyze → approve)
- WebSocket notifications
- Dashboard integration

### 3. User Acceptance Tests
- Commander can understand options in < 2 minutes
- System recommendation matches commander choice 70%+ of time
- Consequence predictions are useful (survey rating > 4/5)

### 4. A/B Testing
- **Group A:** Traditional decision interface (approve/reject)
- **Group B:** New option-based interface with consequences
- **Metrics:** Decision time, decision quality, user satisfaction

---

## Rollout Plan

### Phase 1: Backend Infrastructure (Weeks 1-4)
- Decision data model
- Consequence prediction engine (basic)
- Trade-off analyzer
- Risk factor detector

### Phase 2: Frontend Components (Weeks 5-8)
- Decision card in dashboard
- Decision analysis panel
- Option cards
- Consequence visualization

### Phase 3: ML Enhancement (Weeks 9-12)
- Train consequence prediction models
- Precedent matching system
- Confidence scoring
- Cascade detection

### Phase 4: Integration & Testing (Weeks 13-16)
- Integration with existing decision board
- User testing with operators
- Refinement based on feedback
- Documentation and training

---

## Success Metrics

### Primary Metrics
- **Decision time:** Target 50% reduction (from baseline)
- **Decision quality:** 30% reduction in reversals or modifications
- **Risk awareness:** 90% of risk factors acknowledged before approval
- **User satisfaction:** > 85% find consequence analysis useful

### Secondary Metrics
- **Consequence prediction accuracy:** 70%+ match with actual outcomes
- **System recommendation adoption:** 60%+ commanders select recommended option
- **Consultation rate:** 40% increase in deputy/staff consultations
- **Documentation quality:** 95% of decisions have trade-off justification

---

**Document Status:** Implementation Ready  
**Last Updated:** 2026-01-21  
**Next Review:** After Phase 1 completion

This implementation guide provides the foundation for integrating decision options with consequences into the Situation Awareness Cockpit, based on the scenarios we've created.
