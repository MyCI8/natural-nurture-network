
import React from 'react';
import { Swipeable } from '@/components/ui/swipeable';

interface VideoSwipeContainerProps {
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  disabled?: boolean;
  children: React.ReactNode;
  threshold?: number;
}

const VideoSwipeContainer: React.FC<VideoSwipeContainerProps> = ({
  onSwipe,
  disabled = false,
  children,
  threshold = 60
}) => {
  return (
    <Swipeable 
      onSwipe={onSwipe} 
      className="relative w-full h-full flex-1 touch-manipulation"
      threshold={threshold}
      disabled={disabled}
    >
      {children}
    </Swipeable>
  );
};

export default VideoSwipeContainer;
