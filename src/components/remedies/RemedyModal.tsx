
import React from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MediaContainer from '@/components/ui/media-container';
import { getSafeImageUrl } from '@/utils/imageValidation';

interface RemedyModalProps {
  remedy: {
    id: string;
    name: string;
    summary: string;
    description?: string;
    image_url: string;
    instructions?: string;
    ingredients?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (remedyId: string, e: React.MouseEvent) => void;
  onShare: (remedy: any, e: React.MouseEvent) => void;
}

const RemedyModal: React.FC<RemedyModalProps> = ({
  remedy,
  isOpen,
  onClose,
  onSave,
  onShare
}) => {
  if (!isOpen || !remedy) return null;

  // Use only image_url field - standardized approach
  const safeImageUrl = getSafeImageUrl(remedy.image_url);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  console.log(`RemedyModal rendering: ${remedy.name} with image:`, {
    original: remedy.image_url,
    safe: safeImageUrl,
    is_placeholder: safeImageUrl === "/placeholder.svg"
  });

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center overflow-y-auto touch-manipulation"
      onClick={handleOverlayClick}
    >
      <div className="bg-background border border-border rounded-2xl max-w-[650px] w-[90%] mx-5 my-5 relative shadow-2xl md:max-w-[650px] md:w-[90%] md:h-auto max-md:max-w-none max-md:w-full max-md:h-full max-md:mx-0 max-md:my-0 max-md:rounded-none">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 left-4 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white border-0 touch-manipulation h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            {/* Media Section */}
            <MediaContainer 
              aspectRatio="16:9"
              imageUrl={safeImageUrl}
              imageAlt={remedy.name}
              className="bg-muted"
            >
              <img
                src={safeImageUrl}
                alt={remedy.name}
                className="w-full h-full object-cover"
                onLoad={() => {
                  console.log(`RemedyModal image loaded successfully for ${remedy.name}:`, safeImageUrl);
                }}
                onError={(e) => {
                  console.error(`RemedyModal image failed to load for ${remedy.name}:`, safeImageUrl);
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "/placeholder.svg") {
                    console.log('RemedyModal: Setting fallback to placeholder');
                    target.src = "/placeholder.svg";
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-white text-2xl font-bold mb-2 line-clamp-3">
                  {remedy.name}
                </h1>
                <p className="text-white/90 text-base line-clamp-3">
                  {remedy.summary}
                </p>
              </div>
            </MediaContainer>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Social Actions */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-red-50 hover:text-red-500 touch-manipulation"
                    onClick={(e) => onSave(remedy.id, e)}
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">2.3k</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 touch-manipulation"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">156</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 touch-manipulation"
                    onClick={(e) => onShare(remedy, e)}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="touch-manipulation"
                    onClick={(e) => onSave(remedy.id, e)}
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {remedy.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">About This Remedy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {remedy.description}
                  </p>
                </div>
              )}

              {/* Instructions */}
              {remedy.instructions && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">How to Use</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {remedy.instructions}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {remedy.ingredients && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {remedy.ingredients}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RemedyModal;
