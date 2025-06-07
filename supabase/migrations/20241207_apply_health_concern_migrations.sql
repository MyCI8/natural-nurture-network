
-- Apply health concern suggestions table migration
-- This combines both migration files to ensure the table is created properly

-- Create health_concern_suggestions table
CREATE TABLE IF NOT EXISTS health_concern_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concern_name text NOT NULL,
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_status ON health_concern_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_suggested_by ON health_concern_suggestions(suggested_by);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_category ON health_concern_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_symptom_id ON health_concern_suggestions(symptom_id);

-- Enable RLS
ALTER TABLE health_concern_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Users can insert their own suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON health_concern_suggestions;
DROP POLICY IF EXISTS "Admins can update suggestions" ON health_concern_suggestions;

-- RLS policies
CREATE POLICY "Users can view their own suggestions" ON health_concern_suggestions
  FOR SELECT USING (auth.uid() = suggested_by);

CREATE POLICY "Users can insert their own suggestions" ON health_concern_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

-- Admin policies (assuming user_roles table exists)
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

-- Migrate existing symptoms to health concerns
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
  s.id as symptom_id,
  true as has_detailed_content
FROM symptom_details s
WHERE NOT EXISTS (
  SELECT 1 FROM health_concern_suggestions hcs 
  WHERE hcs.symptom_id = s.id
)
ON CONFLICT (concern_name) DO NOTHING;
