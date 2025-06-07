
-- Migration to move existing symptoms to health concerns system
-- This preserves all existing symptom data while integrating it into the unified health concerns interface

-- Add a reference column to link health concerns back to original symptom records
ALTER TABLE health_concern_suggestions 
ADD COLUMN IF NOT EXISTS symptom_id uuid REFERENCES symptom_details(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_symptom_id ON health_concern_suggestions(symptom_id);

-- Insert all existing symptoms as approved health concerns
INSERT INTO health_concern_suggestions (
  concern_name, 
  brief_description, 
  category, 
  status, 
  suggested_by, 
  created_at, 
  reviewed_at,
  reviewed_by,
  symptom_id
)
SELECT 
  s.symptom as concern_name,
  COALESCE(s.brief_description, s.description) as brief_description,
  'symptom' as category,
  'approved' as status,
  COALESCE(
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
  ) as suggested_by,
  s.created_at,
  s.created_at as reviewed_at,
  COALESCE(
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
  ) as reviewed_by,
  s.id as symptom_id
FROM symptom_details s
WHERE NOT EXISTS (
  SELECT 1 FROM health_concern_suggestions hcs 
  WHERE hcs.symptom_id = s.id
)
ON CONFLICT (concern_name) DO NOTHING;

-- Update the health_concern_suggestions table to include additional metadata
ALTER TABLE health_concern_suggestions 
ADD COLUMN IF NOT EXISTS has_detailed_content boolean DEFAULT false;

-- Mark migrated symptoms as having detailed content
UPDATE health_concern_suggestions 
SET has_detailed_content = true 
WHERE symptom_id IS NOT NULL;
