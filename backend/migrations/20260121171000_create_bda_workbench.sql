-- BDA Workbench Database Schema
-- Migration: 20260121160000_create_bda_workbench.sql
-- Purpose: Create tables for Battle Damage Assessment (BDA) system per NATO COPD & JP 3-60
-- Dependencies: Requires 'targets' table from targeting feature (migration 20260121150000)
-- Author: Agent-BDA
-- Date: 2026-01-21

-- ============================================================================
-- TABLE 1: bda_reports
-- Purpose: Core BDA assessment records tracking physical/functional damage
-- ============================================================================
CREATE TABLE IF NOT EXISTS bda_reports (
    id TEXT PRIMARY KEY NOT NULL,  -- UUID
    
    -- Target & Strike Association
    target_id TEXT NOT NULL,  -- Foreign key to targets.id
    strike_id TEXT,  -- Foreign key to future strikes table (optional initially)
    
    -- Assessment Metadata
    assessment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    analyst_id TEXT NOT NULL,  -- User who performed assessment
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('initial', 'interim', 'final')),
    
    -- Physical Damage Assessment (per Joint Publication 3-60)
    physical_damage TEXT NOT NULL CHECK (physical_damage IN ('ND', 'SD', 'MD', 'SVD', 'D')),
    -- ND = No Damage, SD = Slight Damage, MD = Moderate, SVD = Severe, D = Destroyed
    physical_damage_percentage INTEGER CHECK (physical_damage_percentage BETWEEN 0 AND 100),
    damage_description TEXT,  -- Detailed damage narrative
    
    -- Functional Damage Assessment
    functional_damage TEXT NOT NULL CHECK (functional_damage IN ('FMC', 'PMC', 'NMC')),
    -- FMC = Fully Mission Capable, PMC = Partially, NMC = Not Mission Capable
    estimated_repair_time_hours INTEGER,  -- Time to restore capability
    pre_strike_capability_baseline TEXT,  -- What target could do before strike
    
    -- Effects Assessment
    desired_effect TEXT NOT NULL,  -- What was intended
    achieved_effect TEXT NOT NULL,  -- What actually happened
    effect_level TEXT CHECK (effect_level IN ('first_order', 'second_order', 'third_order')),
    -- first_order = immediate physical, second_order = operational, third_order = strategic
    unintended_effects TEXT,  -- Unexpected outcomes
    
    -- Confidence & Quality
    confidence_level REAL NOT NULL CHECK (confidence_level BETWEEN 0.0 AND 1.0),  -- 0.0 to 1.0
    assessment_quality TEXT CHECK (assessment_quality IN ('high', 'medium', 'low')),
    limiting_factors TEXT,  -- What reduced assessment quality (weather, resolution, etc.)
    
    -- Recommendation
    recommendation TEXT NOT NULL CHECK (recommendation IN (
        'effect_achieved',
        'monitor',
        're_attack',
        're_weaponeer'
    )),
    re_attack_priority INTEGER CHECK (re_attack_priority BETWEEN 1 AND 5),  -- 1=urgent, 5=low
    re_attack_rationale TEXT,  -- Why re-attack needed
    alternative_munitions TEXT,  -- Suggested different weapons
    
    -- Collateral Damage Assessment (CDA)
    collateral_damage_detected BOOLEAN NOT NULL DEFAULT FALSE,
    civcas_credibility TEXT CHECK (civcas_credibility IN (
        'no_credibility',
        'possible',
        'credible',
        'confirmed'
    )),
    civilian_casualties_estimate INTEGER,
    protected_structures_damaged TEXT,  -- List of protected sites affected
    cde_vs_actual_comparison TEXT,  -- How actual compared to Collateral Damage Estimate
    
    -- Weaponeering Validation
    weapon_performance_vs_predicted TEXT CHECK (weapon_performance_vs_predicted IN (
        'exceeded',
        'met',
        'below',
        'failed'
    )),
    munition_reliability TEXT,  -- Did munition function as designed?
    circular_error_probable_meters REAL,  -- Actual CEP observed
    penetration_depth_meters REAL,  -- For bunker-busting munitions
    
    -- Approval Workflow
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')),
    submitted_at TIMESTAMP,
    reviewed_by TEXT,  -- User ID of reviewer
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    approved_by TEXT,  -- User ID of approver
    approved_at TIMESTAMP,
    
    -- Classification & Security
    classification_level TEXT NOT NULL DEFAULT 'SECRET',
    handling_caveats TEXT,  -- NOFORN, RELIDO, etc.
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Notes
    notes TEXT  -- Additional analyst notes
);

