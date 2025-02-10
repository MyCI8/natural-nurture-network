
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

interface RelatedRemedy {
  id: string;
  name: string;
  summary: string;
  image_url: string | null;
}

interface RelatedExpert {
  id: string;
  full_name: string;
  title: string;
  image_url: string | null;
}

interface RelatedArticle {
  id: string;
  title: string;
  image_url: string | null;
}

interface RelatedLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
}

interface SymptomContent {
  related_remedies: RelatedRemedy[];
  related_experts: RelatedExpert[];
  related_articles: RelatedArticle[];
  related_links: RelatedLink[];
}

interface GetSymptomRelatedContentResponse {
  related_remedies: RelatedRemedy[];
  related_experts: RelatedExpert[];
  related_articles: RelatedArticle[];
  related_links: RelatedLink[];
  related_ingredients: any[]; // Added this to match the RPC function's response
}

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

  const { data: relatedContent } = useQuery<SymptomContent>({
    queryKey: ['symptom-content', currentSymptom],
    queryFn: async () => {
      if (!currentSymptom) return {
        related_remedies: [],
        related_experts: [],
        related_articles: [],
        related_links: []
      };
      
      const { data, error } = await supabase
        .rpc('get_symptom_related_content', { p_symptom: currentSymptom });
      
      if (error) throw error;
      
      // Properly cast the response data using type assertion
      const rawContent = data[0] as unknown as GetSymptomRelatedContentResponse;
      return {
        related_remedies: (rawContent.related_remedies || []) as RelatedRemedy[],
        related_experts: (rawContent.related_experts || []) as RelatedExpert[],
        related_articles: (rawContent.related_articles || []) as RelatedArticle[],
        related_links: (rawContent.related_links || []) as RelatedLink[]
      };
    },
    enabled: !!currentSymptom
  });

  const { data: symptomDetails } = useQuery({
    queryKey: ['symptom-details', currentSymptom],
    queryFn: async () => {
      if (!currentSymptom) return null;
      
      const { data, error } = await supabase
        .from('symptom_details')
        .select('*')
        .eq('symptom', currentSymptom)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentSymptom
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

          {/* Related Remedies */}
          {relatedContent?.related_remedies && relatedContent.related_remedies.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Natural Remedies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedContent.related_remedies.map((remedy) => (
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

          {/* Related Experts */}
          {relatedContent?.related_experts && relatedContent.related_experts.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Expert Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedContent.related_experts.map((expert) => (
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

          {/* Related Articles */}
          {relatedContent?.related_articles && relatedContent.related_articles.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedContent.related_articles.map((article) => (
                  <Card key={article.id} className="p-4">
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-32 object-cover rounded mb-4"
                      />
                    )}
                    <h3 className="font-medium line-clamp-2">{article.title}</h3>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Related Links */}
          {relatedContent?.related_links && relatedContent.related_links.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Related Links</h2>
              <div className="grid gap-4">
                {relatedContent.related_links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <h3 className="font-medium">{link.title}</h3>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                    )}
                  </a>
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
