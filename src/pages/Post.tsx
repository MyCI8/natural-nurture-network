
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Image, Video, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useVideoForm } from "@/hooks/useVideoForm";
import { MediaUploader } from "@/components/explore/MediaUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoLoadingState } from "@/components/explore/VideoLoadingState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Post = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"media" | "details">("media");
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
      toast.error("Please sign in to create a post");
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
    if (currentStep === "details") {
      setCurrentStep("media");
    } else {
      // Go back to previous page or home
      navigate(-1);
    }
  };

  const handleNextStep = () => {
    if (currentStep === "media") {
      if (!mediaPreview) {
        toast.error("Please upload a video or image first");
        return;
      }
      setCurrentStep("details");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mediaPreview) {
      toast.error("Please upload a video or image first");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save as published
      const result = await saveVideo(false);
      
      if (result) {
        toast.success("Post created successfully!");
        navigate("/explore");
      } else {
        toast.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating your post");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingUser) {
    return <VideoLoadingState />;
  }

  return (
    <div className="min-h-screen bg-background pt-4 pb-16">
      <div className="relative">
        {/* Header with back button */}
        <header className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-background z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack}
            className="rounded-full h-10 w-10"
          >
            {currentStep === "media" ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Button>
          
          <h1 className="text-lg font-semibold">
            {currentStep === "media" ? "New Post" : "Add Details"}
          </h1>
          
          <div className="w-10">
            {currentStep === "media" && mediaPreview && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNextStep}
                className="text-primary font-medium"
              >
                Next
              </Button>
            )}
          </div>
        </header>

        {/* Main content area */}
        <main className="px-4 py-4">
          {currentStep === "media" ? (
            <div className="space-y-6">
              <MediaUploader
                mediaPreview={mediaPreview}
                isYoutubeLink={isYoutubeLink}
                videoUrl={formState.video_url || ""}
                onMediaUpload={handleMediaUpload}
                onVideoLinkChange={handleVideoLinkChange}
                onClearMedia={clearMediaFile}
              />
              <div className="text-center text-sm text-muted-foreground">
                <p>Upload a video or photo to share</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Media preview */}
              {mediaPreview && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    placeholder="Add a title..."
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formState.description || ""}
                    onChange={handleInputChange}
                    placeholder="Add a description..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6 rounded-full flex items-center justify-center gap-2"
                disabled={isSaving || isProcessing}
              >
                <UploadIcon className="h-5 w-5" />
                <span>{isProcessing ? "Posting..." : "Post"}</span>
              </Button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default Post;
