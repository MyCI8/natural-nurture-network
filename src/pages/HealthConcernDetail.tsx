
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Temporary data until migration is applied
const healthConcernData = {
  'Sore Throat': {
    name: 'Sore Throat',
    brief_description: 'Pain or irritation in the throat',
    description: 'Pain or irritation in the throat, often due to infection or strain, manageable with natural remedies like honey or herbal teas.'
  },
  'Depression': {
    name: 'Depression',
    brief_description: 'Persistent sadness or loss of interest',
    description: 'Persistent sadness or loss of interest, which can be supported with natural approaches like exercise, omega-3s, or mindfulness.'
  },
  'Joint Pain': {
    name: 'Joint Pain',
    brief_description: 'Discomfort or stiffness in joints',
    description: 'Discomfort or stiffness in joints, often linked to arthritis or injury, relieved by turmeric or gentle movement.'
  },
  'Anxiety': {
    name: 'Anxiety',
    brief_description: 'Excessive worry or nervousness',
    description: 'Excessive worry or nervousness, addressable with calming herbs like chamomile or breathing exercises.'
  },
  'Fatigue': {
    name: 'Fatigue',
    brief_description: 'Ongoing tiredness not relieved by rest',
    description: 'Ongoing tiredness not relieved by rest, potentially eased with adaptogens like ashwagandha or improved sleep.'
  },
  'Cold': {
    name: 'Cold',
    brief_description: 'Common viral infection',
    description: 'Common viral infection causing runny nose or cough, treatable with vitamin C or elderberry.'
  },
  'High Blood Pressure': {
    name: 'High Blood Pressure',
    brief_description: 'Elevated blood pressure',
    description: 'Elevated blood pressure, manageable with hawthorn, a plant-based diet, or stress reduction.'
  },
  'Headache': {
    name: 'Headache',
    brief_description: 'Pain in the head',
    description: 'Pain in the head, often due to tension or dehydration, alleviated by magnesium or peppermint oil.'
  },
  'Allergies': {
    name: 'Allergies',
    brief_description: 'Reactions to pollen or food',
    description: 'Reactions to pollen or food causing sneezing, treatable with quercetin or local honey.'
  },
  'Stress': {
    name: 'Stress',
    brief_description: 'Mental or physical tension',
    description: 'Mental or physical tension, reducible with lavender, yoga, or meditation.'
  },
  'Eye Strain': {
    name: 'Eye Strain',
    brief_description: 'Fatigue from prolonged screen use',
    description: 'Fatigue or discomfort from prolonged screen use, eased with eye exercises or bilberry.'
  },
  'Back Pain': {
    name: 'Back Pain',
    brief_description: 'Discomfort in the back',
    description: 'Discomfort in the back, often from poor posture, relieved by stretching or anti-inflammatory herbs.'
  },
  'Cough': {
    name: 'Cough',
    brief_description: 'Frequent throat clearing',
    description: 'Frequent throat clearing or irritation, soothed with eucalyptus or warm teas.'
  },
  'Cancer': {
    name: 'Cancer',
    brief_description: 'Serious condition involving cell growth',
    description: 'Serious condition involving uncontrolled cell growth, supported by immune-boosting remedies like medicinal mushrooms (consult a doctor).'
  },
  'Weak Immunity': {
    name: 'Weak Immunity',
    brief_description: 'Frequent illness due to low immune function',
    description: 'Frequent illness due to low immune function, strengthened with zinc or echinacea.'
  },
  'Skin Irritation': {
    name: 'Skin Irritation',
    brief_description: 'Redness or itching on the skin',
    description: 'Redness or itching on the skin, treatable with aloe vera or dietary adjustments.'
  },
  'Poor Circulation': {
    name: 'Poor Circulation',
    brief_description: 'Reduced blood flow',
    description: 'Reduced blood flow, improved with ginkgo biloba or regular movement.'
  },
  'Digestive Issues': {
    name: 'Digestive Issues',
    brief_description: 'Problems like bloating or IBS',
    description: 'Problems like bloating or IBS, managed with probiotics or ginger.'
  },
  'Insomnia': {
    name: 'Insomnia',
    brief_description: 'Difficulty sleeping',
    description: 'Difficulty sleeping, addressable with valerian root or a consistent sleep schedule.'
  },
  'Hair Loss': {
    name: 'Hair Loss',
    brief_description: 'Thinning or loss of hair',
    description: 'Thinning or loss of hair, potentially supported by biotin or scalp massages.'
  },
  'Chronic Fatigue': {
    name: 'Chronic Fatigue',
    brief_description: 'Persistent exhaustion not relieved by rest',
    description: 'Persistent exhaustion not relieved by rest, eased with B vitamins or energy-boosting herbs.'
  },
  'Hormonal Imbalances': {
    name: 'Hormonal Imbalances',
    brief_description: 'Irregular hormones',
    description: 'Irregular hormones (e.g., PCOS), balanced with vitex or dietary changes.'
  },
  'Immune System Weakness': {
    name: 'Immune System Weakness',
    brief_description: 'Frequent infections',
    description: 'Frequent infections, boosted with elderberry or medicinal mushrooms.'
  },
  'Parasites': {
    name: 'Parasites',
    brief_description: 'Intestinal parasites causing digestive issues',
    description: 'Intestinal parasites causing digestive issues, treated with black walnut or wormwood.'
  },
  'Skin Conditions': {
    name: 'Skin Conditions',
    brief_description: 'Chronic issues like eczema',
    description: 'Chronic issues like eczema, managed with tea tree oil or omega-3s.'
  },
  'Low Energy and Adrenal Fatigue': {
    name: 'Low Energy and Adrenal Fatigue',
    brief_description: 'Persistent low energy from adrenal stress',
    description: 'Persistent low energy from adrenal stress, supported by licorice root or rest.'
  },
  'Cardiovascular Health': {
    name: 'Cardiovascular Health',
    brief_description: 'Issues like high cholesterol',
    description: 'Issues like high cholesterol, improved with CoQ10 or plant-based diets.'
  },
  'Blood Sugar Imbalances': {
    name: 'Blood Sugar Imbalances',
    brief_description: 'Fluctuations like pre-diabetes',
    description: 'Fluctuations like pre-diabetes, managed with cinnamon or low-glycemic diets.'
  },
  'Respiratory Issues': {
    name: 'Respiratory Issues',
    brief_description: 'Conditions like asthma',
    description: 'Conditions like asthma, eased with eucalyptus or breathing exercises.'
  },
  'Weight Management': {
    name: 'Weight Management',
    brief_description: 'Challenges with weight',
    description: 'Challenges with weight, supported by green tea extract or exercise.'
  }
};

const HealthConcernDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Decode the concern name from URL
  const concernName = id ? decodeURIComponent(id) : '';
  const healthConcern = healthConcernData[concernName as keyof typeof healthConcernData];

  if (!healthConcern) {
    return (
      <div className="pt-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Health Concern Not Found</h1>
            <p className="text-muted-foreground">
              The health concern you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{healthConcern.name}</h1>
          {healthConcern.brief_description && (
            <p className="text-xl text-muted-foreground">
              {healthConcern.brief_description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {healthConcern.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {healthConcern.description}
                </p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Related Remedies</h2>
              <p className="text-muted-foreground">
                Remedies will be available once the health concerns system is fully integrated.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Expert Recommendations</h2>
              <p className="text-muted-foreground">
                Expert recommendations will be available once the health concerns system is fully integrated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthConcernDetail;