-- Indexes for bda_reports
CREATE INDEX idx_bda_reports_target_id ON bda_reports(target_id);
CREATE INDEX idx_bda_reports_strike_id ON bda_reports(strike_id);
CREATE INDEX idx_bda_reports_analyst_id ON bda_reports(analyst_id);
CREATE INDEX idx_bda_reports_assessment_date ON bda_reports(assessment_date DESC);
CREATE INDEX idx_bda_reports_status ON bda_reports(status);
CREATE INDEX idx_bda_reports_recommendation ON bda_reports(recommendation);
CREATE INDEX idx_bda_reports_assessment_type ON bda_reports(assessment_type);
CREATE INDEX idx_bda_reports_physical_damage ON bda_reports(physical_damage);
CREATE INDEX idx_bda_reports_functional_damage ON bda_reports(functional_damage);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_bda_reports_timestamp 
AFTER UPDATE ON bda_reports
FOR EACH ROW
BEGIN
    UPDATE bda_reports SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- TABLE 2: bda_imagery
-- Purpose: Post-strike imagery metadata and storage references
-- ============================================================================
CREATE TABLE IF NOT EXISTS bda_imagery (
    id TEXT PRIMARY KEY NOT NULL,  -- UUID
    bda_report_id TEXT NOT NULL,  -- Foreign key to bda_reports.id
    
    -- Imagery Metadata
    collection_date TIMESTAMP NOT NULL,
    collection_platform TEXT,  -- Aircraft, satellite, UAV, etc.
    sensor_type TEXT CHECK (sensor_type IN ('SAR', 'EO', 'IR', 'FMV', 'Commercial', 'Other')),
    -- SAR=Synthetic Aperture Radar, EO=Electro-Optical, IR=Infrared, FMV=Full Motion Video
    
    -- Image Quality
    ground_sample_distance_cm REAL,  -- Resolution in centimeters
    cloud_cover_percentage INTEGER CHECK (cloud_cover_percentage BETWEEN 0 AND 100),
    collection_angle_degrees REAL,  -- Angle from vertical
    azimuth_degrees REAL,  -- Direction sensor was pointing
    quality_score REAL CHECK (quality_score BETWEEN 0.0 AND 1.0),  -- Overall quality 0-1
    quality_notes TEXT,
    
    -- Image Timing
    time_post_strike_hours REAL,  -- Hours after strike occurred
    is_pre_strike_baseline BOOLEAN NOT NULL DEFAULT FALSE,  -- Pre-strike comparison image
    
    -- Storage
    image_url TEXT NOT NULL,  -- Path to full-resolution image
    thumbnail_url TEXT,  -- Path to thumbnail
    image_format TEXT,  -- JPEG, PNG, TIFF, NITFS, etc.
    file_size_bytes INTEGER,
    
    -- Annotation
    annotations_json TEXT,  -- JSON array of polygons/markers
    annotated_by TEXT,  -- User ID
    annotated_at TIMESTAMP,
    
    -- Classification & Security
    classification_level TEXT NOT NULL DEFAULT 'SECRET',
    handling_caveats TEXT,
    source_classification TEXT,  -- Original classification from imagery provider
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bda_report_id) REFERENCES bda_reports(id) ON DELETE CASCADE
);

-- Indexes for bda_imagery
CREATE INDEX idx_bda_imagery_report_id ON bda_imagery(bda_report_id);
CREATE INDEX idx_bda_imagery_collection_date ON bda_imagery(collection_date DESC);
CREATE INDEX idx_bda_imagery_sensor_type ON bda_imagery(sensor_type);
CREATE INDEX idx_bda_imagery_quality_score ON bda_imagery(quality_score DESC);
CREATE INDEX idx_bda_imagery_is_pre_strike ON bda_imagery(is_pre_strike_baseline);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_bda_imagery_timestamp 
AFTER UPDATE ON bda_imagery
FOR EACH ROW
BEGIN
    UPDATE bda_imagery SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- TABLE 3: bda_strike_correlation
