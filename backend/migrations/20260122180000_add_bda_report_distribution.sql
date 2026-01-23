-- BDA Report Distribution System
-- Purpose: Track report distribution and delivery to stakeholders

-- Create distribution list table
CREATE TABLE IF NOT EXISTS bda_distribution_list (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create distribution list members table
CREATE TABLE IF NOT EXISTS bda_distribution_member (
    id TEXT PRIMARY KEY NOT NULL,
    distribution_list_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_role TEXT,
    recipient_organization TEXT,
    delivery_method TEXT CHECK (delivery_method IN ('email', 'system', 'manual', 'api')) DEFAULT 'system',
    delivery_preferences TEXT,  -- JSON: format preferences, frequency, etc.
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (distribution_list_id) REFERENCES bda_distribution_list(id) ON DELETE CASCADE
);

-- Create report distribution tracking table
CREATE TABLE IF NOT EXISTS bda_report_distribution (
    id TEXT PRIMARY KEY NOT NULL,
    bda_report_id TEXT NOT NULL,
    distribution_list_id TEXT,
    recipient_id TEXT,  -- If individual recipient (not from list)
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    
    -- Distribution details
    report_format TEXT NOT NULL CHECK (report_format IN ('pdf', 'html', 'json', 'kml', 'nitfs')),
    report_template_type TEXT NOT NULL,
    classification_level TEXT NOT NULL,
    
    -- Delivery status
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')) DEFAULT 'pending',
    delivery_method TEXT CHECK (delivery_method IN ('email', 'system', 'manual', 'api')) DEFAULT 'system',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    delivery_attempts INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Distribution metadata
    distributed_by TEXT NOT NULL,
    distributed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_confirmation_received BOOLEAN DEFAULT FALSE,
    confirmation_received_at TIMESTAMP,
    
    -- File reference
    file_url TEXT,
    file_size_bytes INTEGER,
    
    FOREIGN KEY (bda_report_id) REFERENCES bda_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (distribution_list_id) REFERENCES bda_distribution_list(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bda_distribution_report_id ON bda_report_distribution(bda_report_id);
CREATE INDEX IF NOT EXISTS idx_bda_distribution_status ON bda_report_distribution(delivery_status);
CREATE INDEX IF NOT EXISTS idx_bda_distribution_recipient ON bda_report_distribution(recipient_email);
CREATE INDEX IF NOT EXISTS idx_bda_distribution_list_id ON bda_distribution_member(distribution_list_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_bda_distribution_list_timestamp 
AFTER UPDATE ON bda_distribution_list
FOR EACH ROW
BEGIN
    UPDATE bda_distribution_list SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_bda_distribution_member_timestamp 
AFTER UPDATE ON bda_distribution_member
FOR EACH ROW
BEGIN
    UPDATE bda_distribution_member SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- View: Distribution summary per report
CREATE VIEW IF NOT EXISTS v_bda_distribution_summary AS
SELECT 
    bda_report_id,
    COUNT(*) as total_distributions,
    SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
    SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as sent_count,
    SUM(CASE WHEN delivery_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed_count,
    SUM(CASE WHEN delivery_confirmation_received = TRUE THEN 1 ELSE 0 END) as confirmed_count,
    MIN(sent_at) as first_sent_at,
    MAX(delivered_at) as last_delivered_at
FROM bda_report_distribution
GROUP BY bda_report_id;

-- View: Distribution list members summary
CREATE VIEW IF NOT EXISTS v_bda_distribution_list_summary AS
SELECT 
    dl.id as distribution_list_id,
    dl.name as distribution_list_name,
    COUNT(DISTINCT dm.id) as total_members,
    SUM(CASE WHEN dm.active = TRUE THEN 1 ELSE 0 END) as active_members,
    COUNT(DISTINCT rd.id) as total_distributions,
    MAX(rd.distributed_at) as last_distribution_at
FROM bda_distribution_list dl
LEFT JOIN bda_distribution_member dm ON dl.id = dm.distribution_list_id
LEFT JOIN bda_report_distribution rd ON dl.id = rd.distribution_list_id
GROUP BY dl.id, dl.name;
