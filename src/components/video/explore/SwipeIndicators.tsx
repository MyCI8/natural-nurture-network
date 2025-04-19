
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
    <div className="absolute inset-x-0 flex flex-col items-center z-40 pointer-events-none">
      {hasPrevVideo && (
        <div className={`absolute top-4 opacity-100 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-black/60 p-2 rounded-full text-white">
            <ChevronUp className="h-5 w-5" />
          </div>
        </div>
      )}

      {hasNextVideo && (
        <div className={`absolute bottom-20 opacity-100 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-black/60 p-2 rounded-full text-white">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeIndicators;
