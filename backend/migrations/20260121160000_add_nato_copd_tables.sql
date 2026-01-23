-- NATO COPD Targeting Cell - Add Missing Tables
-- Migration: 20260121160000_add_nato_copd_tables
-- Creates targets table and all related NATO COPD tables

-- ============================================================================
-- TABLE 0: TARGETS (Core targeting table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    target_type TEXT NOT NULL CHECK (target_type IN ('HPT', 'TST', 'HVT', 'TGT', 'HVT', 'TST')),
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    target_status TEXT NOT NULL CHECK (target_status IN ('Nominated', 'Validated', 'Approved', 'Engaged', 'Assessed', 'Cancelled')) DEFAULT 'Nominated',
    coordinates TEXT NOT NULL,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')) DEFAULT 'SECRET',
    f3ead_stage TEXT CHECK (f3ead_stage IN ('FIND', 'FIX', 'FINISH', 'EXPLOIT', 'ANALYZE', 'DISSEMINATE')) DEFAULT 'FIND',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_targets_type ON targets(target_type);
CREATE INDEX IF NOT EXISTS idx_targets_priority ON targets(priority);
CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(target_status);
CREATE INDEX IF NOT EXISTS idx_targets_f3ead_stage ON targets(f3ead_stage);

-- ============================================================================
-- TABLE 1: DTL (DYNAMIC TARGET LIST) ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS dtl_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    target_id TEXT NOT NULL,
    priority_score REAL NOT NULL CHECK (priority_score >= 0.0 AND priority_score <= 1.0),
    feasibility_score REAL NOT NULL CHECK (feasibility_score >= 0.0 AND feasibility_score <= 1.0),
    combined_score REAL GENERATED ALWAYS AS ((priority_score + feasibility_score) / 2.0) STORED,
    aging_hours INTEGER NOT NULL DEFAULT 0,
    is_tst INTEGER NOT NULL DEFAULT 0,
    tst_deadline TEXT,
    approval_chain TEXT,
    current_approver TEXT,
    approval_level INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dtl_target ON dtl_entries(target_id);
CREATE INDEX IF NOT EXISTS idx_dtl_combined_score ON dtl_entries(combined_score DESC);
CREATE INDEX IF NOT EXISTS idx_dtl_tst ON dtl_entries(is_tst, tst_deadline);

-- ============================================================================
-- TABLE 2: ISR PLATFORMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS isr_platforms (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    platform_type TEXT NOT NULL CHECK (platform_type IN ('UAV', 'SATELLITE', 'AIRCRAFT', 'GROUND_SENSOR', 'NAVAL')),
    platform_name TEXT NOT NULL,
    callsign TEXT,
    current_position TEXT,
    sensor_type TEXT NOT NULL CHECK (sensor_type IN ('EO', 'IR', 'SAR', 'SIGINT', 'ELINT', 'MULTISPECTRAL', 'COMBINED')),
    sensor_range_km REAL,
    coverage_area TEXT,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'RTB', 'MAINTENANCE', 'OFFLINE', 'TASKED', 'STANDBY')),
    loiter_time_remaining INTEGER,
    fuel_remaining_percent INTEGER CHECK (fuel_remaining_percent >= 0 AND fuel_remaining_percent <= 100),
    current_task TEXT,
    tasking_priority TEXT CHECK (tasking_priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    tasked_targets TEXT,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_isr_status ON isr_platforms(status);
CREATE INDEX IF NOT EXISTS idx_isr_platform_type ON isr_platforms(platform_type);

-- ============================================================================
-- TABLE 3: INTELLIGENCE REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS intelligence_reports (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    target_id TEXT,
    int_type TEXT NOT NULL CHECK (int_type IN ('SIGINT', 'IMINT', 'HUMINT', 'GEOINT', 'OSINT', 'MASINT', 'CYBER', 'COMBINED')),
    report_title TEXT NOT NULL,
    report_content TEXT NOT NULL,
    report_summary TEXT,
    confidence_level INTEGER NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
    source_reliability TEXT NOT NULL CHECK (source_reliability IN ('A', 'B', 'C', 'D', 'E', 'F')),
    collection_time TEXT NOT NULL,
    reporting_time TEXT NOT NULL DEFAULT (datetime('now')),
    fusion_score REAL CHECK (fusion_score >= 0.0 AND fusion_score <= 1.0),
    corroborating_reports TEXT,
    pattern_of_life_indicator INTEGER DEFAULT 0,
    pattern_notes TEXT,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    caveats TEXT,
    collected_by TEXT,
    source_unit TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (target_id) REFERENCES targets(id)
);

CREATE INDEX IF NOT EXISTS idx_intel_target ON intelligence_reports(target_id);
CREATE INDEX IF NOT EXISTS idx_intel_type ON intelligence_reports(int_type);
CREATE INDEX IF NOT EXISTS idx_intel_pattern ON intelligence_reports(pattern_of_life_indicator);

-- ============================================================================
-- TABLE 4: STRIKE PLATFORMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS strike_platforms (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    platform_type TEXT NOT NULL CHECK (platform_type IN ('FIGHTER', 'BOMBER', 'ARTILLERY', 'MISSILE_BATTERY', 'NAVAL', 'SPECIAL_OPERATIONS')),
    platform_name TEXT NOT NULL,
    callsign TEXT,
    unit TEXT,
    munitions_available TEXT,
    sorties_available INTEGER NOT NULL DEFAULT 0,
    sorties_max_daily INTEGER,
    platform_status TEXT NOT NULL CHECK (platform_status IN ('READY', 'TASKED', 'IN_FLIGHT', 'MAINTENANCE', 'UNAVAILABLE', 'DEGRADED')),
    location TEXT,
    base_location TEXT,
    max_range_km REAL,
    max_payload_kg REAL,
    can_refuel INTEGER DEFAULT 0,
    night_capable INTEGER DEFAULT 1,
    all_weather INTEGER DEFAULT 1,
    current_mission TEXT,
    tasked_targets TEXT,
    estimated_ready_time TEXT,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_strike_status ON strike_platforms(platform_status);
CREATE INDEX IF NOT EXISTS idx_strike_type ON strike_platforms(platform_type);

-- ============================================================================
-- TABLE 5: RISK ASSESSMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    target_id TEXT NOT NULL,
    fratricide_risk TEXT NOT NULL CHECK (fratricide_risk IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    friendly_forces_distance_km REAL,
    friendly_units_nearby TEXT,
    fratricide_mitigation TEXT,
    political_sensitivity TEXT NOT NULL CHECK (political_sensitivity IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    sensitive_sites_nearby TEXT,
    protected_sites_nearby TEXT,
    civilian_density TEXT CHECK (civilian_density IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    legal_review_status TEXT NOT NULL CHECK (legal_review_status IN ('NOT_REQUIRED', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CONDITIONAL')),
    legal_reviewer TEXT,
    legal_review_date TEXT,
    legal_review_notes TEXT,
    proportionality_assessment TEXT CHECK (proportionality_assessment IN ('PROPORTIONAL', 'QUESTIONABLE', 'DISPROPORTIONATE')),
    military_advantage_expected TEXT,
    collateral_concern_level TEXT CHECK (collateral_concern_level IN ('MINIMAL', 'ACCEPTABLE', 'HIGH', 'UNACCEPTABLE')),
    second_order_effects TEXT,
    third_order_effects TEXT,
    overall_risk_score REAL CHECK (overall_risk_score >= 0.0 AND overall_risk_score <= 10.0),
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    assessed_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_risk_target ON risk_assessments(target_id);
CREATE INDEX IF NOT EXISTS idx_risk_fratricide ON risk_assessments(fratricide_risk);
CREATE INDEX IF NOT EXISTS idx_risk_political ON risk_assessments(political_sensitivity);

-- ============================================================================
-- TABLE 6: ASSUMPTION CHALLENGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS assumption_challenges (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    assumption_text TEXT NOT NULL,
    assumption_category TEXT CHECK (assumption_category IN ('INTELLIGENCE', 'OPERATIONAL', 'STRATEGIC', 'TACTICAL', 'LOGISTICAL')),
    confidence_level INTEGER NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
    validation_status TEXT NOT NULL CHECK (validation_status IN ('VALID', 'MONITORING', 'CHALLENGED', 'INVALIDATED')),
    alternative_hypothesis TEXT,
    evidence_supporting TEXT,
    evidence_contradicting TEXT,
    red_team_perspective TEXT,
    red_team_analyst TEXT,
    red_team_date TEXT,
    bias_type TEXT CHECK (bias_type IN ('CONFIRMATION', 'ANCHORING', 'GROUPTHINK', 'AVAILABILITY', 'RECENCY', 'NONE')),
    bias_indicators TEXT,
    challenged_by TEXT,
    challenge_date TEXT,
    challenge_rationale TEXT,
    related_targets TEXT,
    impact_if_wrong TEXT,
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assumption_status ON assumption_challenges(validation_status);
CREATE INDEX IF NOT EXISTS idx_assumption_confidence ON assumption_challenges(confidence_level);

-- ============================================================================
-- TABLE 7: DECISION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS decision_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    decision_type TEXT NOT NULL CHECK (decision_type IN ('TARGET_APPROVAL', 'TARGET_REJECTION', 'STRIKE_AUTHORIZATION', 'MISSION_ABORT', 'PRIORITY_CHANGE', 'ROE_MODIFICATION', 'COLLATERAL_ACCEPTANCE', 'RE_ATTACK_APPROVAL')),
    decision_text TEXT NOT NULL,
    decision_rationale TEXT NOT NULL,
    decision_maker TEXT NOT NULL,
    decision_maker_role TEXT NOT NULL,
    decision_maker_rank TEXT,
    authority_level TEXT NOT NULL CHECK (authority_level IN ('TACTICAL', 'OPERATIONAL', 'STRATEGIC', 'NATIONAL')),
    requires_higher_approval INTEGER DEFAULT 0,
    related_targets TEXT,
    related_operations TEXT,
    related_risks TEXT,
    approval_chain TEXT,
    approval_complete INTEGER DEFAULT 0,
    decision_time TEXT NOT NULL DEFAULT (datetime('now')),
    effective_time TEXT,
    expiration_time TEXT,
    alternatives_considered TEXT,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decision_type ON decision_log(decision_type);
CREATE INDEX IF NOT EXISTS idx_decision_maker ON decision_log(decision_maker);
CREATE INDEX IF NOT EXISTS idx_decision_time ON decision_log(decision_time DESC);

-- ============================================================================
-- TABLE 8: SHIFT HANDOVERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_handovers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    shift_date TEXT NOT NULL,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('DAY', 'NIGHT', 'SWING')),
    shift_start TEXT NOT NULL,
    shift_end TEXT NOT NULL,
    outgoing_watch_officer TEXT NOT NULL,
    incoming_watch_officer TEXT NOT NULL,
    outgoing_team TEXT,
    incoming_team TEXT,
    active_targets_summary TEXT NOT NULL,
    targets_approved_count INTEGER DEFAULT 0,
    targets_engaged_count INTEGER DEFAULT 0,
    bda_completed_count INTEGER DEFAULT 0,
    pending_decisions TEXT NOT NULL,
    pending_decisions_count INTEGER DEFAULT 0,
    critical_issues TEXT,
    urgent_actions TEXT,
    intel_updates_summary TEXT,
    pattern_of_life_changes TEXT,
    new_threats TEXT,
    isr_platforms_active INTEGER DEFAULT 0,
    strike_platforms_ready INTEGER DEFAULT 0,
    munitions_status_summary TEXT,
    recommendations TEXT,
    watch_items TEXT,
    weather_summary TEXT,
    weather_impact TEXT CHECK (weather_impact IN ('NONE', 'MINIMAL', 'MODERATE', 'SIGNIFICANT', 'SEVERE')),
    handover_time TEXT NOT NULL,
    handover_complete INTEGER DEFAULT 0,
    incoming_acknowledged_by TEXT,
    incoming_acknowledged_at TEXT,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_handover_date ON shift_handovers(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_handover_outgoing ON shift_handovers(outgoing_watch_officer);
CREATE INDEX IF NOT EXISTS idx_handover_incoming ON shift_handovers(incoming_watch_officer);

-- ============================================================================
-- TABLE 9: TARGETING ANNOTATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS targeting_annotations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    target_id TEXT,
    user_id TEXT NOT NULL,
    annotation_text TEXT NOT NULL,
    annotation_type TEXT NOT NULL CHECK (annotation_type IN ('COMMENT', 'QUESTION', 'WARNING', 'APPROVAL', 'CONCERN', 'RECOMMENDATION')),
    parent_annotation_id TEXT,
    thread_depth INTEGER DEFAULT 0,
    mentioned_users TEXT,
    is_critical INTEGER DEFAULT 0,
    requires_response INTEGER DEFAULT 0,
    response_deadline TEXT,
    resolved INTEGER DEFAULT 0,
    resolved_by TEXT,
    resolved_at TEXT,
    classification TEXT NOT NULL CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_annotation_target ON targeting_annotations(target_id);
CREATE INDEX IF NOT EXISTS idx_annotation_user ON targeting_annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotation_critical ON targeting_annotations(is_critical);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active TSTs with countdown
CREATE VIEW IF NOT EXISTS v_active_tsts AS
SELECT 
    t.id,
    t.name,
    t.target_type,
    t.priority,
    t.target_status,
    d.tst_deadline,
    CAST((julianday(d.tst_deadline) - julianday('now')) * 24 * 60 AS INTEGER) as minutes_remaining
FROM targets t
JOIN dtl_entries d ON t.id = d.target_id
WHERE d.is_tst = 1 
  AND d.tst_deadline > datetime('now')
ORDER BY d.tst_deadline ASC;

-- View: High-risk targets
CREATE VIEW IF NOT EXISTS v_high_risk_targets AS
SELECT 
    t.id,
    t.name,
    t.priority,
    t.target_status,
    r.fratricide_risk,
    r.political_sensitivity,
    r.legal_review_status,
    r.overall_risk_score
FROM targets t
JOIN risk_assessments r ON t.id = r.target_id
WHERE r.fratricide_risk IN ('HIGH', 'CRITICAL')
   OR r.political_sensitivity IN ('HIGH', 'CRITICAL')
   OR r.overall_risk_score >= 7.0
ORDER BY r.overall_risk_score DESC;

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS trg_dtl_updated_at
AFTER UPDATE ON dtl_entries
FOR EACH ROW
BEGIN
    UPDATE dtl_entries SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_isr_updated_at
AFTER UPDATE ON isr_platforms
FOR EACH ROW
BEGIN
    UPDATE isr_platforms SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_intel_updated_at
AFTER UPDATE ON intelligence_reports
FOR EACH ROW
BEGIN
    UPDATE intelligence_reports SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_strike_updated_at
AFTER UPDATE ON strike_platforms
FOR EACH ROW
BEGIN
    UPDATE strike_platforms SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_risk_updated_at
AFTER UPDATE ON risk_assessments
FOR EACH ROW
BEGIN
    UPDATE risk_assessments SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_assumption_updated_at
AFTER UPDATE ON assumption_challenges
FOR EACH ROW
BEGIN
    UPDATE assumption_challenges SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_handover_updated_at
AFTER UPDATE ON shift_handovers
FOR EACH ROW
BEGIN
    UPDATE shift_handovers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_annotation_updated_at
AFTER UPDATE ON targeting_annotations
FOR EACH ROW
BEGIN
    UPDATE targeting_annotations SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Migration complete
-- NATO COPD Targeting Cell Additional Tables v1.0
-- New tables: dtl_entries, isr_platforms, intelligence_reports, strike_platforms, risk_assessments, assumption_challenges, decision_log, shift_handovers, targeting_annotations
-- Views: v_active_tsts, v_high_risk_targets
-- Triggers: 8 auto-update timestamp triggers
