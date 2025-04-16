
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SwipeIndicatorsProps {
  controlsVisible: boolean;
  hasNextVideo: boolean;
  hasPrevVideo: boolean;
}

const SwipeIndicators: React.FC<SwipeIndicatorsProps> = ({
  controlsVisible,
  hasNextVideo,
  hasPrevVideo
}) => {
  const isMobile = useIsMobile();
  
  // Only show swipe indicators on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <div className={`absolute left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
      {hasPrevVideo && (
        <div className="absolute top-4 animate-bounce-slow">
          <ArrowUp className="h-6 w-6 text-white opacity-70" />
        </div>
      )}
      
      {hasNextVideo && (
        <div className="absolute bottom-20 animate-bounce-slow">
          <ArrowDown className="h-6 w-6 text-white opacity-70" />
        </div>
      )}
    </div>
  );
};

export default SwipeIndicators;
