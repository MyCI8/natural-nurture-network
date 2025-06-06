
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Crop } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { EnhancedImageUpload } from '@/components/ui/enhanced-image-upload';
import { ImageCropModal } from '@/components/ui/image-crop-modal';

interface ImageData {
  file?: File;
  url: string;
  description?: string;
}

interface MultipleImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

// Utility function to convert blob URL to File object
const blobUrlToFile = async (blobUrl: string, fileName: string = 'cropped-image.jpg'): Promise<File> => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
  } catch (error) {
    console.error('Error converting blob URL to file:', error);
    throw new Error('Failed to convert cropped image');
  }
};

export const MultipleImageUpload = ({ images, onImagesChange }: MultipleImageUploadProps) => {
  const [cropModal, setCropModal] = useState<{ isOpen: boolean; imageIndex: number; imageSrc: string }>({
    isOpen: false,
    imageIndex: -1,
    imageSrc: ''
  });

  const addNewImage = () => {
    console.log('Adding new image slot');
    // Add a placeholder for new image with empty url to trigger upload component
    const newImages = [...images, { url: '', description: '' }];
    onImagesChange(newImages);
  };

  const updateImage = (index: number, url: string, file?: File) => {
    console.log('Updating image at index:', index, 'with url:', url, 'and file:', !!file);
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, url, file } : img
    );
    onImagesChange(updatedImages);
  };

  const removeImage = (index: number) => {
    console.log('Removing image at index:', index);
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const updateImageDescription = (index: number, description: string) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, description } : img
    );
    onImagesChange(updatedImages);
  };

  const openCropModal = (index: number, imageSrc: string) => {
    setCropModal({
      isOpen: true,
      imageIndex: index,
      imageSrc
    });
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    console.log('Crop completed, processing result:', croppedImageUrl);
    if (cropModal.imageIndex >= 0) {
      try {
        // Convert the cropped blob URL back to a File object
        const croppedFile = await blobUrlToFile(croppedImageUrl, `cropped-image-${Date.now()}.jpg`);
        
        // Update the image with both the URL and the File object
        updateImage(cropModal.imageIndex, croppedImageUrl, croppedFile);
        
        console.log('Successfully converted cropped image to file:', {
          url: croppedImageUrl,
          fileName: croppedFile.name,
          fileSize: croppedFile.size
        });
      } catch (error) {
        console.error('Failed to process cropped image:', error);
        // Fallback: just update with the URL (though this might cause upload issues)
        updateImage(cropModal.imageIndex, croppedImageUrl);
      }
    }
    setCropModal({ isOpen: false, imageIndex: -1, imageSrc: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Images</h3>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={addNewImage}
          className="touch-manipulation"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Image
        </Button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 gap-6">
        {images.map((image, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg max-w-full">
            {image.url ? (
              <div className="space-y-3">
                <div className="relative group w-full">
                  <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg max-w-full">
                    <img 
                      src={image.url} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openCropModal(index, image.url)}
                        className="touch-manipulation"
                      >
                        <Crop className="h-4 w-4 mr-1" />
                        Crop
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="touch-manipulation"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AspectRatio>
                </div>
                
                <div>
                  <Label htmlFor={`description-${index}`} className="text-sm font-medium">
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
            ) : (
              <div className="max-w-full">
                <EnhancedImageUpload
                  value=""
                  onChange={(url) => {
                    console.log('EnhancedImageUpload onChange called with url:', url);
                    updateImage(index, url);
                  }}
                  onFileSelect={(file) => {
                    console.log('EnhancedImageUpload onFileSelect called with file:', file.name);
                    const blobUrl = URL.createObjectURL(file);
                    updateImage(index, blobUrl, file);
                  }}
                  aspectRatio={16/9}
                  showCrop={false}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal({ isOpen: false, imageIndex: -1, imageSrc: '' })}
        imageSrc={cropModal.imageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
