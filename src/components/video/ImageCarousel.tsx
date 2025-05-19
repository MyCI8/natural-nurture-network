
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import { isImageFile } from '@/utils/videoUtils';

interface ImageCarouselProps {
  images: string[];
  aspectRatio?: number;
  onImageClick?: () => void;
  className?: string;
}

export default function ImageCarousel({ 
  images, 
  aspectRatio = 4/5,
  onImageClick,
  className = ""
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  
  // Filter only valid image URLs
  const validImages = images.filter(url => url && isImageFile(url));
  
  if (!validImages.length) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio: aspectRatio }}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspectRatio }}>
      <Carousel
        className="w-full h-full" 
        onSelect={(index) => setCurrentIndex(index)}
        setApi={setApi}
      >
        <CarouselContent>
          {validImages.map((image, index) => (
            <CarouselItem key={index} className="h-full">
              <div 
                className="w-full h-full flex items-center justify-center"
                onClick={onImageClick}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom navigation controls with better touch targets */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
          <CarouselPrevious 
            className={`h-10 w-10 bg-white/70 hover:bg-white/90 dark:bg-black/30 dark:hover:bg-black/50 shadow-md rounded-full text-black dark:text-white left-0`}
          />
        </div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          <CarouselNext 
            className={`h-10 w-10 bg-white/70 hover:bg-white/90 dark:bg-black/30 dark:hover:bg-black/50 shadow-md rounded-full text-black dark:text-white right-0`}
          />
        </div>
        
        {/* Carousel indicators (dots) */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {validImages.map((_, index) => (
              <span
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-2.5' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  );
}
