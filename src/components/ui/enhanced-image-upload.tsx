
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Crop, RotateCw, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  aspectRatio?: number;
  maxSize?: number; // in MB
  className?: string;
  showCrop?: boolean;
}

interface DragState {
  isDragging: boolean;
  dragCounter: number;
}

export const EnhancedImageUpload = ({
  value,
  onChange,
  onFileSelect,
  aspectRatio = 1,
  maxSize = 5,
  className = "",
  showCrop = true
}: ImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, dragCounter: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select an image smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width)
        const maxWidth = 1200;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) {return;}

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const compressedFile = await compressImage(file);
      const url = URL.createObjectURL(compressedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onChange(url);
      onFileSelect?.(compressedFile);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been processed and is ready to use",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onChange, onFileSelect, toast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({
      isDragging: true,
      dragCounter: prev.dragCounter + 1
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => {
      const newCounter = prev.dragCounter - 1;
      return {
        isDragging: newCounter > 0,
        dragCounter: newCounter
      };
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({ isDragging: false, dragCounter: 0 });
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const removeImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <div className="relative group">
          <AspectRatio ratio={aspectRatio} className="overflow-hidden rounded-lg bg-muted">
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              {showCrop && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="touch-manipulation"
                  onClick={() => toast({ title: "Crop feature", description: "Cropping modal will open here" })}
                >
                  <Crop className="h-4 w-4 mr-1" />
                  Crop
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="touch-manipulation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AspectRatio>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${dragState.isDragging 
              ? 'border-primary bg-primary/10 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-primary animate-pulse" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading image...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              </div>
            </div>
          ) : (
            <>
              <Upload className={`mx-auto h-12 w-12 mb-4 transition-transform ${dragState.isDragging ? 'scale-110 text-primary' : 'text-muted-foreground'}`} />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {dragState.isDragging ? 'Drop your image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • Max {maxSize}MB • JPG, PNG, GIF
                </p>
              </div>
            </>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};
