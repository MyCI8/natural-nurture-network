import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Star, Share2, Heart, Bookmark, Eye, Calendar, Link, Leaf, Shield, Video, ChefHat, Pill, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSafeImageUrl } from "@/utils/imageValidation";

const RemedyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: remedy, isLoading } = useQuery({
    queryKey: ["remedy", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    if (!remedy) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: remedy.name,
          text: remedy.summary || remedy.brief_description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
          <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-6">
          <Skeleton className="w-full aspect-video rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!remedy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Remedy not found</h2>
          <Button onClick={() => navigate("/remedies")} variant="outline">
            Back to Remedies
          </Button>
        </div>
      </div>
    );
  }

  const safeImageUrl = getSafeImageUrl(remedy.image_url);
  
  // Safely handle ingredients array
  const ingredientsList = Array.isArray(remedy.ingredients) ? remedy.ingredients : [];
  
  // Safely handle related links
  const relatedLinks = Array.isArray(remedy.related_links) ? remedy.related_links : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full touch-manipulation active-scale touch-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full touch-manipulation touch-button">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full touch-manipulation touch-button">
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full touch-manipulation touch-button"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20 max-w-4xl mx-auto">
        {/* Hero Image */}
        <div className="px-4 pt-4">
          <div className="relative w-full bg-transparent rounded-xl overflow-hidden">
            <img
              src={safeImageUrl}
              alt={remedy.name}
              className="w-full object-contain"
              style={{ maxHeight: 400, minHeight: 200 }}
            />
          </div>
        </div>

        {/* Remedy Info */}
        <div className="p-4 space-y-6">
          {/* Title and basic info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {remedy.name}
              </h1>
              <div className="flex items-center gap-1 ml-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>
            
            {/* Status and Quick Info */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={remedy.status === 'published' ? 'default' : 'secondary'}>
                {remedy.status}
              </Badge>
            </div>

            {/* Brief Description */}
            {(remedy.summary || remedy.brief_description) && (
              <p className="text-muted-foreground leading-relaxed">
                {remedy.summary || remedy.brief_description}
              </p>
            )}

            {/* Quick stats */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{remedy.click_count || 0} views</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>2.3k tried</span>
              </div>
              {remedy.created_at && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(remedy.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {remedy.description && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">About this remedy</h2>
              <div 
                className="prose max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: remedy.description }}
              />
            </div>
          )}

          {/* Ingredients Section */}
          {ingredientsList.length > 0 && (
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Ingredients
                </h3>
                <div className="space-y-2">
                  {ingredientsList.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{ingredient}</span>
                      <Badge variant="outline" className="text-xs">Natural</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preparation Method - Using shopping_list field */}
          {remedy.shopping_list && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Preparation Method
              </h2>
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-4">
                  <div 
                    className="prose max-w-none text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: remedy.shopping_list }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dosage Instructions - Using video_description field */}
          {remedy.video_description && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Dosage Instructions
              </h2>
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {remedy.video_description}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Video Section */}
          {remedy.video_url && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Guide
              </h2>
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-4">
                  <a
                    href={remedy.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    Watch preparation video
                  </a>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Related Links */}
          {relatedLinks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Link className="h-5 w-5" />
                Related Links
              </h2>
              <div className="space-y-2">
                {relatedLinks.map((link, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-3">
                      <a
                        href={String(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {String(link)}
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Expert Recommendations with Safety Focus */}
          {remedy.expert_recommendations && Array.isArray(remedy.expert_recommendations) && remedy.expert_recommendations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Expert Recommendations & Precautions
              </h2>
              <div className="space-y-2">
                {remedy.expert_recommendations.map((recommendation, index) => (
                  <Card key={index} className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900">
                    <CardContent className="p-4">
                      <p className="text-sm text-amber-700 dark:text-amber-300">{String(recommendation)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Safety Note */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900">
            <CardContent className="p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Note
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Always consult with a healthcare professional before trying new remedies, especially if you have existing health conditions or are taking medications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RemedyDetail;
