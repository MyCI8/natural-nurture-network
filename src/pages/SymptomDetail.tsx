
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const SymptomDetail = () => {
  const { symptom } = useParams();
  const navigate = useNavigate();
  const [currentSymptom, setCurrentSymptom] = useState<SymptomType | null>(null);

  useEffect(() => {
    const allSymptoms: SymptomType[] = [
      'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
      'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
      'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
      'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
    ];
    
    const foundSymptom = allSymptoms.find(
      s => s.toLowerCase().replace(/\s+/g, '-') === symptom
    );
    
    if (foundSymptom) {
      setCurrentSymptom(foundSymptom);
    }
  }, [symptom]);

  const { data: remedies } = useQuery({
    queryKey: ['remedies', currentSymptom],
    queryFn: async () => {
      if (!currentSymptom) return [];
      const { data, error } = await supabase
        .from('remedies')
        .select(`
          id,
          name,
          summary,
          image_url,
          ingredients,
          expert_recommendations
        `)
        .contains('symptoms', [currentSymptom]);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentSymptom
  });

  const { data: experts } = useQuery({
    queryKey: ['experts', remedies],
    queryFn: async () => {
      if (!remedies?.length) return [];
      const expertIds = remedies.flatMap(r => r.expert_recommendations || []);
      if (!expertIds.length) return [];
      
      const { data, error } = await supabase
        .from('experts')
        .select('id, full_name, title, image_url')
        .in('id', expertIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!remedies?.length
  });

  if (!currentSymptom) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold">Symptom not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">{currentSymptom}</h1>
            <p className="text-lg text-muted-foreground">
              Explore natural remedies and expert advice for {currentSymptom.toLowerCase()}.
            </p>
          </div>

          {remedies && remedies.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Related Remedies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remedies.map((remedy) => (
                  <Card key={remedy.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    {remedy.image_url && (
                      <img
                        src={remedy.image_url}
                        alt={remedy.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="text-xl font-medium mb-2">{remedy.name}</h3>
                    <p className="text-muted-foreground">{remedy.summary}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {experts && experts.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Expert Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map((expert) => (
                  <Card key={expert.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                      {expert.image_url ? (
                        <img
                          src={expert.image_url}
                          alt={expert.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-semibold text-primary">
                            {expert.full_name[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{expert.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{expert.title}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomDetail;
