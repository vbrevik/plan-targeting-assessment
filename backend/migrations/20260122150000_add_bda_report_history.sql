-- BDA Report History and Versioning
-- Purpose: Track changes to BDA reports over time for audit and comparison

-- Create BDA report history table
CREATE TABLE IF NOT EXISTS bda_report_history (
    id TEXT PRIMARY KEY,
    bda_report_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    
    -- Snapshot of report data at this version
    -- Store as JSON for flexibility
    report_data_json TEXT NOT NULL,
    
    -- Change metadata
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'submitted', 'reviewed', 'approved', 'rejected')),
    change_description TEXT,
    
    -- Status at this version
    status TEXT NOT NULL,
    
    -- Foreign key
    FOREIGN KEY (bda_report_id) REFERENCES bda_reports(id) ON DELETE CASCADE
);

-- Create index for efficient history queries
CREATE INDEX IF NOT EXISTS idx_bda_report_history_report_id ON bda_report_history(bda_report_id);
CREATE INDEX IF NOT EXISTS idx_bda_report_history_version ON bda_report_history(bda_report_id, version_number);
CREATE INDEX IF NOT EXISTS idx_bda_report_history_changed_at ON bda_report_history(changed_at DESC);

-- Create view for latest version per report
CREATE VIEW IF NOT EXISTS bda_report_latest_version AS
SELECT 
    bda_report_id,
    MAX(version_number) as latest_version
FROM bda_report_history
GROUP BY bda_report_id;

-- Trigger to create history entry on report creation
CREATE TRIGGER IF NOT EXISTS bda_report_history_create
AFTER INSERT ON bda_reports
BEGIN
    INSERT INTO bda_report_history (
        id,
        bda_report_id,
        version_number,
        report_data_json,
        changed_by,
        changed_at,
        change_type,
        change_description,
        status
    )
    SELECT 
        lower(hex(randomblob(16))),
        NEW.id,
        1,
        json_object(
            'target_id', NEW.target_id,
            'strike_id', NEW.strike_id,
            'assessment_date', NEW.assessment_date,
            'analyst_id', NEW.analyst_id,
            'assessment_type', NEW.assessment_type,
            'physical_damage', NEW.physical_damage,
            'physical_damage_percentage', NEW.physical_damage_percentage,
            'damage_description', NEW.damage_description,
            'functional_damage', NEW.functional_damage,
            'estimated_repair_time_hours', NEW.estimated_repair_time_hours,
            'pre_strike_capability_baseline', NEW.pre_strike_capability_baseline,
            'desired_effect', NEW.desired_effect,
            'achieved_effect', NEW.achieved_effect,
            'effect_level', NEW.effect_level,
            'unintended_effects', NEW.unintended_effects,
            'confidence_level', NEW.confidence_level,
            'assessment_quality', NEW.assessment_quality,
            'limiting_factors', NEW.limiting_factors,
            'recommendation', NEW.recommendation,
            're_attack_priority', NEW.re_attack_priority,
            're_attack_rationale', NEW.re_attack_rationale,
            'alternative_munitions', NEW.alternative_munitions,
            'collateral_damage_detected', NEW.collateral_damage_detected,
            'civcas_credibility', NEW.civcas_credibility,
            'civilian_casualties_estimate', NEW.civilian_casualties_estimate,
            'protected_structures_damaged', NEW.protected_structures_damaged,
            'cde_vs_actual_comparison', NEW.cde_vs_actual_comparison,
            'weapon_performance_vs_predicted', NEW.weapon_performance_vs_predicted,
            'munition_reliability', NEW.munition_reliability,
            'circular_error_probable_meters', NEW.circular_error_probable_meters,
            'penetration_depth_meters', NEW.penetration_depth_meters,
            'status', NEW.status,
            'classification_level', NEW.classification_level,
            'handling_caveats', NEW.handling_caveats,
            'notes', NEW.notes
        ),
        NEW.analyst_id,
        NEW.created_at,
        'created',
        'Initial report creation',
        NEW.status
    FROM bda_reports WHERE id = NEW.id;
END;

-- Trigger to create history entry on report update
CREATE TRIGGER IF NOT EXISTS bda_report_history_update
AFTER UPDATE ON bda_reports
BEGIN
    INSERT INTO bda_report_history (
        id,
        bda_report_id,
        version_number,
        report_data_json,
        changed_by,
        changed_at,
        change_type,
        change_description,
        status
    )
    SELECT 
        lower(hex(randomblob(16))),
        NEW.id,
        COALESCE((SELECT MAX(version_number) FROM bda_report_history WHERE bda_report_id = NEW.id), 0) + 1,
        json_object(
            'target_id', NEW.target_id,
            'strike_id', NEW.strike_id,
            'assessment_date', NEW.assessment_date,
            'analyst_id', NEW.analyst_id,
            'assessment_type', NEW.assessment_type,
            'physical_damage', NEW.physical_damage,
            'physical_damage_percentage', NEW.physical_damage_percentage,
            'damage_description', NEW.damage_description,
            'functional_damage', NEW.functional_damage,
            'estimated_repair_time_hours', NEW.estimated_repair_time_hours,
            'pre_strike_capability_baseline', NEW.pre_strike_capability_baseline,
            'desired_effect', NEW.desired_effect,
            'achieved_effect', NEW.achieved_effect,
            'effect_level', NEW.effect_level,
            'unintended_effects', NEW.unintended_effects,
            'confidence_level', NEW.confidence_level,
            'assessment_quality', NEW.assessment_quality,
            'limiting_factors', NEW.limiting_factors,
            'recommendation', NEW.recommendation,
            're_attack_priority', NEW.re_attack_priority,
            're_attack_rationale', NEW.re_attack_rationale,
            'alternative_munitions', NEW.alternative_munitions,
            'collateral_damage_detected', NEW.collateral_damage_detected,
            'civcas_credibility', NEW.civcas_credibility,
            'civilian_casualties_estimate', NEW.civilian_casualties_estimate,
            'protected_structures_damaged', NEW.protected_structures_damaged,
            'cde_vs_actual_comparison', NEW.cde_vs_actual_comparison,
            'weapon_performance_vs_predicted', NEW.weapon_performance_vs_predicted,
            'munition_reliability', NEW.munition_reliability,
            'circular_error_probable_meters', NEW.circular_error_probable_meters,
            'penetration_depth_meters', NEW.penetration_depth_meters,
            'status', NEW.status,
            'classification_level', NEW.classification_level,
            'handling_caveats', NEW.handling_caveats,
            'notes', NEW.notes
        ),
        COALESCE(NEW.reviewed_by, NEW.analyst_id, 'system'),
        NEW.updated_at,
        CASE 
            WHEN NEW.status = 'submitted' AND OLD.status = 'draft' THEN 'submitted'
            WHEN NEW.status = 'reviewed' AND OLD.status = 'submitted' THEN 'reviewed'
            WHEN NEW.status = 'approved' AND OLD.status IN ('submitted', 'reviewed') THEN 'approved'
            WHEN NEW.status = 'rejected' AND OLD.status IN ('submitted', 'reviewed') THEN 'rejected'
            ELSE 'updated'
        END,
        CASE 
            WHEN NEW.status != OLD.status THEN 'Status changed: ' || OLD.status || ' → ' || NEW.status
            ELSE 'Report updated'
        END,
        NEW.status
    FROM bda_reports WHERE id = NEW.id;
END;
