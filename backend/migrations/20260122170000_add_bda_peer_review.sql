-- BDA Peer Review System
-- Purpose: Multi-reviewer quality control workflow for BDA reports

-- Create peer review table
CREATE TABLE IF NOT EXISTS bda_peer_review (
    id TEXT PRIMARY KEY NOT NULL,
    bda_report_id TEXT NOT NULL,
    
    -- Reviewer Information
    reviewer_id TEXT NOT NULL,
    reviewer_name TEXT,  -- Denormalized for display
    reviewer_role TEXT,  -- e.g., "Senior Analyst", "Supervisor", "Subject Matter Expert"
    
    -- Review Assignment
    assigned_by TEXT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,  -- Review deadline
    priority TEXT CHECK (priority IN ('normal', 'urgent', 'critical')) DEFAULT 'normal',
    
    -- Review Status
    review_status TEXT NOT NULL CHECK (review_status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Review Assessment
    overall_quality TEXT CHECK (overall_quality IN ('high', 'medium', 'low', 'needs_rework')) NOT NULL,
    confidence_adequate BOOLEAN,  -- Is confidence level appropriate?
    evidence_sufficient BOOLEAN,  -- Is evidence sufficient for assessment?
    methodology_sound BOOLEAN,  -- Is methodology appropriate?
    recommendations_appropriate BOOLEAN,  -- Are recommendations appropriate?
    
    -- Review Feedback
    review_comments TEXT,  -- General comments
    strengths TEXT,  -- What was done well
    weaknesses TEXT,  -- Areas for improvement
    specific_concerns TEXT,  -- Specific issues identified
    
    -- Review Decision
    recommendation TEXT CHECK (recommendation IN ('approve', 'approve_with_changes', 'reject', 'request_clarification')) NOT NULL,
    required_changes TEXT,  -- Specific changes required if approve_with_changes
    clarification_questions TEXT,  -- Questions if request_clarification
    
    -- Quality Checklist (NATO COPD compliance)
    imagery_reviewed BOOLEAN DEFAULT FALSE,
    damage_categories_correct BOOLEAN DEFAULT FALSE,
    functional_assessment_complete BOOLEAN DEFAULT FALSE,
    component_assessments_reviewed BOOLEAN DEFAULT FALSE,
    collateral_damage_assessed BOOLEAN DEFAULT FALSE,
    weaponeering_validated BOOLEAN DEFAULT FALSE,
    recommendations_justified BOOLEAN DEFAULT FALSE,
    classification_appropriate BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    time_spent_minutes INTEGER,  -- Time reviewer spent on review
    review_version INTEGER DEFAULT 1,  -- Track if review was updated
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bda_report_id) REFERENCES bda_reports(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bda_peer_review_report_id ON bda_peer_review(bda_report_id);
CREATE INDEX IF NOT EXISTS idx_bda_peer_review_reviewer_id ON bda_peer_review(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_bda_peer_review_status ON bda_peer_review(review_status);
CREATE INDEX IF NOT EXISTS idx_bda_peer_review_due_date ON bda_peer_review(due_date);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_bda_peer_review_timestamp 
AFTER UPDATE ON bda_peer_review
FOR EACH ROW
BEGIN
    UPDATE bda_peer_review SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- View: Review summary per report
CREATE VIEW IF NOT EXISTS v_bda_review_summary AS
SELECT 
    bda_report_id,
    COUNT(*) as total_reviews,
    SUM(CASE WHEN review_status = 'completed' THEN 1 ELSE 0 END) as completed_reviews,
    SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) as pending_reviews,
    SUM(CASE WHEN review_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_reviews,
    SUM(CASE WHEN recommendation = 'approve' THEN 1 ELSE 0 END) as approve_count,
    SUM(CASE WHEN recommendation = 'approve_with_changes' THEN 1 ELSE 0 END) as approve_with_changes_count,
    SUM(CASE WHEN recommendation = 'reject' THEN 1 ELSE 0 END) as reject_count,
    SUM(CASE WHEN recommendation = 'request_clarification' THEN 1 ELSE 0 END) as clarification_count,
    AVG(CASE WHEN overall_quality = 'high' THEN 3 WHEN overall_quality = 'medium' THEN 2 WHEN overall_quality = 'low' THEN 1 ELSE 0 END) as avg_quality_score,
    MIN(due_date) as earliest_due_date,
    MAX(completed_at) as last_completed_at
FROM bda_peer_review
GROUP BY bda_report_id;

-- View: Reviewer workload
CREATE VIEW IF NOT EXISTS v_bda_reviewer_workload AS
SELECT 
    reviewer_id,
    COUNT(*) as total_assigned,
    SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN review_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
    SUM(CASE WHEN review_status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN due_date < CURRENT_TIMESTAMP AND review_status != 'completed' THEN 1 ELSE 0 END) as overdue_count,
    AVG(time_spent_minutes) as avg_time_minutes
FROM bda_peer_review
GROUP BY reviewer_id;
