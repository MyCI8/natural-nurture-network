import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Star, Clock } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Remedy = Database['public']['Tables']['remedies']['Row'];

interface OptimizedRemedyCardProps {
  remedy: Remedy;
  onClick?: () => void;
  showStats?: boolean;
  isLiked?: boolean;
  onLike?: () => void;
  className?: string;
}

// Memoized component to prevent unnecessary re-renders
export const OptimizedRemedyCard = React.memo<OptimizedRemedyCardProps>(({
  remedy,
  onClick,
  showStats = false,
  isLiked = false,
  onLike,
  className
}) => {
  const handleLikeClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.();
  }, [onLike]);

  const handleCardClick = React.useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group",
        className
      )}
      onClick={handleCardClick}
    >
      {remedy.main_image_url && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={remedy.main_image_url}
            alt={remedy.main_image_description || remedy.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {showStats && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Eye className="h-3 w-3 mr-1" />
                {remedy.click_count || 0}
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{remedy.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {remedy.brief_description || remedy.summary}
        </p>
        
        {remedy.health_concerns && remedy.health_concerns.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {remedy.health_concerns.slice(0, 3).map((healthConcern) => (
              <Badge key={healthConcern} variant="outline" className="text-xs">
                {healthConcern}
              </Badge>
            ))}
            {remedy.health_concerns.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{remedy.health_concerns.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(remedy.created_at || '').toLocaleDateString()}
          </div>
          
          {onLike && (
            <button
              onClick={handleLikeClick}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors hover:text-primary",
                isLiked ? "text-red-500" : "text-muted-foreground"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedRemedyCard.displayName = 'OptimizedRemedyCard';

export default OptimizedRemedyCard;