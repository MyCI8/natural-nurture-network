import React from 'react';
import { Video } from '@/types/video';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, Share2, X } from 'lucide-react';
import Comments from '@/components/video/Comments';
import { getCdnUrl } from '@/utils/cdnUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CommentPanelProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  userLikes: Record<string, boolean>;
  userSaves: string[];
  handleLike: (videoId: string) => void;
  handleSave: (videoId: string, e: React.MouseEvent) => void;
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  video,
  isOpen,
  onClose,
  currentUser,
  userLikes,
  userSaves,
  handleLike,
  handleSave,
}) => {
  const isMobile = useIsMobile();

  if (!video) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 overlay-bg" onClick={onClose} />
      )}
      
      {/* Comment panel */}
      <div className={`
        fixed top-0 right-0 h-full bg-background border-l border-border z-50
        ${isMobile ? 'w-full' : 'w-[400px]'}
        comment-panel-slide ${isOpen ? 'open' : ''}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Comments</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Post info */}
        <div className="p-4 border-b border-border">
          {/* User info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              {video.creator?.avatar_url ? (
                <AvatarImage 
                  src={getCdnUrl(video.creator.avatar_url) || ''} 
                  alt={video.creator?.full_name || 'User'} 
                />
              ) : (
                <AvatarFallback className="bg-[#E8F5E9] text-[#4CAF50]">
                  {video.creator?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium text-foreground">
                {video.creator?.full_name || 'Anonymous User'}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(video.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground mb-3 leading-relaxed">
            {video.description}
          </p>

          {/* Media bar */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 transition-colors ${
                userLikes[video.id] 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleLike(video.id)}
            >
              <Heart className="h-4 w-4" fill={userLikes[video.id] ? "currentColor" : "none"} />
              <span className="text-xs">{video.likes_count || 0}</span>
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{video.comments_count || 0}</span>
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 transition-colors ${
                userSaves?.includes(video.id) 
                  ? 'text-blue-500 hover:text-blue-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={(e) => handleSave(video.id, e)}
            >
              <Bookmark 
                className="h-4 w-4" 
                fill={userSaves?.includes(video.id) ? "currentColor" : "none"}
              />
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments section */}
        <div className="flex-1 overflow-y-auto">
          <Comments videoId={video.id} currentUser={currentUser} />
        </div>
      </div>
    </>
  );
};

export default CommentPanel;