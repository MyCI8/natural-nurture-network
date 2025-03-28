
import React, { useState, useCallback } from 'react';
import { Swipeable } from './swipeable';
import { cn } from '@/lib/utils';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: number;
}

export function ZoomableImage({ 
  src, 
  alt, 
  className,
  aspectRatio
}: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handlePinch = useCallback((newScale: number) => {
    setScale(newScale);
    setIsZooming(newScale > 1);
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (scale > 1) {
      // Reset to normal
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZooming(false);
    } else {
      // Zoom in
      setScale(2);
      setIsZooming(true);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isZooming && e.touches.length === 1) {
      e.stopPropagation();
      const touch = e.touches[0];
      setPosition(prev => ({
        x: prev.x + touch.movementX,
        y: prev.y + touch.movementY
      }));
    }
  }, [isZooming]);

  return (
    <Swipeable
      enableZoom={true}
      onPinch={handlePinch}
      className={cn("overflow-hidden touch-manipulation", className)}
    >
      <div 
        className="relative w-full h-full"
        onTouchMove={handleTouchMove}
        onDoubleClick={handleDoubleTap}
        style={{
          aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isZooming ? 'none' : 'transform 0.3s ease-out',
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        />
      </div>
    </Swipeable>
  );
}
