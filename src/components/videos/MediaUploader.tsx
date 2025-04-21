
import { useState, useRef } from "react";
import { Upload, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";
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

// Only allow file upload on Explore; remove Add Video Link for explore/general uploads.
// We'll know it's Explore video if videoUrl is empty and isYoutubeLink is false and there's no URL input.

interface MediaUploaderProps {
  mediaPreview: string | null;
  isYoutubeLink: boolean;
  videoUrl: string;
  onMediaUpload: (file: File) => void;
  onVideoLinkChange: (url: string) => void;
  onClearMedia: () => void;
}

export function MediaUploader({
  mediaPreview,
  isYoutubeLink,
  videoUrl,
  onMediaUpload,
  onVideoLinkChange,
  onClearMedia
}: MediaUploaderProps) {
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [tempVideoLink, setTempVideoLink] = useState(videoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMediaUpload(file);
      event.target.value = '';
    }
  };

  // For Explore: Only upload video. For 'news' allow both.
  const isNewsVideo = false; // Not needed for now as we only want Explore to be upload only

  return (
    <div className="space-y-4">
      <Label>Video Media</Label>
      {mediaPreview ? (
        <div className="relative">
          <AspectRatio ratio={16/9} className="bg-muted overflow-hidden rounded-md">
            <img
              src={mediaPreview}
              alt="Video preview"
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
            <Upload className="h-5 w-5" />
            <span>Upload Video</span>
            <span className="text-xs text-muted-foreground">
              MP4, WebM or other video formats
            </span>
          </Button>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </div>
  );
}
