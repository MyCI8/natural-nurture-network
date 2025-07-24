
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '@/types/video';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import VideoPlayer from '@/components/video/VideoPlayer';
import Comments from '@/components/video/Comments';
import { getCdnUrl } from '@/utils/cdnUtils';
import { useVideoMetadata } from '@/hooks/useVideoMetadata';

interface VideoPostProps {
  video: Video & { profiles: any };
  currentUser: any;
  userLikes: Record<string, boolean>;
  userSaves: string[];
  handleLike: (videoId: string) => void;
  handleSave: (videoId: string, e: React.MouseEvent) => void;
  handleVideoClick: (video: Video) => void;
  index: number;
  setSize: (index: number, size: number) => void;
  style: React.CSSProperties;
}

const VideoPost: React.FC<VideoPostProps> = ({
  video,
  currentUser,
  userLikes,
  userSaves,
  handleLike,
  handleSave,
  handleVideoClick,
  index,
  setSize,
  style,
}) => {
  const navigate = useNavigate();
  const postRef = useRef<HTMLDivElement>(null);
  const { aspectRatio } = useVideoMetadata(video.video_url);

  useEffect(() => {
    if (postRef.current) {
      setSize(index, postRef.current.getBoundingClientRect().height);
    }
  }, [setSize, index, video]);

  return (
    <div style={style}>
        <div ref={postRef} className="p-2">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                {/* User Info */}
                <div 
                    className="flex items-center space-x-3 p-3 sm:p-4 cursor-pointer"
                    onClick={(e) => {
                    e.stopPropagation();
                    if (video.profiles?.id) {
                        navigate(`/users/${video.profiles.id}`);
                    }
                    }}
                >
                    <Avatar className="h-8 w-8">
                    {video.profiles?.avatar_url ? (
                        <AvatarImage src={getCdnUrl(video.profiles.avatar_url) || ''} alt={video.profiles?.full_name || 'User'} />
                    ) : (
                        <AvatarFallback className="bg-[#E8F5E9] text-[#4CAF50]">
                        {video.profiles?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                    )}
                    </Avatar>
                    <span className="font-medium hover:text-[#4CAF50] transition-colors">
                    {video.profiles?.full_name || 'Anonymous User'}
                    </span>
                </div>

                {/* Video Container */}
                <div 
                    className="responsive-media-container cursor-pointer" 
                    onClick={() => handleVideoClick(video)}
                    style={{ aspectRatio: aspectRatio || 'auto' }}
                >
                    <VideoPlayer
                    video={video}
                    autoPlay
                    showControls={false}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-around sm:justify-start sm:space-x-4 mb-3 pt-3 px-3 sm:px-4">
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-[#666666] hover:text-[#4CAF50] transition-transform hover:scale-110 touch-manipulation"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                    
                    <Button 
                        variant="ghost"
                        size="icon"
                        className={`h-11 w-11 transition-transform hover:scale-110 touch-manipulation ${
                            userSaves?.includes(video.id) 
                            ? 'text-[#4CAF50]' 
                            : 'text-[#666666] hover:text-[#4CAF50]'
                        }`}
                        onClick={(e) => handleSave(video.id, e)}
                    >
                        <Bookmark 
                            className="h-6 w-6" 
                            fill={userSaves?.includes(video.id) ? "currentColor" : "none"}
                        />
                    </Button>
                    
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-[#666666] hover:text-[#4CAF50] transition-transform hover:scale-110 touch-manipulation"
                    >
                        <Share2 className="h-6 w-6" />
                    </Button>
                </div>

                {/* Description and Likes */}
                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <p className="text-sm text-[#666666] text-left mb-2">
                    {video.description?.substring(0, 100)}
                    {video.description?.length > 100 && '...'}
                    </p>
                    
                    <div className="mt-2 mb-3 text-sm text-[#666666] flex items-center space-x-2">
                    <span className="mr-1">{video.likes_count || 0} likes</span>
                    <Button 
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 p-0 transition-transform hover:scale-110 ${
                        userLikes[video.id] 
                            ? 'text-red-500' 
                            : 'text-[#666666] hover:text-[#4CAF50]'
                        }`}
                        onClick={() => handleLike(video.id)}
                    >
                        <Heart className="h-5 w-5" fill={userLikes[video.id] ? "currentColor" : "none"} />
                    </Button>
                    <span className="ml-2">{video.views_count || 0} views</span>
                    </div>

                    <div className="mt-1">
                    <Comments videoId={video.id} currentUser={currentUser} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VideoPost;
