-- Initial schema migration
BEGIN;

-- ... (Previous schema we created) ...

-- Add versioning table
CREATE TABLE schema_versions (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Insert initial version
INSERT INTO schema_versions (version, description) 
VALUES (1, 'Initial schema creation');

COMMIT; 