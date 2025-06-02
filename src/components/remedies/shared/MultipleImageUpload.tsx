
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Plus } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImageData {
  file?: File;
  url: string;
  description?: string;
}

interface MultipleImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

export const MultipleImageUpload = ({ images, onImagesChange }: MultipleImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageData[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newImages.push({ file, url });
    });
    
    onImagesChange([...images, ...newImages]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const updateImageDescription = (index: number, description: string) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, description } : img
    );
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Images</h3>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop images here, or click to select
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <Button type="button" variant="outline" asChild className="touch-manipulation">
          <label htmlFor="image-upload" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Images
          </label>
        </Button>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {images.map((image, index) => (
            <div key={index} className="space-y-2">
              <div className="relative">
                <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg">
                  <img 
                    src={image.url} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor={`description-${index}`} className="text-sm">
                  Description (optional)
                </Label>
                <Input
                  id={`description-${index}`}
                  value={image.description || ''}
                  onChange={(e) => updateImageDescription(index, e.target.value)}
                  placeholder="Describe this image..."
                  className="mt-1 touch-manipulation bg-background"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
