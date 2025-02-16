
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Video, ProductLink } from '@/types/video';
import { Button } from '@/components/ui/button';
import { PlayCircle, PauseCircle, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, productLinks = [], autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  // Handle video visibility
  useEffect(() => {
    if (!videoRef.current) return;

    if (inView && autoPlay) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked by browser
        console.log('Autoplay blocked');
      });
      setIsPlaying(true);
      
      // Increment view count - using await with then/catch
      const { error } = await supabase.rpc('increment_video_views', { video_id: video.id });
      if (error) console.error('Error incrementing views:', error);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, autoPlay, video.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={inViewRef} 
      className="relative w-full h-screen max-h-[100vh] bg-black"
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
      
      {/* Video Controls */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-between items-center text-white z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="hover:bg-black/20"
          >
            {isPlaying ? (
              <PauseCircle className="h-8 w-8" />
            ) : (
              <PlayCircle className="h-8 w-8" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="hover:bg-black/20"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Product Links Overlay */}
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
    </div>
  );
};

export default VideoPlayer;
