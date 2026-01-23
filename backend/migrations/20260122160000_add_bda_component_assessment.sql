-- BDA Component-Level Damage Assessment
-- Purpose: Track damage to individual target components (buildings, equipment, infrastructure)

-- Create component assessment table
CREATE TABLE IF NOT EXISTS bda_component_assessment (
    id TEXT PRIMARY KEY NOT NULL,
    bda_report_id TEXT NOT NULL,
    
    -- Component Identification
    component_name TEXT NOT NULL,  -- e.g., "Main Building", "Power Generator", "Command Center"
    component_type TEXT NOT NULL,  -- e.g., "structure", "equipment", "infrastructure", "vehicle"
    component_location TEXT,  -- Location within target (e.g., "North Wing", "Building A")
    
    -- Physical Damage Assessment
    physical_damage TEXT NOT NULL CHECK (physical_damage IN ('ND', 'SD', 'MD', 'SVD', 'D')),
    physical_damage_percentage INTEGER CHECK (physical_damage_percentage BETWEEN 0 AND 100),
    damage_description TEXT,
    
    -- Functional Damage Assessment
    functional_damage TEXT NOT NULL CHECK (functional_damage IN ('FMC', 'PMC', 'NMC')),
    estimated_repair_time_hours INTEGER,
    repair_cost_estimate_usd REAL,
    
    -- Component-Specific Details
    component_criticality TEXT CHECK (component_criticality IN ('critical', 'important', 'supporting', 'non_essential')),
    pre_strike_function TEXT,  -- What component did before strike
    post_strike_function TEXT,  -- What component can do after strike
    replacement_required BOOLEAN DEFAULT FALSE,
    replacement_availability_days INTEGER,  -- Days to obtain replacement
    
    -- Assessment Metadata
    assessed_by TEXT NOT NULL,
    assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confidence_level REAL CHECK (confidence_level BETWEEN 0.0 AND 1.0),
    assessment_notes TEXT,
    
    -- Classification
    classification_level TEXT NOT NULL DEFAULT 'SECRET',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bda_report_id) REFERENCES bda_reports(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bda_component_report_id ON bda_component_assessment(bda_report_id);
CREATE INDEX IF NOT EXISTS idx_bda_component_type ON bda_component_assessment(component_type);
CREATE INDEX IF NOT EXISTS idx_bda_component_criticality ON bda_component_assessment(component_criticality);
CREATE INDEX IF NOT EXISTS idx_bda_component_damage ON bda_component_assessment(physical_damage);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_bda_component_timestamp 
AFTER UPDATE ON bda_component_assessment
FOR EACH ROW
BEGIN
    UPDATE bda_component_assessment SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- View: Component damage summary per report
CREATE VIEW IF NOT EXISTS v_bda_component_summary AS
SELECT 
    bda_report_id,
    COUNT(*) as total_components,
    SUM(CASE WHEN physical_damage = 'D' THEN 1 ELSE 0 END) as destroyed_count,
    SUM(CASE WHEN physical_damage = 'SVD' THEN 1 ELSE 0 END) as severe_damage_count,
    SUM(CASE WHEN physical_damage = 'MD' THEN 1 ELSE 0 END) as moderate_damage_count,
    SUM(CASE WHEN physical_damage = 'SD' THEN 1 ELSE 0 END) as slight_damage_count,
    SUM(CASE WHEN physical_damage = 'ND' THEN 1 ELSE 0 END) as no_damage_count,
    SUM(CASE WHEN component_criticality = 'critical' AND physical_damage IN ('SVD', 'D') THEN 1 ELSE 0 END) as critical_components_destroyed,
    AVG(physical_damage_percentage) as avg_damage_percentage,
    SUM(repair_cost_estimate_usd) as total_repair_cost_estimate
FROM bda_component_assessment
GROUP BY bda_report_id;
