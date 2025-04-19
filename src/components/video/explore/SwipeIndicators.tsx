
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeIndicatorsProps {
  controlsVisible: boolean;
  hasNextVideo: boolean;
  hasPrevVideo: boolean;
}

const SwipeIndicator = ({ direction, visible }: { direction: 'up' | 'down'; visible: boolean }) => (
  <div 
    className={cn(
      "absolute flex items-center justify-center w-full",
      direction === 'up' ? "top-4" : "bottom-4",
      "pointer-events-none z-20"
    )}
  >
    <div className={cn(
      "flex items-center justify-center rounded-full h-8 w-8 bg-black/20 text-white",
      visible ? "opacity-100" : "opacity-0"
    )}>
      {direction === 'up' ? (
        <ChevronUp className="h-5 w-5" />
      ) : (
        <ChevronDown className="h-5 w-5" />
      )}
    </div>
  </div>
);

const SwipeIndicators: React.FC<SwipeIndicatorsProps> = ({ 
  controlsVisible,
  hasNextVideo,
  hasPrevVideo
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <>
      {hasNextVideo && (
        <SwipeIndicator direction="up" visible={true} />
      )}
      
      {hasPrevVideo && (
        <SwipeIndicator direction="down" visible={true} />
      )}
    </>
  );
};

export default SwipeIndicators;
