
import React, { useState } from 'react';
import { MoreVertical, Flag, Share2, LinkIcon, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VideoFlagForm from './VideoFlagForm';

interface VideoOptionsMenuProps {
  videoId: string;
  onShareVideo: () => void;
  viewDetailsUrl?: string;
}

const VideoOptionsMenu = ({ videoId, onShareVideo, viewDetailsUrl }: VideoOptionsMenuProps) => {
  const [isFlagFormOpen, setIsFlagFormOpen] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link to clipboard');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-white/10 focus:bg-white/10 touch-manipulation"
          >
            <MoreVertical className="h-5 w-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] backdrop-blur-md bg-white/90 dark:bg-dm-mist/90 border-none shadow-lg rounded-xl">
          <DropdownMenuLabel>Video Options</DropdownMenuLabel>
          
          <DropdownMenuItem 
            onClick={onShareVideo}
            className="cursor-pointer flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleCopyLink}
            className="cursor-pointer flex items-center gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          
          {viewDetailsUrl && (
            <DropdownMenuItem 
              onClick={() => window.open(viewDetailsUrl, '_blank')}
              className="cursor-pointer flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setIsFlagFormOpen(true)}
            className="cursor-pointer text-destructive flex items-center gap-2"
          >
            <Flag className="h-4 w-4" />
            Report Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <VideoFlagForm 
        videoId={videoId} 
        isOpen={isFlagFormOpen} 
        onClose={() => setIsFlagFormOpen(false)} 
      />
    </>
  );
};

export default VideoOptionsMenu;
