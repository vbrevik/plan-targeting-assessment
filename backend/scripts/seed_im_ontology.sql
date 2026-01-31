-- Seed script for Information Manager (IM) ontology data
-- This creates the semantic graph for menu items, actions, and datasets

-- First, ensure the IM role entity exists
INSERT OR IGNORE INTO entities (id, type, name, properties, source, status, operation_id, campaign_id, created_at, updated_at)
VALUES ('role-im', 'Role', 'Information Manager', '{"description": "Manages information flow and battle rhythm"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create Dataset entities
INSERT OR IGNORE INTO entities (id, type, name, properties, source, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('ds-bre', 'Dataset', 'Battle Rhythm Events', '{"description": "Calendar of battle rhythm events and milestones"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('ds-tor', 'Dataset', 'TOR Documents', '{"description": "Terms of Reference documents"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('ds-gs', 'Dataset', 'Governance Sessions', '{"description": "Battle rhythm governance meetings and sessions"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('ds-mom', 'Dataset', 'Minutes of Meetings', '{"description": "Meeting minutes and action items"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create Action entities
INSERT OR IGNORE INTO entities (id, type, name, properties, source, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('act-oversee', 'Action', 'Oversee', '{"description": "Monitor and supervise operations", "icon": "Eye"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('act-draft', 'Action', 'Draft', '{"description": "Create draft documents", "icon": "FileEdit"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('act-view', 'Action', 'View', '{"description": "View and read data", "icon": "BookOpen"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('act-manage', 'Action', 'Manage', '{"description": "Full CRUD management", "icon": "Settings"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('act-schedule', 'Action', 'Schedule', '{"description": "Schedule events and meetings", "icon": "Calendar"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create MenuItem entities
INSERT OR IGNORE INTO entities (id, type, name, properties, source, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('mi-im-dashboard', 'MenuItem', 'IM Dashboard', '{"to": "/mshnctrl/im-dashboard", "icon": "LayoutDashboard", "group": "Information Management", "order": 1}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('mi-tor-manager', 'MenuItem', 'TOR Manager', '{"to": "/mshnctrl/tor-manager", "icon": "FileText", "group": "Information Management", "order": 2, "permission": "tor.manage"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('mi-battle-rhythm', 'MenuItem', 'Battle Rhythm', '{"to": "/mshnctrl/battle-rhythm", "icon": "CalendarClock", "group": "Information Management", "order": 3, "permission": "battle_rhythm.view"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('mi-menu-builder', 'MenuItem', 'Menu Builder', '{"to": "/mshnctrl/menu-builder", "icon": "Settings", "group": "Administration", "order": 10, "permission": "menu.manage"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('mi-ontology', 'MenuItem', 'Ontology Manager', '{"to": "/mshnctrl/ontology", "icon": "Layers", "group": "Administration", "order": 11, "permission": "ontology.view"}', 'seed', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create relationships: MenuItem -> assigned_to -> Role
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-mi-dashboard-im', 'assigned_to', 'mi-im-dashboard', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-mi-tor-im', 'assigned_to', 'mi-tor-manager', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-mi-br-im', 'assigned_to', 'mi-battle-rhythm', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-mi-mb-im', 'assigned_to', 'mi-menu-builder', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-mi-ont-im', 'assigned_to', 'mi-ontology', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create relationships: MenuItem -> performs_action -> Action
-- IM Dashboard performs: Oversee
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-dashboard-oversee', 'performs_action', 'mi-im-dashboard', 'act-oversee', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-dashboard-view', 'performs_action', 'mi-im-dashboard', 'act-view', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- TOR Manager performs: Draft, View, Manage
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-tor-draft', 'performs_action', 'mi-tor-manager', 'act-draft', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-tor-view', 'performs_action', 'mi-tor-manager', 'act-view', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-tor-manage', 'performs_action', 'mi-tor-manager', 'act-manage', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Battle Rhythm performs: View, Schedule
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-br-view', 'performs_action', 'mi-battle-rhythm', 'act-view', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-br-schedule', 'performs_action', 'mi-battle-rhythm', 'act-schedule', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Menu Builder and Ontology Manager perform: Manage
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-mb-manage', 'performs_action', 'mi-menu-builder', 'act-manage', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-ont-manage', 'performs_action', 'mi-ontology', 'act-manage', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create relationships: Action -> operates_on -> Dataset
-- Oversee operates on: Governance Sessions, Battle Rhythm Events
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-oversee-gs', 'operates_on', 'act-oversee', 'ds-gs', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-oversee-bre', 'operates_on', 'act-oversee', 'ds-bre', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Draft operates on: TOR Documents, Minutes of Meetings
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-draft-tor', 'operates_on', 'act-draft', 'ds-tor', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-draft-mom', 'operates_on', 'act-draft', 'ds-mom', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- View operates on: all datasets
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-view-bre', 'operates_on', 'act-view', 'ds-bre', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-view-tor', 'operates_on', 'act-view', 'ds-tor', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-view-gs', 'operates_on', 'act-view', 'ds-gs', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-view-mom', 'operates_on', 'act-view', 'ds-mom', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Schedule operates on: Battle Rhythm Events, Governance Sessions
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-schedule-bre', 'operates_on', 'act-schedule', 'ds-bre', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-schedule-gs', 'operates_on', 'act-schedule', 'ds-gs', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Create relationships: Action -> available_for -> Role (IM role can use all these actions)
INSERT OR IGNORE INTO relationships (id, type, source_id, target_id, metadata, status, operation_id, campaign_id, created_at, updated_at)
VALUES 
  ('rel-avail-oversee-im', 'available_for', 'act-oversee', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-avail-draft-im', 'available_for', 'act-draft', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-avail-view-im', 'available_for', 'act-view', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-avail-manage-im', 'available_for', 'act-manage', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now')),
  ('rel-avail-schedule-im', 'available_for', 'act-schedule', 'role-im', '{}', 'active', NULL, NULL, datetime('now'), datetime('now'));

-- Done! The IM role now has a complete semantic menu configuration.
