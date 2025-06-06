
-- Add missing columns to health_concern_suggestions table
ALTER TABLE health_concern_suggestions 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'symptom' CHECK (category IN ('symptom', 'condition', 'goal', 'body_system'));

ALTER TABLE health_concern_suggestions 
ADD COLUMN IF NOT EXISTS brief_description text;

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_category ON health_concern_suggestions(category);

-- Update the existing RLS policies to remain the same
-- (keeping all existing policies as they are)
