
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { useVideoForm } from "@/hooks/useVideoForm";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoLoadingState } from "@/components/explore/VideoLoadingState";
import { useQuery } from "@tanstack/react-query";
import { MediaUploader } from "@/components/explore/MediaUploader";

const Post = () => {
  const navigate = useNavigate();

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      return session?.user || null;
    },
  });

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      toast("Please sign in to create a post");
      navigate("/auth");
    }
  }, [currentUser, isLoadingUser, navigate]);

  // Initialize video form with "explore" type
  const {
    formState,
    isSaving,
    isProcessing: mediaProcessing,
    isYoutubeLink,
    error: mediaError,
    mediaUrl,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo,
    hasValidMedia,
    getCurrentMediaType
  } = useVideoForm(undefined, "explore");

  const goBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submit - checking media:', {
      hasValidMedia: hasValidMedia(),
      mediaUrl: mediaUrl,
      description: formState.description,
      currentMediaType: getCurrentMediaType(),
      mediaError
    });
    
    if (mediaError) {
      toast.error("Please fix the media error before posting");
      return;
    }
    
    if (!hasValidMedia()) {
      toast.error("Please select a video or image first");
      return;
    }
    
    if (!formState.description?.trim()) {
      toast.error("Please add a description for your post");
      return;
    }
    
    try {
      const result = await saveVideo();
      if (result) {
        toast.success("Post created successfully!");
        navigate("/explore");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('Save video error:', error);
      toast.error(`Failed to create post: ${errorMessage}`);
    }
  };

  if (isLoadingUser) {
    return <VideoLoadingState />;
  }

  // Button state logic - disabled if processing, has errors, or invalid media
  const isButtonDisabled = isSaving || mediaProcessing || !hasValidMedia() || !!mediaError;

  return (
    <div className="min-h-screen bg-background pt-8 pb-16 flex flex-col">
      {/* Header with back button */}
      <header className="flex items-center px-4 py-1 border-b sticky top-0 bg-background z-10 gap-2" style={{ minHeight: "48px" }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="rounded-full h-10 w-10 touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold flex-1 text-center">Create New Post</h1>
        <div className="w-10 flex-shrink-0" />
      </header>

      {/* Main content area */}
      <main className="flex-1 px-2 sm:px-4 pt-4 pb-4 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
          {/* Media Uploader - positioned prominently at the top */}
          <div className="w-full">
            <Label className="text-sm font-medium mb-2 block">
              Media
            </Label>
            <MediaUploader
              mediaUrl={mediaUrl || ""}
              isYoutubeLink={isYoutubeLink}
              onMediaUpload={handleMediaUpload}
              onVideoLinkChange={handleVideoLinkChange}
              onClearMedia={clearMediaFile}
              compact={false}
              isProcessing={mediaProcessing}
              mediaType={getCurrentMediaType() as any}
              error={mediaError}
            />
          </div>

          {/* Form field: Description */}
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
              minLength={2}
              maxLength={500}
              required
              className="mt-1 min-h-[90px] max-h-[240px] touch-manipulation bg-background"
            />
          </div>

          {/* Post button and progress state */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-5 rounded-full flex items-center justify-center gap-2 touch-manipulation text-base bg-green-600 hover:bg-green-700"
              disabled={isButtonDisabled}
            >
              <UploadIcon className="h-5 w-5" />
              <span>
                {mediaProcessing
                  ? "Processing..."
                  : isSaving
                  ? "Posting..."
                  : "Post"}
              </span>
            </Button>
          </div>

          {/* Show processing progress visually */}
          {(isSaving || mediaProcessing) && (
            <div className="w-full flex justify-center pt-2">
              <span className="text-xs text-muted-foreground animate-pulse">
                {isSaving ? "Finalizing upload..." : "Processing file..."}
              </span>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default Post;
