
import React from 'react';
import { X, MoreHorizontal, Heart, MessageCircle, Share2, ShoppingCart, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductLink } from '@/types/video';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoControlsProps {
  controlsVisible: boolean;
  handleClose: () => void;
  handleLike: () => void;
  scrollToComments: () => void;
  handleShare: () => void;
  handleShowProducts: () => void;
  handleToggleMute: () => void;
  productLinks: ProductLink[];
  isMuted: boolean;
  userLikeStatus: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  controlsVisible,
  handleClose,
  handleLike,
  scrollToComments,
  handleShare,
  handleShowProducts,
  handleToggleMute,
  productLinks,
  isMuted,
  userLikeStatus
}) => {
  const isMobile = useIsMobile();
  
  // Only show touch-friendly controls on mobile devices
  if (!isMobile) {
    // For desktop, only show the product button if there are products
    return productLinks.length > 0 ? (
      <div className="absolute top-3 left-3 z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={handleShowProducts}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          <span className="text-xs">Products</span>
        </Button>
      </div>
    ) : null;
  }

  return (
    <>
      {/* Top Controls - Only visible when controls are visible */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose} 
          className="rounded-full bg-black/30 text-white hover:bg-black/50 touch-manipulation"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/30 text-white hover:bg-black/50 touch-manipulation"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Bottom Right Controls */}
      <div className={`absolute bottom-[calc(env(safe-area-inset-bottom)+20px)] right-3 flex flex-col items-center space-y-5 z-20 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90 ${userLikeStatus ? 'text-red-500' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`h-6 w-6 ${userLikeStatus ? 'fill-current' : ''}`} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
          onClick={scrollToComments}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
          onClick={handleShare}
        >
          <Share2 className="h-6 w-6" />
        </Button>
        
        {productLinks.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
            onClick={handleShowProducts}
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/30 text-white hover:bg-black/50 h-12 w-12 touch-manipulation transform transition-transform active:scale-90"
          onClick={handleToggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
};

export default VideoControls;
