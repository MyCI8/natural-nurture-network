
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Video, ProductLink } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  showControls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  productLinks = [], 
  autoPlay = true,
  showControls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  // Handle video visibility
  useEffect(() => {
    const handleVideoVisibility = async () => {
      if (!videoRef.current) return;

      if (inView && autoPlay) {
        try {
          await videoRef.current.play();
          // Increment view count
          const { error } = await supabase.rpc('increment_video_views', { video_id: video.id });
          if (error) console.error('Error incrementing views:', error);
        } catch (error) {
          console.log('Autoplay prevented:', error);
        }
      } else {
        videoRef.current.pause();
      }
    };

    handleVideoVisibility();
  }, [inView, autoPlay, video.id]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video click event from triggering
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={inViewRef} 
      className="relative w-full h-full bg-black"
    >
      <video
        ref={videoRef}
        src={video.video_url}
        className="w-full h-full object-contain"
        loop
        muted={isMuted}
        playsInline
        poster={video.thumbnail_url || undefined}
      />
      
      {/* Mute Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="absolute bottom-4 right-4 text-white hover:bg-black/20 z-10"
      >
        {isMuted ? (
          <VolumeX className="h-6 w-6" />
        ) : (
          <Volume2 className="h-6 w-6" />
        )}
      </Button>

      {/* Product Links Overlay */}
      {productLinks.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {productLinks.map((link) => (
            <div
              key={link.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${link.position_x || 50}%`,
                top: `${link.position_y || 50}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Button
                variant="secondary"
                className="bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm"
                onClick={() => window.open(link.url, '_blank')}
              >
                {link.title}
                {link.price && ` - $${link.price}`}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
