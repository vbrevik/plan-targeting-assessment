-- Add target_id to bda_strike_correlation
-- Migration: 20260131184000_add_target_id_to_strikes.sql
-- Purpose: Add explicit target_id column for reliable strike-to-target linkage

-- 1. Add column (nullable initially to avoid breaking existing data)
ALTER TABLE bda_strike_correlation ADD COLUMN target_id TEXT;

-- 2. Add index for performance
CREATE INDEX idx_bda_strike_target_id ON bda_strike_correlation(target_id);

-- 3. Update view for weapon performance (optional, but good for completeness)
DROP VIEW IF EXISTS v_weapon_performance_summary;
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
