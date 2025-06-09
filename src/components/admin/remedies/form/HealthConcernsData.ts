
// Comprehensive health concerns covering symptoms, conditions, health goals, and body systems
export const healthConcerns = [
  // Core Health Concerns - the ones you specified
  'Sore Throat', 'Depression', 'Joint Pain', 'Anxiety', 'Fatigue', 
  'Cold', 'High Blood Pressure', 'Headache', 'Allergies', 'Stress',
  'Eye Strain', 'Back Pain', 'Cough', 'Cancer', 'Weak Immunity',
  'Skin Irritation', 'Poor Circulation', 'Digestive Issues', 'Insomnia', 'Hair Loss',
  'Chronic Fatigue', 'Hormonal Imbalances', 'Immune System Weakness', 'Parasites', 'Skin Conditions',
  'Low Energy and Adrenal Fatigue', 'Cardiovascular Health', 'Blood Sugar Imbalances', 'Respiratory Issues', 'Weight Management',
  
  // Additional symptoms
  'Nausea', 'Fever', 'Muscle Pain', 'Bloating',
  
  // Additional conditions
  'Diabetes', 'Arthritis', 'Asthma', 'Eczema',
  'Acne', 'Migraine', 'Fibromyalgia', 'IBS', 'GERD', 'UTI', 'Sinusitis', 'Bronchitis',
  
  // Mental Health & Wellness
  'Mental Clarity', 'Memory Support', 'Focus Enhancement',
  'Mood Balance', 'Emotional Wellness', 'Sleep Quality', 'Relaxation',
  
  // Health Goals
  'Immunity Support', 'Energy Boost', 'Detoxification', 'Anti-Aging',
  'Skin Health', 'Hair Growth', 'Teeth Whitening', 'Breath Freshening', 'Circulation Improvement',
  'Metabolism Boost', 'Hormone Balance', 'Blood Sugar Control', 'Cholesterol Management',
  
  // Body Systems
  'Digestive Health', 'Respiratory Health', 'Immune System',
  'Nervous System', 'Reproductive Health', 'Bone Health', 'Liver Health', 'Kidney Health',
  'Thyroid Support', 'Adrenal Support', 'Gut Health', 'Brain Health', 'Heart Health'
];

export interface PendingConcern {
  id: string;
  concern_name: string;
  status: 'pending' | 'approved' | 'rejected';
  category?: string;
  brief_description?: string;
}

// Function to get all available health concerns (static + approved suggestions)
export const getAllHealthConcerns = async () => {
  try {
    // For now, return static concerns until migration is applied
    // TODO: Re-enable after migration is applied
    /*
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase
      .from("health_concern_suggestions" as any)
      .select('concern_name')
      .eq('status', 'approved');
    
    const approvedConcerns = data?.map((item: any) => item.concern_name) || [];
    return [...healthConcerns, ...approvedConcerns];
    */
    return healthConcerns;
  } catch (error) {
    console.error('Error fetching approved health concerns:', error);
    return healthConcerns;
  }
};
