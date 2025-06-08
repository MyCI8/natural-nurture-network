
-- Clean migration to rebuild health concerns system
-- Drop the existing table and recreate with clean structure

DROP TABLE IF EXISTS health_concern_suggestions CASCADE;

-- Create the health_concern_suggestions table with essential fields only
CREATE TABLE health_concern_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concern_name text NOT NULL UNIQUE,
  brief_description text,
  suggested_by text DEFAULT 'system',
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by text
);

-- Create indexes for performance
CREATE INDEX idx_health_concern_suggestions_status ON health_concern_suggestions(status);
CREATE INDEX idx_health_concern_suggestions_suggested_by ON health_concern_suggestions(suggested_by);

-- Enable RLS
ALTER TABLE health_concern_suggestions ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Users can view approved suggestions" ON health_concern_suggestions
  FOR SELECT USING (status = 'approved' OR suggested_by = auth.uid()::text);

CREATE POLICY "Users can insert their own suggestions" ON health_concern_suggestions
  FOR INSERT WITH CHECK (suggested_by = auth.uid()::text);

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

-- Insert all the health concerns data
INSERT INTO health_concern_suggestions (concern_name, brief_description, suggested_by, status, created_at, reviewed_at) VALUES
('Sore Throat', 'Pain or irritation in the throat, often due to infection or strain, manageable with natural remedies like honey or herbal teas.', 'system', 'approved', NOW(), NOW()),
('Depression', 'Persistent sadness or loss of interest, which can be supported with natural approaches like exercise, omega-3s, or mindfulness.', 'system', 'approved', NOW(), NOW()),
('Joint Pain', 'Discomfort or stiffness in joints, often linked to arthritis or injury, relieved by turmeric or gentle movement.', 'system', 'approved', NOW(), NOW()),
('Anxiety', 'Excessive worry or nervousness, addressable with calming herbs like chamomile or breathing exercises.', 'system', 'approved', NOW(), NOW()),
('Fatigue', 'Ongoing tiredness not relieved by rest, potentially eased with adaptogens like ashwagandha or improved sleep.', 'system', 'approved', NOW(), NOW()),
('Cold', 'Common viral infection causing runny nose or cough, treatable with vitamin C or elderberry.', 'system', 'approved', NOW(), NOW()),
('High Blood Pressure', 'Elevated blood pressure, manageable with hawthorn, a plant-based diet, or stress reduction.', 'system', 'approved', NOW(), NOW()),
('Headache', 'Pain in the head, often due to tension or dehydration, alleviated by magnesium or peppermint oil.', 'system', 'approved', NOW(), NOW()),
('Allergies', 'Reactions to pollen or food causing sneezing, treatable with quercetin or local honey.', 'system', 'approved', NOW(), NOW()),
('Stress', 'Mental or physical tension, reducible with lavender, yoga, or meditation.', 'system', 'approved', NOW(), NOW()),
('Eye Strain', 'Fatigue or discomfort from prolonged screen use, eased with eye exercises or bilberry.', 'system', 'approved', NOW(), NOW()),
('Back Pain', 'Discomfort in the back, often from poor posture, relieved by stretching or anti-inflammatory herbs.', 'system', 'approved', NOW(), NOW()),
('Cough', 'Frequent throat clearing or irritation, soothed with eucalyptus or warm teas.', 'system', 'approved', NOW(), NOW()),
('Cancer', 'Serious condition involving uncontrolled cell growth, supported by immune-boosting remedies like medicinal mushrooms (consult a doctor).', 'system', 'approved', NOW(), NOW()),
('Weak Immunity', 'Frequent illness due to low immune function, strengthened with zinc or echinacea.', 'system', 'approved', NOW(), NOW()),
('Skin Irritation', 'Redness or itching on the skin, treatable with aloe vera or dietary adjustments.', 'system', 'approved', NOW(), NOW()),
('Poor Circulation', 'Reduced blood flow, improved with ginkgo biloba or regular movement.', 'system', 'approved', NOW(), NOW()),
('Digestive Issues', 'Problems like bloating or IBS, managed with probiotics or ginger.', 'system', 'approved', NOW(), NOW()),
('Insomnia', 'Difficulty sleeping, addressable with valerian root or a consistent sleep schedule.', 'system', 'approved', NOW(), NOW()),
('Hair Loss', 'Thinning or loss of hair, potentially supported by biotin or scalp massages.', 'system', 'approved', NOW(), NOW()),
('Chronic Fatigue', 'Persistent exhaustion not relieved by rest, eased with B vitamins or energy-boosting herbs.', 'system', 'approved', NOW(), NOW()),
('Hormonal Imbalances', 'Irregular hormones (e.g., PCOS), balanced with vitex or dietary changes.', 'system', 'approved', NOW(), NOW()),
('Immune System Weakness', 'Frequent infections, boosted with elderberry or medicinal mushrooms.', 'system', 'approved', NOW(), NOW()),
('Parasites', 'Intestinal parasites causing digestive issues, treated with black walnut or wormwood.', 'system', 'approved', NOW(), NOW()),
('Skin Conditions', 'Chronic issues like eczema, managed with tea tree oil or omega-3s.', 'system', 'approved', NOW(), NOW()),
('Low Energy and Adrenal Fatigue', 'Persistent low energy from adrenal stress, supported by licorice root or rest.', 'system', 'approved', NOW(), NOW()),
('Cardiovascular Health', 'Issues like high cholesterol, improved with CoQ10 or plant-based diets.', 'system', 'approved', NOW(), NOW()),
('Blood Sugar Imbalances', 'Fluctuations like pre-diabetes, managed with cinnamon or low-glycemic diets.', 'system', 'approved', NOW(), NOW()),
('Respiratory Issues', 'Conditions like asthma, eased with eucalyptus or breathing exercises.', 'system', 'approved', NOW(), NOW()),
('Weight Management', 'Challenges with weight, supported by green tea extract or exercise.', 'system', 'approved', NOW(), NOW());
