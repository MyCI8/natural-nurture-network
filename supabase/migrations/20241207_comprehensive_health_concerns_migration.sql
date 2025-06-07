
-- Comprehensive migration to ensure health concerns system works properly

-- Ensure the health_concern_suggestions table exists with all required columns
CREATE TABLE IF NOT EXISTS health_concern_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concern_name text NOT NULL UNIQUE,
  suggested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  category text DEFAULT 'symptom' CHECK (category IN ('symptom', 'condition', 'goal', 'body_system')),
  brief_description text,
  symptom_id uuid REFERENCES symptom_details(id),
  has_detailed_content boolean DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_status ON health_concern_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_suggested_by ON health_concern_suggestions(suggested_by);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_category ON health_concern_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_symptom_id ON health_concern_suggestions(symptom_id);

-- Enable RLS
ALTER TABLE health_concern_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they work
DROP POLICY IF EXISTS "Users can view their own suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Users can insert their own suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Admins can update suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Admins can delete suggestions" ON health_concern_suggestions;

-- Create comprehensive policies
CREATE POLICY "Users can view their own suggestions" ON health_concern_suggestions
  FOR SELECT USING (auth.uid() = suggested_by);

CREATE POLICY "Users can insert their own suggestions" ON health_concern_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "Admins can view all suggestions" ON health_concern_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update suggestions" ON health_concern_suggestions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete suggestions" ON health_concern_suggestions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Get the first admin user ID for migration
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1;

    -- If we have users, migrate the symptoms
    IF admin_user_id IS NOT NULL THEN
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
          symptom_id,
          has_detailed_content
        )
        SELECT DISTINCT
          s.symptom as concern_name,
          COALESCE(s.brief_description, LEFT(s.description, 200)) as brief_description,
          'symptom' as category,
          'approved' as status,
          admin_user_id as suggested_by,
          s.created_at,
          s.created_at as reviewed_at,
          admin_user_id as reviewed_by,
          s.id as symptom_id,
          true as has_detailed_content
        FROM symptom_details s
        WHERE s.symptom IS NOT NULL 
        AND s.symptom != ''
        ON CONFLICT (concern_name) DO NOTHING;
    END IF;
END $$;
