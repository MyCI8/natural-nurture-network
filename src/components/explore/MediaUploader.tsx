
import { useState, useRef } from "react";
import { Upload, Trash2, Link as LinkIcon, ExternalLink, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaUploaderProps {
  mediaPreview: string | null;
  isYoutubeLink: boolean;
  videoUrl: string;
  onMediaUpload: (file: File) => void;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
  compact?: boolean;
}

export function MediaUploader({
  mediaPreview,
  isYoutubeLink,
  videoUrl,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia,
  compact = false
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMediaUpload(file);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {mediaPreview ? (
        <div className="relative">
          {!compact && (
            <AspectRatio ratio={16/9} className="bg-muted overflow-hidden rounded-lg">
              <img
                src={mediaPreview}
                alt="Media preview"
                className="w-full h-full object-cover"
              />
              {isYoutubeLink && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    className="bg-black/70 hover:bg-black/90 touch-manipulation"
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
            className="absolute top-2 right-2 touch-manipulation"
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
            className={`${compact ? 'h-24' : 'h-32'} flex flex-col gap-2 rounded-lg border-dashed touch-manipulation`}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span>Upload Media</span>
            <span className="text-xs text-muted-foreground">
              Video or Photo
            </span>
          </Button>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*,image/*"
        className="hidden"
      />
    </div>
  );
}
