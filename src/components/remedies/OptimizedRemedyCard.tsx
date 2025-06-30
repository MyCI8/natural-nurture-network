
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import RemedyRatingDisplay from './RemedyRatingDisplay';

interface OptimizedRemedyCardProps {
  remedy: {
    id: string;
    name: string;
    summary: string;
    image_url: string;
  };
  isLiked: boolean;
  isSaved: boolean;
  rating: { average: number; count: number } | undefined;
  userRating: number | undefined;
  onRemedyClick: (remedyId: string) => void;
  onLike: (remedyId: string, e: React.MouseEvent) => void;
  onSave: (remedyId: string, e: React.MouseEvent) => void;
  onShare: (remedy: any, e: React.MouseEvent) => void;
  onOpenRatingModal: (remedy: any) => void;
}

const OptimizedRemedyCard: React.FC<OptimizedRemedyCardProps> = memo(({
  remedy,
  isLiked,
  isSaved,
  rating,
  userRating,
  onRemedyClick,
  onLike,
  onSave,
  onShare,
  onOpenRatingModal,
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer touch-manipulation">
      <CardContent className="p-0">
        <div onClick={() => onRemedyClick(remedy.id)}>
          <div className="aspect-[4/3] relative">
            <OptimizedImage
              src={remedy.image_url || '/placeholder.svg'}
              alt={remedy.name}
              width={400}
              height={300}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
          
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                {remedy.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {remedy.summary}
              </p>
            </div>

            {rating && (
              <div onClick={(e) => e.stopPropagation()}>
                <RemedyRatingDisplay
                  rating={rating}
                  userRating={userRating}
                  onRate={() => onOpenRatingModal(remedy)}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onLike(remedy.id, e)}
                  className={`touch-manipulation ${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onSave(remedy.id, e)}
                  className={`touch-manipulation ${isSaved ? 'text-blue-500' : ''}`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onShare(remedy, e)}
                  className="touch-manipulation"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedRemedyCard.displayName = 'OptimizedRemedyCard';

export default OptimizedRemedyCard;
