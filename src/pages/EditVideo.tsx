
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoForm } from "@/hooks/useVideoForm";
import { toast } from "@/hooks/use-toast";
import ProductLinksEditor from "@/components/videos/ProductLinksEditor";
import VideoInfoPanel from "@/components/videos/VideoInfoPanel";
import { BackButton } from "@/components/videos/BackButton";
import { VideoLoadingState } from "@/components/videos/VideoLoadingState";
import { VideoDetailsForm } from "@/components/videos/VideoDetailsForm";

const EditVideo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  
  // Determine video type from location state or default to 'explore'
  const videoType = location.state?.videoType || 'explore';
  
  // Always set the correct return path based on video type
  const getCorrectReturnPath = () => {
    if (videoType === 'news') {
      return "/admin/news/videos";
    }
    return "/admin/videos";
  };
  
  const returnTo = location.state?.returnTo || getCorrectReturnPath();
  
  const {
    formState,
    isLoading,
    isSaving,
    mediaPreview,
    isYoutubeLink,
    articles,
    video,
    fetchVideo,
    fetchArticles,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo
  } = useVideoForm(id, videoType);

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
    fetchArticles();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveVideo(false);
    if (result) {
      // Determine the correct return path based on the video type
      const correctReturnPath = formState.videoType === 'news' 
        ? "/admin/news/videos" 
        : "/admin/videos";
        
      console.log("Video saved, navigating to:", correctReturnPath);
      
      // Force a refetch of the videos list then navigate
      if (correctReturnPath.includes("news/videos")) {
        window.dispatchEvent(new CustomEvent("refetch-news-videos"));
      }
      
      // Add a small delay to ensure event processing before navigation
      setTimeout(() => {
        navigate(correctReturnPath);
      }, 100);
    }
  };

  const handleSaveDraft = async () => {
    const result = await saveVideo(true);
    if (result) {
      if (!id) {
        // For new videos, navigate to edit page with correct returnTo state
        const correctReturnPath = formState.videoType === 'news' 
          ? "/admin/news/videos" 
          : "/admin/videos";
          
        navigate(`/admin/videos/${result.id}`, {
          state: { 
            returnTo: correctReturnPath,
            videoType: formState.videoType 
          }
        });
      } else {
        // Stay on the same page with toast notification
        toast({
          title: "Draft saved",
          description: "Your video has been saved as a draft."
        });
      }
    }
  };

  if (isLoading) {
    return <VideoLoadingState />;
  }
  
  // Determine page title based on video type
  const pageTitle = id 
    ? `Edit ${formState.videoType === 'news' ? 'News' : 'Explore'} Video` 
    : `Create New ${formState.videoType === 'news' ? 'News' : 'Explore'} Video`;

  const handleThumbnailUpdated = (newThumbnailUrl: string) => {
    // Update the form state with the new thumbnail URL
    handleInputChange("thumbnailUrl", newThumbnailUrl);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-4 sm:p-6 max-w-[1000px]">
        <BackButton onClick={() => navigate(returnTo)} />

        {id && <VideoInfoPanel video={video} isLoading={isLoading} />}

        <Card>
          <CardHeader className="border-b py-4">
            <CardTitle className="text-xl">{pageTitle}</CardTitle>
          </CardHeader>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 sm:px-6 pt-3">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="details" className="touch-manipulation">Video Details</TabsTrigger>
                {id && <TabsTrigger value="products" className="touch-manipulation">Product Links</TabsTrigger>}
              </TabsList>
            </div>
            
            <TabsContent value="details">
              <CardContent className="p-0">
                <VideoDetailsForm 
                  formState={formState}
                  mediaPreview={mediaPreview}
                  isYoutubeLink={isYoutubeLink}
                  articles={articles}
                  videoId={id}
                  isSaving={isSaving}
                  handleInputChange={handleInputChange}
                  handleMediaUpload={handleMediaUpload}
                  handleVideoLinkChange={handleVideoLinkChange}
                  clearMediaFile={clearMediaFile}
                  handleSubmit={handleSubmit}
                  handleSaveDraft={handleSaveDraft}
                  onThumbnailUpdated={handleThumbnailUpdated}
                />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="products">
              {id ? (
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <ProductLinksEditor videoId={id} />
                </CardContent>
              ) : (
                <CardContent className="pt-4 sm:pt-6 text-center py-8 sm:py-12">
                  <p className="text-muted-foreground">Save the video first to add product links.</p>
                </CardContent>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default EditVideo;
