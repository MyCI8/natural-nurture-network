
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useVideoInteractions(
  videoId: string | undefined, 
  currentUser: any | null,
  productLinks: any[] = []
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  
  const handleClose = () => {
    navigate('/explore');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = async () => {
    if (!currentUser || !videoId) return;
    
    try {
      // Check if user already liked the video
      const { data: existingLike } = await supabase
        .from('video_likes')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (existingLike) {
        // Unlike
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);
      } else {
        // Like
        await supabase
          .from('video_likes')
          .insert([{ 
            video_id: videoId, 
            user_id: currentUser.id 
          }]);
      }
      window.dispatchEvent(new CustomEvent('refetch-like-status'));
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  };

  // Modified handleShare function to work without requiring a video parameter
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this video',
          text: '',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Video link copied to clipboard"
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleShowProducts = () => {
    if (productLinks.length > 0) {
      window.dispatchEvent(new CustomEvent('show-product-link', { 
        detail: { linkId: productLinks[0].id } 
      }));
    }
  };

  return {
    isMuted,
    setIsMuted,
    handleClose,
    handleToggleMute,
    handleLike,
    handleShare,
    handleShowProducts
  };
}
