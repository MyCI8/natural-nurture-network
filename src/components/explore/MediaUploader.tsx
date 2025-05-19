
import { useState, useRef } from "react";
import { Upload, Trash2, Link as LinkIcon, ExternalLink, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Label } from "@/components/ui/label";
import ImageCarousel from "@/components/video/ImageCarousel";

interface MediaUploaderProps {
  mediaPreview: string | null;
  mediaPreviews?: string[]; // For multiple images
  isYoutubeLink: boolean;
  videoUrl: string;
  onMediaUpload: (file: File | File[]) => void;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
  isMultipleAllowed?: boolean;
}

export function MediaUploader({
  mediaPreview,
  mediaPreviews = [],
  isYoutubeLink,
  videoUrl,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  isMultipleAllowed = true
}: MediaUploaderProps) {
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [tempVideoLink, setTempVideoLink] = useState(videoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Handle multiple files (for images)
    if (isMultipleAllowed && files.length > 1) {
      const fileArray = Array.from(files);
      // Only allow multiple selection for images
      const isAllImages = fileArray.every(file => file.type.startsWith('image/'));
      
      if (isAllImages) {
        onMediaUpload(fileArray);
      } else {
        // If mixed content or multiple videos, just take the first file
        onMediaUpload(files[0]);
      }
    } else {
      // Single file
      onMediaUpload(files[0]);
    }
    
    event.target.value = '';
  };

  // Show carousel if we have multiple images
  const hasMultipleImages = mediaPreviews.length > 1;

  return (
    <div className="space-y-4">
      <Label>Media</Label>
      {(mediaPreview || hasMultipleImages) ? (
        <div className="relative">
          {hasMultipleImages ? (
            <ImageCarousel 
              images={mediaPreviews} 
              aspectRatio={4/5}
              className="rounded-md overflow-hidden"
            />
          ) : (
            <AspectRatio ratio={16/9} className="bg-muted overflow-hidden rounded-md">
              <img
                src={mediaPreview}
                alt="Media preview"
                className="w-full h-full object-cover"
              />
              {isYoutubeLink && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    className="bg-black/70 hover:bg-black/90"
                    onClick={() => window.open(videoUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on YouTube
                  </Button>
                </div>
              )}
            </AspectRatio>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onClearMedia}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-32 flex flex-col gap-2"
          >
            <div className="flex gap-2">
              <Video className="h-5 w-5" />
              <Image className="h-5 w-5" />
            </div>
            <span>Upload Video or Photos</span>
            <span className="text-xs text-muted-foreground">
              {isMultipleAllowed ? 
                "Select multiple photos for carousel" : 
                "MP4, WebM, JPEG, PNG, etc."
              }
            </span>
          </Button>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*,image/*"
        multiple={isMultipleAllowed}
        className="hidden"
      />
    </div>
  );
}
