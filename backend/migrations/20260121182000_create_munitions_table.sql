-- Create munitions inventory table
-- Migration: 20260121182000_create_munitions_table
-- Tracks munition types, inventory counts, and characteristics

CREATE TABLE IF NOT EXISTS munitions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    munition_type TEXT NOT NULL, -- e.g., "GBU-31 JDAM", "AGM-65 Maverick", "M982 Excalibur"
    munition_category TEXT NOT NULL, -- "GUIDED_BOMB", "MISSILE", "ARTILLERY", "ROCKET"
    platform_type TEXT, -- "FIGHTER", "BOMBER", "ARTILLERY", "MISSILE"
    
    -- Inventory
    total_count INTEGER NOT NULL DEFAULT 0,
    available_count INTEGER NOT NULL DEFAULT 0,
    allocated_count INTEGER NOT NULL DEFAULT 0,
    expended_count INTEGER NOT NULL DEFAULT 0,
    
    -- Characteristics
    range_km REAL, -- Effective range in kilometers
    yield_kg REAL, -- Explosive yield in kilograms
    guidance_type TEXT, -- "GPS", "LASER", "IR", "RADAR", "INS"
    warhead_type TEXT, -- "HE", "Penetrator", "Fragmentation", "Cluster"
    
    -- Target Matching
    suitable_target_types TEXT, -- JSON array: ["C2", "Armor", "Infrastructure"]
    min_target_size_m2 REAL, -- Minimum target size for effectiveness
    max_target_size_m2 REAL, -- Maximum target size for effectiveness
    cde_estimate_range TEXT, -- JSON: {"min": 0, "max": 50} estimated casualties
    
    -- Classification
    classification TEXT NOT NULL DEFAULT 'SECRET' CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    
    -- Metadata
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_munitions_type ON munitions(munition_type);
CREATE INDEX IF NOT EXISTS idx_munitions_category ON munitions(munition_category);
CREATE INDEX IF NOT EXISTS idx_munitions_platform ON munitions(platform_type);
CREATE INDEX IF NOT EXISTS idx_munitions_available ON munitions(available_count) WHERE available_count > 0;

-- Insert default munitions inventory
INSERT OR IGNORE INTO munitions (
    id, munition_type, munition_category, platform_type, total_count, available_count,
    range_km, yield_kg, guidance_type, warhead_type, suitable_target_types, cde_estimate_range
) VALUES
    ('mun-001', 'GBU-31 JDAM', 'GUIDED_BOMB', 'FIGHTER', 100, 85, 28.0, 2000.0, 'GPS', 'Penetrator', '["C2", "Infrastructure", "Armor"]', '{"min": 0, "max": 15}'),
    ('mun-002', 'AGM-65 Maverick', 'MISSILE', 'FIGHTER', 50, 42, 22.0, 136.0, 'IR', 'HE', '["Armor", "Vehicles"]', '{"min": 0, "max": 5}'),
    ('mun-003', 'M982 Excalibur', 'ARTILLERY', 'ARTILLERY', 200, 180, 40.0, 23.0, 'GPS', 'HE', '["Infrastructure", "Personnel"]', '{"min": 0, "max": 10}'),
    ('mun-004', 'M795 HE', 'ARTILLERY', 'ARTILLERY', 500, 450, 30.0, 10.0, 'INS', 'Fragmentation', '["Personnel", "Light Vehicles"]', '{"min": 0, "max": 8}'),
    ('mun-005', 'GMLRS', 'ROCKET', 'MISSILE', 60, 54, 70.0, 90.0, 'GPS', 'Cluster', '["Personnel", "Light Armor"]', '{"min": 5, "max": 25}');
