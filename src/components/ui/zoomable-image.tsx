
import React, { useState, useCallback, useRef } from 'react';
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
  const lastTouchRef = useRef<{ x: number, y: number } | null>(null);

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
      const currentTouch = { x: touch.clientX, y: touch.clientY };
      
      if (lastTouchRef.current) {
        const deltaX = currentTouch.x - lastTouchRef.current.x;
        const deltaY = currentTouch.y - lastTouchRef.current.y;
        
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }
      
      lastTouchRef.current = currentTouch;
    }
  }, [isZooming]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isZooming && e.touches.length === 1) {
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [isZooming]);

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
  }, []);

  return (
    <Swipeable
      enableZoom={true}
      onPinch={handlePinch}
      className={cn("overflow-hidden touch-manipulation", className)}
    >
      <div 
        className="relative w-full h-full"
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
