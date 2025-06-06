
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: 'Square (1:1)', value: 1 },
  { label: 'Landscape (16:9)', value: 16/9 },
  { label: 'Portrait (9:16)', value: 9/16 },
  { label: 'Photo (4:3)', value: 4/3 },
  { label: 'Photo (3:4)', value: 3/4 },
];

export const ImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }: ImageCropModalProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          width,
          height,
        ),
        width,
        height,
      ));
    }
  }, [aspect]);

  // Convert image to canvas with CORS-safe approach
  const loadImageToCorsCanvas = useCallback(async (imageSrc: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();
      
      // Handle both blob URLs and regular URLs
      if (imageSrc.startsWith('blob:') || imageSrc.startsWith('data:')) {
        // For blob URLs and data URLs, no CORS issues
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageSrc;
      } else {
        // For regular URLs, try with crossOrigin
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = () => {
          // Fallback: try without crossOrigin for same-origin images
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            canvas.width = fallbackImg.naturalWidth;
            canvas.height = fallbackImg.naturalHeight;
            ctx.drawImage(fallbackImg, 0, 0);
            resolve(canvas);
          };
          fallbackImg.onerror = () => reject(new Error('Failed to load image'));
          fallbackImg.src = imageSrc;
        };
        img.src = imageSrc;
      }
    });
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      throw new Error('Crop data not available');
    }

    setIsProcessing(true);

    try {
      // Load image to a CORS-safe canvas
      const sourceCanvas = await loadImageToCorsCanvas(imageSrc);
      
      // Create output canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context available');
      }

      const scaleX = sourceCanvas.width / imgRef.current.width;
      const scaleY = sourceCanvas.height / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      // Apply transformations if needed
      if (rotate !== 0 || scale !== 1) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.imageSmoothingQuality = 'high';

      // Draw the cropped portion
      ctx.drawImage(
        sourceCanvas,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height,
      );

      return new Promise<string>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty or could not generate blob'));
              return;
            }
            const croppedImageUrl = URL.createObjectURL(blob);
            resolve(croppedImageUrl);
          },
          'image/jpeg',
          0.9,
        );
      });
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, scale, rotate, imageSrc, loadImageToCorsCanvas]);

  const handleCropConfirm = async () => {
    try {
      const croppedImageUrl = await getCroppedImg();
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
        onClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      // Show user-friendly error message
      alert('Failed to crop image. Please try uploading a new image or contact support if the issue persists.');
    }
  };

  const handleRotate = () => {
    setRotate(prev => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={aspect?.toString() || 'free'}
                onValueChange={(value) => setAspect(value === 'free' ? undefined : parseFloat(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ratio) => (
                    <SelectItem 
                      key={ratio.label} 
                      value={ratio.value?.toString() || 'free'}
                    >
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="touch-manipulation"
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="touch-manipulation"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="touch-manipulation"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Crop Area */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                style={{ 
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: '400px',
                  maxWidth: '100%'
                }}
                onLoad={onImageLoad}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>

          {/* Hidden canvas for cropping */}
          <canvas
            ref={previewCanvasRef}
            style={{
              display: 'none',
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleCropConfirm} 
            className="touch-manipulation"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
