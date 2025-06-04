
-- Create health_concern_suggestions table
CREATE TABLE IF NOT EXISTS health_concern_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concern_name text NOT NULL,
  suggested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_status ON health_concern_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_health_concern_suggestions_suggested_by ON health_concern_suggestions(suggested_by);

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
