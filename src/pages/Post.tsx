
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useVideoForm } from "@/hooks/useVideoForm";
import { MediaUploader } from "@/components/explore/MediaUploader";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoLoadingState } from "@/components/explore/VideoLoadingState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Post = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      toast("Please sign in to create a post");
      navigate("/auth");
    }
  }, [currentUser, isLoadingUser, navigate]);

  // Initialize video form with "general" type (for Explore videos)
  const {
    formState,
    isSaving,
    mediaPreview,
    isYoutubeLink,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo
  } = useVideoForm(undefined, "explore");

  const goBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit clicked - formState:', formState);
    console.log('Submit clicked - mediaPreview:', mediaPreview);
    
    if (!mediaPreview && !formState.video_url) {
      toast("Please upload a video or image first");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save as published
      const result = await saveVideo(false);
      
      if (result) {
        toast("Post created successfully!");
        navigate("/explore");
      } else {
        toast("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast("An error occurred while creating your post");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingUser) {
    return <VideoLoadingState />;
  }

  // Check if we have valid media for button state
  const hasValidMedia = !!(mediaPreview || formState.video_url);
  console.log('Button state - hasValidMedia:', hasValidMedia, 'mediaPreview:', mediaPreview, 'video_url:', formState.video_url);

  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      {/* Header with back button */}
      <header className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack}
          className="rounded-full h-10 w-10 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold">
          Create New Post
        </h1>
        
        <div className="w-10">
          {/* Empty div to balance header */}
        </div>
      </header>

      {/* Main content area */}
      <main className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Enhanced Media upload section */}
          <div className="space-y-4">
            <MediaUploader
              mediaPreview={mediaPreview}
              isYoutubeLink={isYoutubeLink}
              videoUrl={formState.video_url}
              onMediaUpload={handleMediaUpload}
              onVideoLinkChange={handleVideoLinkChange}
              onClearMedia={clearMediaFile}
              compact={true}
            />
            
            {!mediaPreview && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Upload a video or photo to share with advanced editing tools</p>
                <p className="text-xs mt-1">Drag & drop supported • Crop images • Edit videos</p>
              </div>
            )}
          </div>
          
          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description || ""}
                onChange={handleInputChange}
                placeholder="What's on your mind?"
                className="mt-1 min-h-[100px] touch-manipulation"
              />
            </div>
          </div>
          
          {/* Post button */}
          <Button 
            type="submit" 
            className="w-full py-6 rounded-full flex items-center justify-center gap-2 touch-manipulation"
            disabled={isSaving || isProcessing || !hasValidMedia}
          >
            <UploadIcon className="h-5 w-5" />
            <span>{isProcessing ? "Posting..." : "Post"}</span>
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Post;
