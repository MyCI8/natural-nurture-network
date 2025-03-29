
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ZoomableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  maxZoom?: number;
}

export const ZoomableImage = ({
  src,
  alt,
  className,
  maxZoom = 3,
  ...props
}: ZoomableImageProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  // Reset zoom and position on src change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Handle touch gestures for pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Store the initial distance between two fingers for pinch-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // @ts-ignore - add a custom property
      e.currentTarget.dataset.initialPinchDistance = distance;
    } else if (e.touches.length === 1) {
      // Single touch for panning
      setIsPanning(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch-zoom gesture
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // @ts-ignore - read the custom property
      const initialDistance = parseFloat(e.currentTarget.dataset.initialPinchDistance) || 0;
      if (initialDistance > 0) {
        // Calculate new scale based on the change in distance between fingers
        const newScale = Math.max(
          1,
          Math.min(maxZoom, (scale * currentDistance) / initialDistance)
        );
        setScale(newScale);
        // @ts-ignore - update the custom property
        e.currentTarget.dataset.initialPinchDistance = currentDistance;
      }
    } else if (e.touches.length === 1 && isPanning && scale > 1) {
      // Panning gesture when zoomed in
      const newX = e.touches[0].clientX - startPos.x;
      const newY = e.touches[0].clientY - startPos.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    if (imgRef.current) {
      // @ts-ignore - remove the custom property
      delete imgRef.current.dataset.initialPinchDistance;
    }
  };

  // Double-click/double-tap to toggle zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1) {
      // Reset zoom and position
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      // Zoom in to the maximum
      setScale(maxZoom);
      // Center the zoom on the click point
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        const x = (rect.width / 2 - (e.clientX - rect.left)) * (maxZoom - 1);
        const y = (rect.height / 2 - (e.clientY - rect.top)) * (maxZoom - 1);
        setPosition({ x, y });
      }
    }
  };

  return (
    <div 
      ref={imgRef}
      className={cn(
        "overflow-hidden relative touch-manipulation", 
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt={alt || "Zoomable image"}
        className="w-full h-full object-contain select-none transition-transform"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: "center",
        }}
        draggable={false}
        {...props}
      />
      <div className="absolute bottom-2 left-0 right-0 text-center opacity-70 text-xs text-white bg-black/30 py-1 pointer-events-none">
        Double tap to {scale > 1 ? "reset" : "zoom"} • Pinch to zoom
      </div>
    </div>
  );
};
