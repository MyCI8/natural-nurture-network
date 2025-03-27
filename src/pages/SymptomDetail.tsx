
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, Video, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useLayout } from "@/contexts/LayoutContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

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

interface VideoLink {
  title: string;
  url: string;
}

const SymptomDetail = () => {
  const { symptom } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setShowRightSection } = useLayout();
  const [currentSymptom, setCurrentSymptom] = useState<SymptomType | null>(null);
  const { toast } = useToast();

  // Set the right section to be visible when this component mounts
  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(false);
  }, [setShowRightSection]);

  // Logic to map between URL param and actual symptom type
  useEffect(() => {
    const allSymptoms: SymptomType[] = [
      'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
      'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
      'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
      'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
    ];
    
    if (symptom) {
      // Try to fetch by ID first (for when navigating from admin)
      const fetchSymptomById = async () => {
        try {
          const { data: symptomData, error } = await supabase
            .from('symptom_details')
            .select('symptom')
            .eq('id', symptom)
            .single();
            
          if (symptomData?.symptom) {
            setCurrentSymptom(symptomData.symptom as SymptomType);
          } else {
            // If no match by ID, try to match by slug
            const foundSymptom = allSymptoms.find(
              s => s.toLowerCase().replace(/\s+/g, '-') === symptom
            );
            
            if (foundSymptom) {
              setCurrentSymptom(foundSymptom);
            }
          }
        } catch (error) {
          console.error("Error fetching symptom:", error);
          toast({
            title: "Error",
            description: "Could not retrieve symptom details",
            variant: "destructive"
          });
        }
      };
      
      fetchSymptomById();
    }
  }, [symptom, toast]);

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
        related_remedies: (rawContent?.related_remedies || []) as RelatedRemedy[],
        related_experts: (rawContent?.related_experts || []) as RelatedExpert[],
        related_articles: (rawContent?.related_articles || []) as RelatedArticle[],
        related_links: (rawContent?.related_links || []) as RelatedLink[]
      };
    },
    enabled: !!currentSymptom
  });

  const { data: symptomDetails } = useQuery({
    queryKey: ['symptom-details', currentSymptom, symptom],
    queryFn: async () => {
      if (!symptom) return null;
      
      let query = supabase
        .from('symptom_details')
        .select('*');

      // Check if symptom is a UUID
      if (symptom.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('id', symptom);
      } else if (currentSymptom) {
        query = query.eq('symptom', currentSymptom);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error("Error fetching symptom details:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!symptom || !!currentSymptom
  });

  // Extract video links from symptom details for the right sidebar
  useEffect(() => {
    if (symptomDetails?.video_links) {
      try {
        // Parse the video links from the database
        const videoLinksString = typeof symptomDetails.video_links === 'string' 
          ? symptomDetails.video_links 
          : JSON.stringify(symptomDetails.video_links);
          
        const parsedLinks = JSON.parse(videoLinksString);
          
        // Pass the video links data to the right column
        window.dispatchEvent(new CustomEvent('symptom-videos', { 
          detail: {
            videoLinks: parsedLinks,
            videoDescription: symptomDetails.video_description || `Videos related to ${currentSymptom}`
          }
        }));
      } catch (e) {
        console.error('Error parsing video links:', e);
      }
    }
  }, [symptomDetails, currentSymptom]);

  if (!symptomDetails && !currentSymptom) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="bg-accent/30 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold">Symptom not found</h1>
            <p className="mt-2 text-muted-foreground">
              The symptom you're looking for doesn't exist or has been moved.
            </p>
            <Button 
              onClick={() => navigate('/symptoms')} 
              className="mt-4 touch-manipulation"
            >
              Browse All Symptoms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const videoLinks: VideoLink[] = [];
  if (symptomDetails?.video_links) {
    try {
      // Handle different formats of video_links from the database
      const linksValue = typeof symptomDetails.video_links === 'string' 
        ? JSON.parse(symptomDetails.video_links)
        : symptomDetails.video_links;
        
      if (Array.isArray(linksValue)) {
        linksValue.forEach(link => {
          if (link && typeof link === 'object' && 'url' in link && 'title' in link) {
            videoLinks.push({
              title: link.title as string,
              url: link.url as string
            });
          }
        });
      }
    } catch (e) {
      console.error('Error processing video links:', e);
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-4 sm:p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="space-y-8">
          {/* Header Section with Badge */}
          <div className="bg-gradient-to-r from-accent to-accent/30 rounded-lg p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <Badge className="self-start mb-2 bg-primary/80 hover:bg-primary text-sm">
                Symptom
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold">{symptomDetails?.symptom || currentSymptom}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {symptomDetails?.brief_description || 
                  `Explore natural remedies and expert advice for ${currentSymptom?.toLowerCase() || 'this symptom'}.`}
              </p>
            </div>
          </div>

          {/* Main Content and Description */}
          {symptomDetails?.description && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">About This Symptom</h2>
                <div 
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: symptomDetails.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Videos Section - Only visible on mobile */}
          {isMobile && videoLinks.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Helpful Videos
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {videoLinks.slice(0, 3).map((video, index) => (
                  <Card 
                    key={index} 
                    className="overflow-hidden hover:shadow-md transition-shadow touch-manipulation"
                    onClick={() => window.open(video.url, '_blank')}
                  >
                    <CardContent className="p-0">
                      <AspectRatio ratio={16/9} className="bg-muted relative">
                        {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="h-12 w-12 text-primary opacity-90" />
                          </div>
                        ) : null}
                      </AspectRatio>
                      <div className="p-4">
                        <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {videoLinks.length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 touch-manipulation"
                    onClick={() => {
                      const videoSection = document.getElementById('mobile-videos');
                      videoSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    See All Videos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Related Remedies Section */}
          {relatedContent?.related_remedies && relatedContent.related_remedies.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Natural Remedies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {relatedContent.related_remedies.map((remedy) => (
                  <Card 
                    key={remedy.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer touch-manipulation"
                    onClick={() => navigate(`/remedies/${remedy.id}`)}
                  >
                    {remedy.image_url && (
                      <AspectRatio ratio={16/9}>
                        <img
                          src={remedy.image_url}
                          alt={remedy.name}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    )}
                    <CardContent className="p-4">
                      <h3 className="text-xl font-medium mb-2">{remedy.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">{remedy.summary}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Expert Recommendations */}
          {relatedContent?.related_experts && relatedContent.related_experts.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Expert Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {relatedContent.related_experts.map((expert) => (
                  <Card 
                    key={expert.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer touch-manipulation"
                    onClick={() => navigate(`/experts/${expert.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          {expert.image_url ? (
                            <AvatarImage src={expert.image_url} alt={expert.full_name} />
                          ) : (
                            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                              {expert.full_name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{expert.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{expert.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Related Articles - Grid on desktop, carousel on mobile */}
          {relatedContent?.related_articles && relatedContent.related_articles.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedContent.related_articles.map((article) => (
                  <Card 
                    key={article.id} 
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
                    onClick={() => navigate(`/news/${article.id}`)}
                  >
                    {article.image_url && (
                      <AspectRatio ratio={4/3}>
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </AspectRatio>
                    )}
                    <CardContent className="p-3">
                      <h3 className="font-medium line-clamp-2 text-sm">{article.title}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Related Links */}
          {relatedContent?.related_links && relatedContent.related_links.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Related Resources</h2>
              <div className="grid gap-3">
                {relatedContent.related_links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-accent/50 hover:bg-accent/70 rounded-lg transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-background rounded-full p-2">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{link.title}</h3>
                        {link.description && (
                          <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Full Video Section for Mobile (all videos) */}
          {isMobile && videoLinks.length > 0 && (
            <section id="mobile-videos" className="mt-10 pt-4">
              <Separator className="mb-8" />
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                All Videos
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {videoLinks.map((video, index) => (
                  <Card 
                    key={index} 
                    className="overflow-hidden hover:shadow-md transition-shadow touch-manipulation"
                    onClick={() => window.open(video.url, '_blank')}
                  >
                    <CardContent className="p-0">
                      <AspectRatio ratio={16/9} className="bg-muted relative">
                        {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="h-12 w-12 text-primary opacity-90" />
                          </div>
                        ) : null}
                      </AspectRatio>
                      <div className="p-4">
                        <h3 className="font-medium">{video.title}</h3>
                      </div>
                    </CardContent>
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
