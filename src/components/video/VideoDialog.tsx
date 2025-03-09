
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoPlayer from '@/components/video/VideoPlayer';
import { Video, ProductLink } from '@/types/video';
import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
  const [commentText, setCommentText] = useState('');
  
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['video-comments', video?.id],
    queryFn: async () => {
      if (!video?.id) return [];
      
      const { data, error } = await supabase
        .from('video_comments')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('video_id', video.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!video?.id && isOpen,
  });

  const handleViewDetails = () => {
    if (video) {
      navigate(`/explore/${video.id}`);
      onClose();
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !currentUser || !video) return;
    
    // Navigate to detail page for commenting
    navigate(`/explore/${video.id}`);
    onClose();
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 bg-black h-[90vh] sm:h-[80vh] overflow-hidden" closeButton={false}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Video Side */}
          <div className="flex-1 bg-black relative">
            <VideoPlayer
              video={video}
              autoPlay={true}
              showControls={true}
              globalAudioEnabled={globalAudioEnabled}
              onAudioStateChange={onAudioStateChange}
              className="h-full object-contain"
              isFullscreen={false}
            />
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/50 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Comments Side */}
          <div className="w-full md:w-[350px] bg-white dark:bg-gray-900 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                {video.creator?.avatar_url ? (
                  <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                ) : (
                  <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{video.creator?.username || 'Anonymous'}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Description */}
              {video.description && (
                <div className="flex items-start mb-4">
                  <Avatar className="h-8 w-8 mr-3">
                    {video.creator?.avatar_url ? (
                      <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                    ) : (
                      <AvatarFallback>{(video.creator?.username || '?')[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold mr-2">{video.creator?.username}</span>
                      {video.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(video.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Comments */}
              {isCommentsLoading ? (
                <p className="text-center text-gray-500 py-4">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No comments yet</p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex items-start mb-4">
                    <Avatar className="h-8 w-8 mr-3">
                      {comment.user?.avatar_url ? (
                        <AvatarImage src={comment.user.avatar_url} alt={comment.user.username || ''} />
                      ) : (
                        <AvatarFallback>{(comment.user?.username || '?')[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{comment.user?.username}</span>
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Actions Bar */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex justify-between mb-2">
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
              
              <p className="font-semibold text-sm mb-1">{video.likes_count || 0} likes</p>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(video.created_at || '').toLocaleDateString()}
              </p>
            </div>
            
            {/* Comment Input */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center">
              <Input
                type="text"
                placeholder="Add a comment..."
                className="text-sm border-none focus-visible:ring-0 px-0 py-1 h-auto"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`text-blue-500 font-semibold ${!commentText.trim() ? 'opacity-50' : 'opacity-100'}`}
                onClick={handleSendComment}
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;