-- Purpose: Link BDA reports to specific strike data for weaponeering validation
-- ============================================================================
CREATE TABLE IF NOT EXISTS bda_strike_correlation (
    id TEXT PRIMARY KEY NOT NULL,  -- UUID
    bda_report_id TEXT NOT NULL,  -- Foreign key to bda_reports.id
    
    -- Strike Identification
    strike_mission_id TEXT,  -- Mission ID from aviation system
    strike_sortie_number TEXT,  -- Aircraft sortie number
    strike_sequence INTEGER,  -- If multiple strikes in one mission
    
    -- Weapon System
    weapon_system TEXT NOT NULL,  -- F-16, F-35, Reaper, HIMARS, etc.
    munition_type TEXT NOT NULL,  -- GBU-31, AGM-114, etc.
    munition_quantity INTEGER NOT NULL DEFAULT 1,
    total_net_explosive_weight_kg REAL,  -- Total TNT equivalent
    
    -- Strike Timing
    time_on_target TIMESTAMP NOT NULL,  -- When munition impacted
    launch_time TIMESTAMP,  -- When munition released/launched
    time_of_flight_seconds REAL,  -- Flight time
    
    -- Impact Location
    impact_coordinates TEXT NOT NULL,  -- Lat/Lon or MGRS
    impact_coordinates_json TEXT,  -- JSON: {"lat": 35.123, "lon": -117.456}
    dmpi_coordinates TEXT,  -- Desired Mean Point of Impact
    offset_from_dmpi_meters REAL,  -- How far from intended impact
    
    -- Weapon Performance
    successful_detonation BOOLEAN,  -- Did munition explode?
    fuzing_as_designed BOOLEAN,  -- Did fuze work correctly?
    guidance_system_performance TEXT CHECK (guidance_system_performance IN (
        'nominal',
        'degraded',
        'failed'
    )),
    circular_error_probable_meters REAL,  -- Measured CEP
    penetration_depth_meters REAL,  -- For penetrating munitions
    blast_radius_meters REAL,  -- Observed blast radius
    
    -- Environmental Factors
    weather_conditions TEXT,  -- Clear, overcast, rain, etc.
    wind_speed_knots REAL,
    wind_direction_degrees REAL,
    temperature_celsius REAL,
    
    -- Malfunctions
    malfunction_detected BOOLEAN NOT NULL DEFAULT FALSE,
    malfunction_type TEXT,  -- Guidance failure, fuze failure, structural, etc.
    malfunction_description TEXT,
    
    -- JMEM Validation (Joint Munitions Effectiveness Manual)
    jmem_predicted_damage TEXT,  -- What JMEM said would happen
    jmem_vs_actual_comparison TEXT,  -- How prediction compared to reality
    
    -- Classification & Security
    classification_level TEXT NOT NULL DEFAULT 'SECRET',
    handling_caveats TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bda_report_id) REFERENCES bda_reports(id) ON DELETE CASCADE
);

-- Indexes for bda_strike_correlation
CREATE INDEX idx_bda_strike_report_id ON bda_strike_correlation(bda_report_id);
CREATE INDEX idx_bda_strike_time_on_target ON bda_strike_correlation(time_on_target DESC);
CREATE INDEX idx_bda_strike_weapon_system ON bda_strike_correlation(weapon_system);
CREATE INDEX idx_bda_strike_munition_type ON bda_strike_correlation(munition_type);
CREATE INDEX idx_bda_strike_mission_id ON bda_strike_correlation(strike_mission_id);
CREATE INDEX idx_bda_strike_detonation ON bda_strike_correlation(successful_detonation);
CREATE INDEX idx_bda_strike_malfunction ON bda_strike_correlation(malfunction_detected);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_bda_strike_correlation_timestamp 
AFTER UPDATE ON bda_strike_correlation
FOR EACH ROW
BEGIN
    UPDATE bda_strike_correlation SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- VIEWS: Operational Views for Common Queries
-- ============================================================================

-- View: Assessment Queue (all pending assessments)
CREATE VIEW v_bda_assessment_queue AS
SELECT 
    br.id,
    br.target_id,
    br.assessment_type,
    br.status,
    br.analyst_id,
    br.assessment_date,
    br.confidence_level,
    br.recommendation,
    COUNT(DISTINCT bi.id) as imagery_count,
    MAX(bi.collection_date) as latest_imagery_date
