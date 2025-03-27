
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Video, AlertCircle, HelpCircle } from "lucide-react";
import { VideoDescriptionInput } from "./video/VideoDescriptionInput";
import { VideoLinkInput } from "./video/VideoLinkInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface VideoLink {
  url: string;
  title: string;
}

interface VideoLinksSectionProps {
  videoLinks: VideoLink[];
  setVideoLinks: (links: VideoLink[]) => void;
  videoDescription: string;
  setVideoDescription: (description: string) => void;
}

export const VideoLinksSection = ({
  videoLinks,
  setVideoLinks,
  videoDescription,
  setVideoDescription,
}: VideoLinksSectionProps) => {
  const [hasInvalidLinks, setHasInvalidLinks] = useState(false);

  const addVideoLink = () => {
    setVideoLinks([...videoLinks, { url: "", title: "" }]);
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const updateVideoLink = (index: number, field: keyof VideoLink, value: string) => {
    const newLinks = [...videoLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    
    // Validate links
    const hasInvalid = newLinks.some(link => {
      if (!link.url || !link.title) return false; // Empty fields are not considered invalid
      
      // Check for valid YouTube URL format
      if (link.url.includes('youtube.com') || link.url.includes('youtu.be')) {
        const videoId = getYoutubeVideoId(link.url);
        return !videoId; // Invalid if no video ID can be extracted
      }
      
      // For now, only validate YouTube URLs
      return false;
    });
    
    setHasInvalidLinks(hasInvalid);
    setVideoLinks(newLinks);
  };
  
  // Helper function to extract YouTube video ID
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Video Links</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Add YouTube or other video links related to this content. Videos will appear in the right sidebar.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addVideoLink} 
          className="gap-1 touch-manipulation"
        >
          <Plus className="h-4 w-4" />
          <span>Add Video</span>
        </Button>
      </div>

      <VideoDescriptionInput
        videoDescription={videoDescription}
        setVideoDescription={setVideoDescription}
      />

      {hasInvalidLinks && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some video links appear to be invalid. Please check YouTube URLs and formats.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {videoLinks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-md bg-muted/30 text-muted-foreground">
            <Video className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No videos added yet</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addVideoLink} 
              className="mt-2 touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add your first video
            </Button>
          </div>
        )}
        
        {videoLinks.map((link, index) => (
          <div key={index} className="relative p-4 border rounded-md group hover:border-primary/50 transition-colors">
            <VideoLinkInput
              link={link}
              index={index}
              updateVideoLink={updateVideoLink}
              removeVideoLink={removeVideoLink}
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeVideoLink(index)}
              className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            {link.url && link.url.includes('youtube.com') && getYoutubeVideoId(link.url) && (
              <div className="mt-3 bg-muted rounded-md overflow-hidden">
                <div className="aspect-video w-full max-w-[240px]">
                  <img 
                    src={`https://img.youtube.com/vi/${getYoutubeVideoId(link.url)}/mqdefault.jpg`}
                    alt="YouTube thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
