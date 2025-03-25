
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLayout } from '@/contexts/LayoutContext';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showShare, setShowShare] = React.useState(false);
  const { setShowRightSection } = useLayout();
  
  // Always show right section when on the explore detail page
  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(true); // Keep it visible on unmount too
  }, [setShowRightSection]);

  const { data: video, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          related_article_id,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Ensure related_article_id is included
      return {
        ...data,
        related_article_id: data.related_article_id || null
      };
    },
  });

  const handleShare = async () => {
    if (!video) return;
    
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShare(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShare(false);
      toast({
        title: "Success",
        description: "Link copied to clipboard!"
      });
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleClose = () => {
    navigate('/explore');
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col md:flex-row">
        <div className="md:flex-1">
          <div className="w-full p-4">
            <div className="instagram-dialog-video py-2">
              <VideoPlayer 
                video={video} 
                autoPlay={false} 
                showControls 
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="sm:max-w-md">
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Share this video</h2>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              Copy link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreDetail;
