-- Create Intelligence Feeds table
CREATE TABLE intelligence_feeds (
    id TEXT PRIMARY KEY NOT NULL,  -- UUID
    target_id TEXT NOT NULL,       -- Foreign key to targets
    bda_report_id TEXT,            -- Optional link to BDA report
    
    -- Intelligence Metadata
    intel_type TEXT NOT NULL CHECK (intel_type IN ('sigint', 'osint', 'humint', 'geoint', 'masint')),
    source_agency TEXT NOT NULL,
    raw_data TEXT NOT NULL,
    interpretation TEXT NOT NULL,
    
    -- Assessment Metrics
    confidence_score REAL NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    reliability_rating TEXT NOT NULL, -- NATO Rating (e.g., A1, B2)
    
    -- Security & Access
    visibility_level TEXT NOT NULL DEFAULT 'SECRET',
    external_reference_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for target-based lookups
CREATE INDEX idx_intel_feeds_target_id ON intelligence_feeds(target_id);
CREATE INDEX idx_intel_feeds_bda_report_id ON intelligence_feeds(bda_report_id);

-- Link to entities system
CREATE TRIGGER tr_intelligence_feeds_sync_insert AFTER INSERT ON intelligence_feeds
BEGIN
    INSERT INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.intel_type || ' Feed - ' || NEW.id, 'INTEL_FEED', NEW.interpretation, 'active', NEW.visibility_level, NEW.created_at, NEW.updated_at,
        json_object('source', NEW.source_agency, 'confidence', NEW.confidence_score, 'reliability', NEW.reliability_rating)
    );
    INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
    VALUES (NEW.id, NEW.target_id, 'PROVIDES_INTEL_FOR', NEW.created_at);
END;

CREATE TRIGGER tr_intelligence_feeds_sync_update AFTER UPDATE ON intelligence_feeds
BEGIN
    UPDATE entities SET
        description = NEW.interpretation,
        updated_at = NEW.updated_at,
        properties = json_object('source', NEW.source_agency, 'confidence', NEW.confidence_score, 'reliability', NEW.reliability_rating)
    WHERE id = NEW.id;
END;

CREATE TRIGGER tr_intelligence_feeds_sync_delete AFTER DELETE ON intelligence_feeds
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;
