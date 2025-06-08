
-- Complete replacement of symptoms system with health concerns
-- Drop all existing symptom-related tables

DROP TABLE IF EXISTS symptom_clicks CASCADE;
DROP TABLE IF EXISTS symptom_remedies CASCADE;
DROP TABLE IF EXISTS symptom_experts CASCADE;
DROP TABLE IF EXISTS symptom_details CASCADE;

-- Drop the symptom_type enum
DROP TYPE IF EXISTS symptom_type CASCADE;

-- Create health_concerns table
CREATE TABLE health_concerns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  brief_description text,
  description text,
  image_url text,
  thumbnail_description text,
  video_description text,
  video_links jsonb DEFAULT '[]'::jsonb,
  related_experts text[] DEFAULT '{}',
  related_ingredients text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create health_concern_clicks table for analytics
CREATE TABLE health_concern_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  health_concern_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create junction tables for relationships
CREATE TABLE remedy_health_concerns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  remedy_id uuid REFERENCES remedies(id) ON DELETE CASCADE,
  health_concern_id uuid REFERENCES health_concerns(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(remedy_id, health_concern_id)
);

CREATE TABLE expert_health_concerns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id uuid REFERENCES experts(id) ON DELETE CASCADE,
  health_concern_id uuid REFERENCES health_concerns(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(expert_id, health_concern_id)
);

-- Create indexes for performance
CREATE INDEX idx_health_concerns_name ON health_concerns(name);
CREATE INDEX idx_health_concern_clicks_health_concern ON health_concern_clicks(health_concern_name);
CREATE INDEX idx_health_concern_clicks_user ON health_concern_clicks(user_id);
CREATE INDEX idx_remedy_health_concerns_remedy ON remedy_health_concerns(remedy_id);
CREATE INDEX idx_remedy_health_concerns_health_concern ON remedy_health_concerns(health_concern_id);
CREATE INDEX idx_expert_health_concerns_expert ON expert_health_concerns(expert_id);
CREATE INDEX idx_expert_health_concerns_health_concern ON expert_health_concerns(health_concern_id);

-- Enable RLS
ALTER TABLE health_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_concern_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE remedy_health_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_health_concerns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view health concerns" ON health_concerns
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage health concerns" ON health_concerns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can log their health concern clicks" ON health_concern_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view health concern clicks" ON health_concern_clicks
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view remedy health concerns" ON remedy_health_concerns
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage remedy health concerns" ON remedy_health_concerns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view expert health concerns" ON expert_health_concerns
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage expert health concerns" ON expert_health_concerns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Insert initial health concerns data
INSERT INTO health_concerns (name, brief_description, description) VALUES
('Sore Throat', 'Pain or irritation in the throat', 'Pain or irritation in the throat, often due to infection or strain, manageable with natural remedies like honey or herbal teas.'),
('Depression', 'Persistent sadness or loss of interest', 'Persistent sadness or loss of interest, which can be supported with natural approaches like exercise, omega-3s, or mindfulness.'),
('Joint Pain', 'Discomfort or stiffness in joints', 'Discomfort or stiffness in joints, often linked to arthritis or injury, relieved by turmeric or gentle movement.'),
('Anxiety', 'Excessive worry or nervousness', 'Excessive worry or nervousness, addressable with calming herbs like chamomile or breathing exercises.'),
('Fatigue', 'Ongoing tiredness not relieved by rest', 'Ongoing tiredness not relieved by rest, potentially eased with adaptogens like ashwagandha or improved sleep.'),
('Cold', 'Common viral infection', 'Common viral infection causing runny nose or cough, treatable with vitamin C or elderberry.'),
('High Blood Pressure', 'Elevated blood pressure', 'Elevated blood pressure, manageable with hawthorn, a plant-based diet, or stress reduction.'),
('Headache', 'Pain in the head', 'Pain in the head, often due to tension or dehydration, alleviated by magnesium or peppermint oil.'),
('Allergies', 'Reactions to allergens', 'Reactions to pollen or food causing sneezing, treatable with quercetin or local honey.'),
('Stress', 'Mental or physical tension', 'Mental or physical tension, reducible with lavender, yoga, or meditation.'),
('Eye Strain', 'Fatigue from prolonged screen use', 'Fatigue or discomfort from prolonged screen use, eased with eye exercises or bilberry.'),
('Back Pain', 'Discomfort in the back', 'Discomfort in the back, often from poor posture, relieved by stretching or anti-inflammatory herbs.'),
('Cough', 'Frequent throat clearing', 'Frequent throat clearing or irritation, soothed with eucalyptus or warm teas.'),
('Cancer', 'Serious condition with uncontrolled cell growth', 'Serious condition involving uncontrolled cell growth, supported by immune-boosting remedies like medicinal mushrooms (consult a doctor).'),
('Weak Immunity', 'Frequent illness due to low immune function', 'Frequent illness due to low immune function, strengthened with zinc or echinacea.'),
('Skin Irritation', 'Redness or itching on the skin', 'Redness or itching on the skin, treatable with aloe vera or dietary adjustments.'),
('Poor Circulation', 'Reduced blood flow', 'Reduced blood flow, improved with ginkgo biloba or regular movement.'),
('Digestive Issues', 'Problems like bloating or IBS', 'Problems like bloating or IBS, managed with probiotics or ginger.'),
('Insomnia', 'Difficulty sleeping', 'Difficulty sleeping, addressable with valerian root or a consistent sleep schedule.'),
('Hair Loss', 'Thinning or loss of hair', 'Thinning or loss of hair, potentially supported by biotin or scalp massages.');

-- Create function to get top health concerns
CREATE OR REPLACE FUNCTION get_top_health_concerns(limit_count integer DEFAULT 20)
RETURNS TABLE(health_concern_name text, click_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hcc.health_concern_name,
    COUNT(*) as click_count
  FROM health_concern_clicks hcc
  WHERE hcc.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY hcc.health_concern_name
  ORDER BY click_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Update remedies table to remove symptoms column if it exists
ALTER TABLE remedies DROP COLUMN IF EXISTS symptoms CASCADE;

-- Add health_concerns column to remedies if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='remedies' AND column_name='health_concerns') THEN
    ALTER TABLE remedies ADD COLUMN health_concerns text[] DEFAULT '{}';
  END IF;
END $$;
