
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
