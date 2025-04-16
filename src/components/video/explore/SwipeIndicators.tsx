
import React from 'react';

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
  return (
    <>
      {hasPrevVideo && (
        <div className={`absolute top-1/2 left-3 transform -translate-y-1/2 z-10 opacity-70 transition-opacity duration-300 ${controlsVisible ? 'opacity-70' : 'opacity-0'}`}>
          <div className="bg-white/20 w-1 h-12 rounded-full mb-1"></div>
        </div>
      )}
      
      {hasNextVideo && (
        <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 opacity-70 transition-opacity duration-300 ${controlsVisible ? 'opacity-70' : 'opacity-0'}`}>
          <div className="text-white/50 text-xs animate-bounce">
            Swipe up for next video
          </div>
        </div>
      )}
    </>
  );
};

export default SwipeIndicators;
