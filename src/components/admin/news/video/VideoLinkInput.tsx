
import { Label } from "@/components/ui/label";
import { Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface VideoLink {
  url: string;
  title: string;
}

interface VideoLinkInputProps {
  link: VideoLink;
  index: number;
  updateVideoLink: (index: number, field: keyof VideoLink, value: string) => void;
  removeVideoLink: (index: number) => void;
}

export const VideoLinkInput = ({
  link,
  index,
  updateVideoLink,
  removeVideoLink,
}: VideoLinkInputProps) => {
  const [error, setError] = useState<string | null>(null);
  
  // Validate YouTube URL
  useEffect(() => {
    if (!link.url) {
      setError(null);
      return;
    }
    
    if (link.url.includes('youtube.com') || link.url.includes('youtu.be')) {
      const videoId = getYoutubeVideoId(link.url);
      if (!videoId) {
        setError("Invalid YouTube URL format");
      } else {
        setError(null);
      }
    } else {
      // For now, allow non-YouTube URLs without validation
      setError(null);
    }
  }, [link.url]);

  // Helper function to extract YouTube video ID
    if (!url) {return null;}
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="flex-1 space-y-2">
        <Label>Title</Label>
        <Input
          value={link.title}
          onChange={(e) => updateVideoLink(index, "title", e.target.value)}
          placeholder="Video title"
          className="touch-manipulation"
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label>URL</Label>
        <div className="space-y-1">
          <Input
            value={link.url}
            onChange={(e) => updateVideoLink(index, "url", e.target.value)}
            placeholder="https://youtube.com/..."
            className={`touch-manipulation ${error ? 'border-red-500' : ''}`}
          />
          {error && (
            <div className="flex items-center gap-1 text-destructive text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="mt-8 hidden md:flex"
        onClick={() => removeVideoLink(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
