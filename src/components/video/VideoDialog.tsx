
import React, { useState, useEffect } from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import Comments from '@/components/video/Comments';
import { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface VideoDialogProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  globalAudioEnabled?: boolean;
  onAudioStateChange?: (isMuted: boolean) => void;
  userLikes?: Record<string, boolean>;
  onLikeToggle?: (videoId: string) => void;
  currentUser?: any;
}

const VideoDialog = ({ 
  video, 
  isOpen, 
  onClose,
  globalAudioEnabled = false,
  onAudioStateChange,
  userLikes = {},
  onLikeToggle,
  currentUser
}: VideoDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Debug log for current props
  useEffect(() => {
    if (video && isOpen) {
      console.log('VideoDialog opened with video:', video);
      console.log('Current user:', currentUser);
    }
  }, [video, isOpen, currentUser]);

  const handleViewDetails = () => {
    if (video) {
      navigate(`/explore/${video.id}`);
      onClose();
    }
  };

  const handleCopyLink = () => {
    if (video) {
      const url = `${window.location.origin}/explore/${video.id}`;
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Share it with others!"
          });
        })
        .catch((err) => {
          console.error('Error copying link:', err);
          toast({
            title: "Error",
            description: "Failed to copy link",
            variant: "destructive"
          });
        });
    }
  };

  if (!video || !isOpen) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row max-w-screen-2xl mx-auto">
        <div className="md:hidden p-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="hidden md:block md:w-[240px] border-r border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
              ) : (
                <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium text-sm">{video.creator?.username || 'Anonymous'}</span>
          </div>
        </div>
        
        <div className="comments-view-container relative md:flex-1 flex items-center justify-center">
          <div className="instagram-dialog-video w-full flex items-center justify-center">
            <VideoPlayer
              video={video}
              autoPlay={true}
              showControls={true}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={onAudioStateChange}
              isFullscreen={false}
              className="w-full"
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 text-black dark:text-white hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-full z-10 hidden md:flex"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="w-full md:w-[350px] bg-white dark:bg-gray-900 flex flex-col h-full border-l border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-4">
              <Avatar className="h-8 w-8 mr-3">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                ) : (
                  <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{video.creator?.username || 'Anonymous'}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-red-500">
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Add to favorites
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Share to...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onClose}>
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div>
                <p className="text-sm">{video.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(video.created_at || '').toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex space-x-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`p-0 hover:bg-transparent ${userLikes[video.id] ? 'text-red-500' : 'text-black dark:text-white'}`}
                    onClick={() => onLikeToggle?.(video.id)}
                  >
                    <Heart className={`h-6 w-6 ${userLikes[video.id] ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="p-0 hover:bg-transparent text-black dark:text-white"
                    onClick={handleViewDetails}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="p-0 hover:bg-transparent text-black dark:text-white"
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="p-0 hover:bg-transparent text-black dark:text-white"
                >
                  <Bookmark className="h-6 w-6" />
                </Button>
              </div>
              
              <p className="font-semibold text-sm">{video.likes_count || 0} likes</p>
            </div>
          </div>
          
          {/* Replace the old comments section with our new Comments component */}
          <Comments videoId={video.id} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default VideoDialog;
