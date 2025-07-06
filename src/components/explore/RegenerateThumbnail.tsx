
import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/video";

interface RegenerateThumbnailProps {
  video: Video;
  onThumbnailUpdated: (newThumbnailUrl: string) => void;
}

const RegenerateThumbnail = ({ video, onThumbnailUpdated }: RegenerateThumbnailProps) => {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateThumbnail = async () => {
    if (!video.id || !video.video_url) {
      toast({
        title: "Cannot generate thumbnail",
        description: "Video URL is missing",
        variant: "destructive"
      });
      return;
    }

    setIsRegenerating(true);
    try {
      // Call the Supabase Edge Function to generate a thumbnail
      const { data, error } = await supabase.functions.invoke("generate-video-thumbnail", {
        body: { 
          videoId: video.id,
          videoUrl: video.video_url
        }
      });

      if (error) {throw error;}
      if (!data.thumbnailUrl) {throw new Error("No thumbnail URL returned");}

      // Update the video with the new thumbnail URL
      const { error: updateError } = await supabase
        .from("videos")
        .update({ thumbnail_url: data.thumbnailUrl })
        .eq("id", video.id);

      if (updateError) {throw updateError;}

      // Notify parent component
      onThumbnailUpdated(data.thumbnailUrl);

      toast({
        title: "Thumbnail regenerated",
        description: data.message || "The video thumbnail has been updated successfully"
      });
    } catch (error) {
      console.error("Error regenerating thumbnail:", error);
      toast({
        title: "Failed to regenerate thumbnail",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerateThumbnail}
      disabled={isRegenerating || !video.video_url}
      className="gap-1 touch-manipulation"
    >
      <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
      {isRegenerating ? "Generating..." : "Regenerate Thumbnail"}
    </Button>
  );
};

export default RegenerateThumbnail;
