-- 1. Context Hierarchy (Containers)

CREATE TABLE campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Planned', 'Concluded', 'Archived')),
    objective TEXT,
    end_state TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id),
    name TEXT NOT NULL,
    current_phase TEXT NOT NULL,
    commander_id TEXT, -- References users(id) if needed, or free text
    status TEXT NOT NULL CHECK (status IN ('Planning', 'Executing', 'Complete')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Core Ontology (Nodes)
-- The "Everything is an Entity" pattern for targets, units, statements, etc.
-- This allows flexible linking without a strict schema for every new type immediately.

CREATE TABLE entities (
    id TEXT PRIMARY KEY,
    operation_id TEXT REFERENCES operations(id), -- Scoping context
    campaign_id TEXT REFERENCES campaigns(id), -- Scoping context
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Unit', 'Target', 'PoliticalStatement', 'CCIR', 'COG'
    
    -- Common properties
    description TEXT,
    status TEXT, -- 'Active', 'Destroyed', etc.
    location_lat REAL,
    location_lng REAL,
    
    -- Valid time range (Temporal context)
    valid_from DATETIME,
    valid_until DATETIME,

    -- Flexible data blob for subclass properties
    -- e.g., Target priority, Speaker for PoliticalStatement, etc.
    properties JSONB,
    
    -- Trusted Data Layer Metadata
    source TEXT,
    classification TEXT,
    confidence REAL, -- 0.0 to 1.0
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching entities by type and operation
CREATE INDEX idx_entities_type_op ON entities(type, operation_id);


-- 3. Relationships (Edges)
-- The semantic glue of the Knowledge Graph
-- "PoliticalStatement A" --IMPACTS--> "Target B"

CREATE TABLE entity_relationships (
    source_id TEXT REFERENCES entities(id),
    target_id TEXT REFERENCES entities(id),
    relation_type TEXT NOT NULL, 
    -- e.g., 'COMMANDS', 'TARGETS', 'IMPACTS', 'LOCATED_AT', 'DEPENDS_ON'
    
    properties JSONB, -- e.g. { "probability": 0.8, "weight": "High" }
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (source_id, target_id, relation_type)
);

-- Index for reverse lookups (Find all things that impact target X)
CREATE INDEX idx_relationships_target ON entity_relationships(target_id, relation_type);
