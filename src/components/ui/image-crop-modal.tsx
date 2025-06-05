
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

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        },
        'image/jpeg',
        0.9,
      );
    });
  }, [completedCrop, scale]);

  const handleCropConfirm = async () => {
    try {
      const croppedImageUrl = await getCroppedImg();
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
        onClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCropConfirm} className="touch-manipulation">
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
