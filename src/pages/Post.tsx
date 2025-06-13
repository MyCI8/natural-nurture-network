
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
    isProcessing: mediaProcessing,
    mediaPreview,
    isYoutubeLink,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo,
    hasValidMedia
  } = useVideoForm(undefined, "explore");

  const goBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Post submit clicked - validation check:', {
      hasValidMedia: hasValidMedia(),
      mediaPreview: !!mediaPreview,
      isProcessing: mediaProcessing,
      formState: {
        description: formState.description,
        video_url: formState.video_url
      }
    });
    
    // Check if we have valid media ready for upload
    if (!hasValidMedia()) {
      toast.error("Please upload a video or image first");
      return;
    }

    // Validate description for explore posts
    if (!formState.description?.trim()) {
      toast.error("Please add a description for your post");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('💾 Starting save process as published...');
      
      // Save as published (changed from false to true)
      const result = await saveVideo(true);
      
      if (result) {
        toast.success("Post created successfully!");
        navigate("/explore");
      } else {
        console.error('❌ Save video returned false/null');
        toast.error("Failed to create post - please check your connection");
      }
    } catch (error) {
      console.error("❌ Error creating post:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingUser) {
    return <VideoLoadingState />;
  }

  // Button state logic
  const isButtonDisabled = isSaving || isProcessing || mediaProcessing || !hasValidMedia();
  
  console.log('🔘 Post button state:', {
    isSaving,
    isProcessing,
    mediaProcessing,
    hasValidMedia: hasValidMedia(),
    isButtonDisabled,
    mediaPreview: !!mediaPreview
  });

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

      {/* Main content area with minimal spacing */}
      <main className="px-4 py-1">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Ultra compact Media upload section */}
          <div className="space-y-1">
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
              <div className="text-center text-xs text-muted-foreground px-2">
                <p>Upload a video or photo to share</p>
                <p className="text-[10px] mt-1">Drag & drop • Crop • Edit</p>
              </div>
            )}
          </div>
          
          {/* Form fields with more prominence and reduced spacing */}
          <div className="space-y-2 pt-2">
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
                className="mt-1 min-h-[120px] touch-manipulation"
              />
            </div>
          </div>
          
          {/* Post button with reduced top margin */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full py-6 rounded-full flex items-center justify-center gap-2 touch-manipulation"
              disabled={isButtonDisabled}
            >
              <UploadIcon className="h-5 w-5" />
              <span>
                {mediaProcessing ? "Processing..." : 
                 isProcessing ? "Posting..." : 
                 isSaving ? "Saving..." : 
                 "Post"}
              </span>
            </Button>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
              Debug: hasMedia={hasValidMedia().toString()}, processing={mediaProcessing.toString()}, preview={!!mediaPreview}
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default Post;
