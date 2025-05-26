
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Star, Share2, Heart, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import MediaContainer from "@/components/ui/media-container";

const RemedyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
            <Button variant="ghost" size="icon" className="rounded-full touch-manipulation touch-button">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {/* Hero Image */}
        <div className="px-4 pt-4">
          <MediaContainer 
            aspectRatio="auto"
            imageUrl={remedy.image_url || "/placeholder.svg"}
            imageAlt={remedy.name}
          >
            <img
              src={remedy.image_url || "/placeholder.svg"}
              alt={remedy.name}
              className="w-full h-full object-cover"
            />
          </MediaContainer>
        </div>

        {/* Remedy Info */}
        <div className="p-4 space-y-6">
          {/* Title and basic info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {remedy.name}
              </h1>
              <div className="flex items-center gap-1 ml-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              {remedy.summary}
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>15 min prep</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>2.3k tried</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">About this remedy</h2>
            <p className="text-muted-foreground leading-relaxed">
              {remedy.description || "This natural remedy has been used for generations to help with various health concerns. Made with simple, natural ingredients that you likely already have at home."}
            </p>
          </div>

          {/* Ingredients Section */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Ingredients</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Main ingredient</span>
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Supporting ingredients</span>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">How to prepare</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  1
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gather all ingredients and ensure they are fresh and clean.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  2
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mix ingredients according to traditional preparation methods.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  3
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Apply or consume as directed for best results.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Note */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900">
            <CardContent className="p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
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
