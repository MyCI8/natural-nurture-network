
// Comprehensive health concerns covering symptoms, conditions, health goals, and body systems
export const healthConcerns = [
  // Symptoms
  'Cough', 'Cold', 'Sore Throat', 'Headache', 'Joint Pain', 'Back Pain', 'Eye Strain', 'Fatigue',
  'Skin Irritation', 'Hair Loss', 'Insomnia', 'Nausea', 'Fever', 'Muscle Pain', 'Bloating',
  
  // Conditions
  'Cancer', 'High Blood Pressure', 'Diabetes', 'Arthritis', 'Asthma', 'Allergies', 'Eczema',
  'Acne', 'Migraine', 'Fibromyalgia', 'IBS', 'GERD', 'UTI', 'Sinusitis', 'Bronchitis',
  
  // Mental Health & Wellness
  'Stress', 'Anxiety', 'Depression', 'Mental Clarity', 'Memory Support', 'Focus Enhancement',
  'Mood Balance', 'Emotional Wellness', 'Sleep Quality', 'Relaxation',
  
  // Health Goals
  'Immunity Support', 'Weight Management', 'Energy Boost', 'Detoxification', 'Anti-Aging',
  'Skin Health', 'Hair Growth', 'Teeth Whitening', 'Breath Freshening', 'Circulation Improvement',
  'Metabolism Boost', 'Hormone Balance', 'Blood Sugar Control', 'Cholesterol Management',
  
  // Body Systems
  'Digestive Health', 'Cardiovascular Health', 'Respiratory Health', 'Immune System',
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
