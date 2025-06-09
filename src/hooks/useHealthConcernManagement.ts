
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { healthConcerns } from "@/components/admin/remedies/form/HealthConcernsData";

// Updated interface to match the static data structure
interface HealthConcern {
  id: string;
  name: string;
  brief_description?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useHealthConcernManagement = (
  filter: 'all' | 'recent',
  searchQuery: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert static health concerns data to match the expected interface
  const { data: healthConcernsData = [], isLoading, error } = useQuery({
    queryKey: ["admin-health-concerns", filter, searchQuery],
    queryFn: async () => {
      console.log("🔍 Using static health concerns data - migration pending");
      
      // Convert static data to match interface
      const staticHealthConcerns: HealthConcern[] = healthConcerns.map((concern, index) => ({
        id: String(index + 1),
        name: concern,
        brief_description: getDescriptionForConcern(concern),
        description: getDescriptionForConcern(concern),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Apply filtering
      let filteredConcerns = staticHealthConcerns;
      
      if (filter === 'recent') {
        // For static data, just return the first 10 as "recent"
        filteredConcerns = staticHealthConcerns.slice(0, 10);
      }

      // Apply search filtering
      if (searchQuery.trim()) {
        filteredConcerns = filteredConcerns.filter(concern =>
          concern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          concern.brief_description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return filteredConcerns;
    },
  });

  const updateHealthConcernMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HealthConcern> }) => {
      console.log("🔄 Health concerns table not yet available - migration pending");
      toast({
        title: "Migration Pending",
        description: "Health concerns updates will be available after database migration",
        variant: "destructive",
      });
      throw new Error("Health concerns table not yet available");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health concern updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concerns"] });
    },
    onError: (error) => {
      console.error("❌ Error in update mutation:", error);
    },
  });

  const deleteHealthConcernMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ Health concerns table not yet available - migration pending");
      toast({
        title: "Migration Pending",
        description: "Health concerns deletion will be available after database migration",
        variant: "destructive",
      });
      throw new Error("Health concerns table not yet available");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health concern deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concerns"] });
    },
    onError: (error) => {
      console.error("❌ Error in delete mutation:", error);
    },
  });

  return {
    healthConcerns: healthConcernsData,
    isLoading: false,
    error: null,
    updateHealthConcernMutation,
    deleteHealthConcernMutation
  };
};

// Helper function to get description for each concern
function getDescriptionForConcern(concernName: string): string {
  const descriptions: Record<string, string> = {
    'Sore Throat': 'Pain or irritation in the throat, often due to infection or strain, manageable with natural remedies like honey or herbal teas.',
    'Depression': 'Persistent sadness or loss of interest, which can be supported with natural approaches like exercise, omega-3s, or mindfulness.',
    'Joint Pain': 'Discomfort or stiffness in joints, often linked to arthritis or injury, relieved by turmeric or gentle movement.',
    'Anxiety': 'Excessive worry or nervousness, addressable with calming herbs like chamomile or breathing exercises.',
    'Fatigue': 'Ongoing tiredness not relieved by rest, potentially eased with adaptogens like ashwagandha or improved sleep.',
    'Cold': 'Common viral infection causing runny nose or cough, treatable with vitamin C or elderberry.',
    'High Blood Pressure': 'Elevated blood pressure, manageable with hawthorn, a plant-based diet, or stress reduction.',
    'Headache': 'Pain in the head, often due to tension or dehydration, alleviated by magnesium or peppermint oil.',
    'Allergies': 'Reactions to pollen or food causing sneezing, treatable with quercetin or local honey.',
    'Stress': 'Mental or physical tension, reducible with lavender, yoga, or meditation.',
    'Eye Strain': 'Fatigue or discomfort from prolonged screen use, eased with eye exercises or bilberry.',
    'Back Pain': 'Discomfort in the back, often from poor posture, relieved by stretching or anti-inflammatory herbs.',
    'Cough': 'Frequent throat clearing or irritation, soothed with eucalyptus or warm teas.',
    'Cancer': 'Serious condition involving uncontrolled cell growth, supported by immune-boosting remedies like medicinal mushrooms (consult a doctor).',
    'Weak Immunity': 'Frequent illness due to low immune function, strengthened with zinc or echinacea.',
    'Skin Irritation': 'Redness or itching on the skin, treatable with aloe vera or dietary adjustments.',
    'Poor Circulation': 'Reduced blood flow, improved with ginkgo biloba or regular movement.',
    'Digestive Issues': 'Problems like bloating or IBS, managed with probiotics or ginger.',
    'Insomnia': 'Difficulty sleeping, addressable with valerian root or a consistent sleep schedule.',
    'Hair Loss': 'Thinning or loss of hair, potentially supported by biotin or scalp massages.',
    'Chronic Fatigue': 'Persistent exhaustion not relieved by rest, eased with B vitamins or energy-boosting herbs.',
    'Hormonal Imbalances': 'Irregular hormones (e.g., PCOS), balanced with vitex or dietary changes.',
    'Immune System Weakness': 'Frequent infections, boosted with elderberry or medicinal mushrooms.',
    'Parasites': 'Intestinal parasites causing digestive issues, treated with black walnut or wormwood.',
    'Skin Conditions': 'Chronic issues like eczema, managed with tea tree oil or omega-3s.',
    'Low Energy and Adrenal Fatigue': 'Persistent low energy from adrenal stress, supported by licorice root or rest.',
    'Cardiovascular Health': 'Issues like high cholesterol, improved with CoQ10 or plant-based diets.',
    'Blood Sugar Imbalances': 'Fluctuations like pre-diabetes, managed with cinnamon or low-glycemic diets.',
    'Respiratory Issues': 'Conditions like asthma, eased with eucalyptus or breathing exercises.',
    'Weight Management': 'Challenges with weight, supported by green tea extract or exercise.'
  };

  return descriptions[concernName] || 'No description available';
}
