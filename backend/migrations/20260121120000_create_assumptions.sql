-- Assumptions Table
-- Tracks planning assumptions and their validity over time
-- Broken assumptions represent major risks requiring immediate attention

CREATE TABLE assumptions (
    id TEXT PRIMARY KEY,
    operation_id TEXT REFERENCES operations(id),
    campaign_id TEXT REFERENCES campaigns(id),
    
    -- Core Assumption Details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Enemy', 'Friendly', 'Environmental', 'Political', 
        'Logistical', 'Intelligence', 'Temporal', 'Technical'
    )),
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'Valid' CHECK (status IN (
        'Valid', 'Monitoring', 'Challenged', 'Broken'
    )),
    risk_level TEXT NOT NULL DEFAULT 'Low' CHECK (risk_level IN (
        'Low', 'Medium', 'High', 'Critical'
    )),
    confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Accountability
    stated_by TEXT, -- user_id who created this assumption
    validated_by TEXT, -- user_id who last validated
    last_validated_at DATETIME,
    
    -- Dependencies and Impact
    dependencies JSONB, -- Array of plan/decision/entity IDs that depend on this
    impact_notes TEXT, -- Description of what happens if assumption breaks
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_assumptions_status ON assumptions(status);
CREATE INDEX idx_assumptions_risk_level ON assumptions(risk_level);
CREATE INDEX idx_assumptions_campaign ON assumptions(campaign_id);
CREATE INDEX idx_assumptions_operation ON assumptions(operation_id);
CREATE INDEX idx_assumptions_broken ON assumptions(status, risk_level) 
    WHERE status IN ('Challenged', 'Broken');
