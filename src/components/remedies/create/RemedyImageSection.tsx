
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface RemedyImageSectionProps {
  imagePreview: string;
  onImageChange: (file: File | null, preview: string) => void;
}

export const RemedyImageSection = ({ imagePreview, onImageChange }: RemedyImageSectionProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onImageChange(file, preview);
    }
  };

  const removeImage = () => {
    onImageChange(null, '');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Images</h3>
      
      {imagePreview ? (
        <div className="relative">
          <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg">
            <img 
              src={imagePreview} 
              alt="Remedy preview" 
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2 touch-manipulation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload a photo of your remedy
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button type="button" variant="outline" asChild className="touch-manipulation">
            <label htmlFor="image-upload" className="cursor-pointer">
              Choose Image
            </label>
          </Button>
        </div>
      )}
    </div>
  );
};