FROM bda_reports br
LEFT JOIN bda_imagery bi ON br.id = bi.bda_report_id
WHERE br.status IN ('draft', 'submitted', 'reviewed')
GROUP BY br.id
ORDER BY br.assessment_date DESC;

-- View: Re-attack Candidates
CREATE VIEW v_bda_reattack_targets AS
SELECT 
    br.id as bda_report_id,
    br.target_id,
    br.recommendation,
    br.re_attack_priority,
    br.re_attack_rationale,
    br.physical_damage,
    br.functional_damage,
    br.confidence_level,
    br.assessment_date
FROM bda_reports br
WHERE br.recommendation IN ('re_attack', 're_weaponeer')
  AND br.status = 'approved'
ORDER BY br.re_attack_priority ASC, br.assessment_date DESC;

-- View: Weapon System Performance Summary
CREATE VIEW v_weapon_performance_summary AS
SELECT 
    bsc.weapon_system,
    bsc.munition_type,
    COUNT(*) as total_strikes,
    SUM(CASE WHEN bsc.successful_detonation = 1 THEN 1 ELSE 0 END) as successful_detonations,
    ROUND(AVG(bsc.offset_from_dmpi_meters), 2) as avg_cep_meters,
    ROUND(AVG(bsc.blast_radius_meters), 2) as avg_blast_radius_meters,
    SUM(CASE WHEN bsc.malfunction_detected = 1 THEN 1 ELSE 0 END) as malfunctions,
    ROUND(100.0 * SUM(CASE WHEN bsc.successful_detonation = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as reliability_percentage
FROM bda_strike_correlation bsc
GROUP BY bsc.weapon_system, bsc.munition_type
ORDER BY total_strikes DESC;

-- View: Recent BDA Activity (last 7 days)
CREATE VIEW v_recent_bda_activity AS
SELECT 
    br.id,
    br.target_id,
    br.assessment_type,
    br.status,
    br.physical_damage,
    br.functional_damage,
    br.recommendation,
    br.confidence_level,
    br.analyst_id,
    br.assessment_date,
    br.collateral_damage_detected,
    COUNT(DISTINCT bi.id) as imagery_count,
    COUNT(DISTINCT bsc.id) as strikes_assessed
FROM bda_reports br
LEFT JOIN bda_imagery bi ON br.id = bi.bda_report_id
LEFT JOIN bda_strike_correlation bsc ON br.id = bsc.bda_report_id
WHERE br.assessment_date >= datetime('now', '-7 days')
GROUP BY br.id
ORDER BY br.assessment_date DESC;

-- ============================================================================
-- SEED DATA: Initial test data for development
-- ============================================================================

-- Note: Seed data will reference targets from targeting system
-- This will be populated after targets table exists

-- ============================================================================
-- NOTES & DOCUMENTATION
-- ============================================================================

-- Physical Damage Categories (JP 3-60):
--   ND  = No Damage (0% capability loss)
--   SD  = Slight Damage (<10% capability loss)
--   MD  = Moderate Damage (10-50% capability loss)
--   SVD = Severe Damage (50-90% capability loss)
--   D   = Destroyed (>90% capability loss, not economically repairable)

-- Functional Status (JP 3-60):
--   FMC = Fully Mission Capable (can perform all intended functions)
--   PMC = Partially Mission Capable (degraded but partially functional)
--   NMC = Not Mission Capable (cannot perform primary mission)

-- Assessment Types:
--   initial = First assessment within 24h of strike
--   interim = Follow-up assessment 24-72h post-strike
--   final   = Final assessment after 72h or when complete

-- Effect Levels:
--   first_order  = Immediate physical damage to target
--   second_order = Operational/systemic impacts (supply chain, morale, etc.)
--   third_order  = Strategic/behavioral impacts (policy changes, negotiations, etc.)

-- CIVCAS Credibility Levels (CJCSI 3160.01):
--   no_credibility = No evidence of civilian casualties
--   possible       = Allegation exists but unconfirmed
--   credible       = Evidence suggests casualties likely occurred
--   confirmed      = Definitive proof of civilian casualties

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
