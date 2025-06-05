
import React from 'react';
import { cn } from '@/lib/utils';

interface MediaContainerProps {
  children: React.ReactNode;
  aspectRatio?: 'auto' | '16:9' | '1:1' | '9:16' | '4:3' | '3:4';
  className?: string;
  rounded?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  onClick?: () => void;
}

const getAspectRatioFromDimensions = (width?: number, height?: number): '16:9' | '1:1' | '9:16' | '4:3' | '3:4' => {
  if (!width || !height) return '16:9';
  
  const ratio = width / height;
  
  if (ratio >= 1.6 && ratio <= 1.9) return '16:9';
  if (ratio >= 0.9 && ratio <= 1.1) return '1:1';
  if (ratio >= 0.5 && ratio <= 0.65) return '9:16';
  if (ratio >= 1.25 && ratio <= 1.4) return '4:3';
  if (ratio >= 0.7 && ratio <= 0.85) return '3:4';
  
  // Default fallback
  return ratio > 1 ? '16:9' : '1:1';
};

const MediaContainer: React.FC<MediaContainerProps> = ({
  children,
  aspectRatio = 'auto',
  className,
  rounded = true,
  imageUrl,
  imageAlt,
  onClick
}) => {
  const [detectedRatio, setDetectedRatio] = React.useState<string>('16:9');
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (aspectRatio === 'auto' && imageUrl) {
      const img = new Image();
      img.onload = () => {
        const ratio = getAspectRatioFromDimensions(img.width, img.height);
        setDetectedRatio(ratio);
        setImageLoaded(true);
      };
      img.src = imageUrl;
    } else if (aspectRatio !== 'auto') {
      setDetectedRatio(aspectRatio);
      setImageLoaded(true);
    }
  }, [aspectRatio, imageUrl]);

  const finalRatio = aspectRatio === 'auto' ? detectedRatio : aspectRatio;

  // Use Tailwind's built-in aspect ratio classes
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
  };

  return (
    <div className={cn("media-container w-full", className)}>
      <div 
        className={cn(
          "media-wrapper relative w-full overflow-hidden bg-muted",
          aspectRatioClasses[finalRatio as keyof typeof aspectRatioClasses],
          rounded && "rounded-xl",
          onClick && "cursor-pointer hover:opacity-90 transition-opacity"
        )}
        onClick={onClick}
      >
        {imageLoaded || aspectRatio !== 'auto' ? children : (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default MediaContainer;
