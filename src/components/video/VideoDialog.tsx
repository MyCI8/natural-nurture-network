import React from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import Comments from '@/components/video/Comments';
import { Video, ProductLink } from '@/types/video';
import { X, MoreHorizontal, MessageCircle, Bookmark, Share2, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

const VideoDialog = ({ 
  video, 
  isOpen, 
  onClose,
  globalAudioEnabled = false,
  onAudioStateChange,
  userLikes = {},
  onLikeToggle,
  currentUser,
  productLinks = []
}: {
  video: (Video & { creator?: any }) | null;
  isOpen: boolean;
  onClose: () => void;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  userLikes?: Record<string, boolean>;
  onLikeToggle?: (videoId: string) => void;
  currentUser?: any;
  productLinks?: ProductLink[];
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  if (!video || !isOpen) return null;

  return (
    <div className="w-full bg-white dark:bg-dm-background min-h-screen">
      <div className="flex flex-col md:flex-row max-w-screen-2xl mx-auto h-[100dvh]">
        <div className="video-container flex-1 flex items-center justify-center bg-black h-[60vh] md:h-full relative overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 left-4 z-20 text-white bg-black/50 hover:bg-black/70 rounded-full touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoPlayer
              video={video}
              productLinks={productLinks}
              autoPlay={true}
              showControls={false}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={onAudioStateChange}
              isFullscreen={false}
              className="w-full h-full"
              objectFit="cover" 
              useAspectRatio={false} 
            />
          </div>
        </div>
        
        <div className="w-full md:w-[350px] bg-white dark:bg-dm-background flex flex-col h-full border-l border-gray-200 dark:border-dm-mist overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-dm-mist px-0 py-0">
            <div className="flex items-center mb-2">
              <Avatar className="h-8 w-8 mr-3">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                ) : (
                  <AvatarFallback className="dark:bg-dm-mist dark:text-dm-text">{(video.creator?.username || '?')[0]}</AvatarFallback>
                )}
              </Avatar>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto dark:text-dm-text touch-manipulation">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-dm-foreground dark:text-dm-text dark:border-dm-mist">
                  <DropdownMenuItem className="dark:text-dm-text">
                    View full screen
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 dark:text-red-400">
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="dark:text-dm-text">
                    Add to favorites
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-dm-mist" />
                  <DropdownMenuItem className="dark:text-dm-text">
                    Share to...
                  </DropdownMenuItem>
                  <DropdownMenuItem className="dark:text-dm-text">
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-dm-mist" />
                  <DropdownMenuItem className="dark:text-dm-text">
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div>
                <p className="text-sm text-left dark:text-dm-text">{video.description}</p>
                <p className="text-xs text-gray-500 dark:text-dm-text-supporting mt-1 text-left">
                  {new Date(video.created_at || '').toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mb-2 py-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500 dark:text-dm-text-supporting hover:text-[#4CAF50] dark:hover:text-dm-primary transition-transform hover:scale-110 h-11 w-11 touch-manipulation"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500 dark:text-dm-text-supporting hover:text-[#4CAF50] dark:hover:text-dm-primary transition-transform hover:scale-110 h-11 w-11 touch-manipulation"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500 dark:text-dm-text-supporting hover:text-[#4CAF50] dark:hover:text-dm-primary transition-transform hover:scale-110 h-11 w-11 touch-manipulation"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-dm-text-supporting mb-2 flex items-center gap-2">
                <span>{video.likes_count || 0} likes</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`p-0 h-6 w-6 hover:bg-transparent ${userLikes?.[video.id] ? 'text-red-500' : 'text-gray-500 dark:text-dm-text-supporting'}`}
                  onClick={() => onLikeToggle?.(video.id)}
                >
                  <Heart className={`h-5 w-5 ${userLikes?.[video.id] ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
          
          <Comments videoId={video.id} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default VideoDialog;
