import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, Video, Clock, ArrowRight, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Json } from "@/integrations/supabase/types";
import { Swipeable } from "@/components/ui/swipeable";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DebugData } from "@/components/ui/debug-data";

type SymptomType = Database['public']['Enums']['symptom_type'];

interface VideoLink {
  title: string;
  url: string;
}

interface RelatedItem {
  id: string;
  [key: string]: any;
}

// Helper function to safely convert Json to VideoLink array
const parseVideoLinks = (links: Json | null): VideoLink[] => {
  if (!links) return [];
  
  try {
    if (typeof links === 'string') {
      try {
        links = JSON.parse(links);
      } catch (e) {
        console.error('Error parsing video links string:', e);
        return [];
      }
    }
    
    if (!Array.isArray(links)) {
      console.error('Video links is not an array:', links);
      return [];
    }
    
    return links
      .filter((link): link is Record<string, any> => 
        typeof link === 'object' && link !== null)
      .map(link => ({
        title: typeof link.title === 'string' ? link.title : '',
        url: typeof link.url === 'string' ? link.url : ''
      }))
      .filter(link => link.url.trim() !== '');
      
  } catch (e) {
    console.error('Error processing video links:', e);
    return [];
  }
};

// Safely ensure the data is an array
const ensureArray = <T extends unknown>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }
  return [];
};

const SymptomDetail = () => {
  const { symptom } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  console.log("Symptom ID from params:", symptom);

  // Set the right section to be visible when this component mounts
  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(false);
  }, [setShowRightSection]);

  // Fetch symptom details by ID
  const { data: symptomDetails, isLoading, error } = useQuery({
    queryKey: ['symptom-details', symptom],
    queryFn: async () => {
      if (!symptom) return null;
      
      console.log("Fetching symptom details for ID:", symptom);
      
      // First attempt - try to get by ID
      const { data: dataById, error: errorById } = await supabase
        .from('symptom_details')
        .select('*')
        .eq('id', symptom)
        .maybeSingle();
      
      if (errorById) {
        console.error("Error fetching symptom details by ID:", errorById);
      }
      
      if (dataById) {
        console.log("Found symptom by ID:", dataById);
        return dataById;
      }
      
      // Second attempt - try to find by symptom name
      console.log("Attempting to find symptom by name:", symptom);
      const { data: dataByName, error: errorByName } = await supabase
        .from('symptom_details')
        .select('*')
        .ilike('symptom', symptom)
        .maybeSingle();
      
      if (errorByName) {
        console.error("Error fetching symptom details by name:", errorByName);
        toast({
          title: "Error",
          description: "Failed to load symptom details",
          variant: "destructive"
        });
        throw errorByName;
      }
      
      if (dataByName) {
        console.log("Found symptom by name:", dataByName);
        return dataByName;
      }
      
      // Third attempt - do a direct fetch by ID (some UUIDs might have inconsistent formatting)
      try {
        const { data: directData } = await supabase
          .rpc('get_symptom_by_id', { id_param: symptom });
          
        if (directData && directData.length > 0) {
          console.log("Found symptom via direct ID lookup:", directData[0]);
          return directData[0];
        }
      } catch (directLookupError) {
        console.error("Error in direct symptom lookup:", directLookupError);
      }
      
      console.log("No symptom found by ID or name");
      return null;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!symptom
  });

  // Fetch related content for this symptom
  const { data: relatedContent } = useQuery({
    queryKey: ['symptom-content', symptomDetails?.symptom],
    queryFn: async () => {
      if (!symptomDetails?.symptom) return {
        related_remedies: [],
        related_experts: [],
        related_articles: [],
        related_links: []
      };
      
      console.log("Fetching related content for symptom:", symptomDetails.symptom);
      
      const { data, error } = await supabase
        .rpc('get_symptom_related_content', { p_symptom: symptomDetails.symptom });
      
      if (error) {
        console.error("Error fetching related content:", error);
        throw error;
      }
      
      console.log("Related content:", data);
      
      return data[0] || {
        related_remedies: [],
        related_experts: [],
        related_articles: [],
        related_links: []
      };
    },
    enabled: !!symptomDetails?.symptom
  });

  // Extract video links from symptom details for the right sidebar
  useEffect(() => {
    if (symptomDetails?.video_links) {
      try {
        const parsedLinks = parseVideoLinks(symptomDetails.video_links);
        
        console.log("Sending video links to right section:", parsedLinks);
        
        window.dispatchEvent(new CustomEvent('symptom-videos', { 
          detail: {
            videoLinks: parsedLinks,
            videoDescription: symptomDetails.video_description || `Videos related to ${symptomDetails.symptom}`
          }
        }));
      } catch (e) {
        console.error('Error processing video links:', e);
      }
    }
  }, [symptomDetails]);

  if (isLoading) {
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
          <div className="h-64 w-full animate-pulse rounded-lg bg-muted"></div>
          <div className="mt-8 space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !symptomDetails) {
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
          
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn't find this symptom. It may have been removed or doesn't exist.
            </AlertDescription>
          </Alert>
          
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
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <DebugData 
              data={{ 
                params: symptom, 
                error: error?.message, 
                lookupType: "direct"
              }}
              title="Symptom Lookup Debug"
              expanded={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // Use parseVideoLinks to safely convert video_links to array of VideoLink objects
  const videoLinks = parseVideoLinks(symptomDetails.video_links);

  // Process related content to ensure they are arrays
  const relatedRemedies = ensureArray<RelatedItem>(relatedContent?.related_remedies || []);
  const relatedExperts = ensureArray<RelatedItem>(relatedContent?.related_experts || []);
  const relatedArticles = ensureArray<RelatedItem>(relatedContent?.related_articles || []);
  const relatedLinks = ensureArray<RelatedItem>(relatedContent?.related_links || []);

  // Safely check if arrays have items
  const hasRelatedRemedies = relatedRemedies.length > 0;
  const hasRelatedExperts = relatedExperts.length > 0;
  const hasRelatedArticles = relatedArticles.length > 0;
  const hasRelatedLinks = relatedLinks.length > 0;

  const handleOpenFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  return (
    <Swipeable 
      className="min-h-screen bg-background pt-16"
      onSwipe={(direction) => {
        if (direction === 'right') {
          navigate(-1);
        }
      }}
    >
      <div className="container mx-auto p-4 sm:p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <DebugData
          data={{ 
            symptomId: symptom,
            symptomDetails,
            videoLinks,
            relatedContent
          }}
          title="Symptom Data"
          className="mb-4"
        />

        <div className="space-y-8">
          {/* Hero Section with Image and Title */}
          <div className="relative rounded-lg overflow-hidden">
            {symptomDetails.image_url ? (
              <div>
                <div 
                  className="cursor-pointer"
                  onClick={() => handleOpenFullscreen(symptomDetails.image_url!)}
                >
                  <AspectRatio ratio={16/9} className="bg-muted">
                    <img 
                      src={symptomDetails.image_url} 
                      alt={symptomDetails.symptom} 
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <Badge className="self-start mb-2 bg-primary/80 hover:bg-primary text-sm">
                    Symptom
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{symptomDetails.symptom}</h1>
                  <p className="text-lg text-white/90 mt-2 max-w-2xl">
                    {symptomDetails.brief_description || 
                      `Learn about ${symptomDetails.symptom?.toLowerCase() || 'this symptom'} and natural remedies.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-accent to-accent/30 rounded-lg p-6 md:p-8">
                <div className="flex flex-col gap-2">
                  <Badge className="self-start mb-2 bg-primary/80 hover:bg-primary text-sm">
                    Symptom
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold">{symptomDetails.symptom}</h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    {symptomDetails.brief_description || 
                      `Explore natural remedies and expert advice for ${symptomDetails.symptom?.toLowerCase() || 'this symptom'}.`}
                  </p>
                </div>
              </div>
            )}
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
                  <a 
                    key={index}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block touch-manipulation"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-0">
                        <AspectRatio ratio={16/9} className="bg-muted relative">
                          {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                            <>
                              <img 
                                src={getYoutubeVideoId(video.url) ? 
                                  `https://img.youtube.com/vi/${getYoutubeVideoId(video.url)}/hqdefault.jpg` : 
                                  ''
                                } 
                                alt={video.title} 
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-accent flex items-center justify-center">
                              <span className="text-muted-foreground">Video Preview</span>
                            </div>
                          )}
                        </AspectRatio>
                        <div className="p-3 text-left">
                          <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
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
          {hasRelatedRemedies && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Natural Remedies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {relatedRemedies.map((remedy) => (
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
          {hasRelatedExperts && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Expert Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {relatedExperts.map((expert) => (
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
          {hasRelatedArticles && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedArticles.map((article) => (
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
          {hasRelatedLinks && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Related Resources</h2>
              <div className="grid gap-3">
                {relatedLinks.map((link) => (
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
                  <a 
                    key={index} 
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block touch-manipulation"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <AspectRatio ratio={16/9} className="bg-muted relative">
                          {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                            <>
                              <img 
                                src={getYoutubeVideoId(video.url) ? 
                                  `https://img.youtube.com/vi/${getYoutubeVideoId(video.url)}/hqdefault.jpg` : 
                                  ''
                                }
                                alt={video.title} 
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <PlayCircle className="h-12 w-12 text-primary opacity-90" />
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Video className="h-12 w-12 text-primary opacity-90" />
                            </div>
                          )}
                        </AspectRatio>
                        <div className="p-4">
                          <h3 className="font-medium">{video.title}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Fullscreen Image Dialog */}
      <Dialog 
        open={!!fullscreenImage} 
        onOpenChange={(open) => !open && setFullscreenImage(null)}
      >
        <DialogContent className="max-w-[90vw] p-0 bg-background/80 backdrop-blur-sm">
          <div className="w-full h-[calc(100vh-8rem)]">
            <ZoomableImage 
              src={fullscreenImage || ''} 
              alt="Fullscreen view" 
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Swipeable>
  );
};

function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default SymptomDetail;
