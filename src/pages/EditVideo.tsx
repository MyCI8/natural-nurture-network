
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoForm } from "@/hooks/useVideoForm";
import { toast } from "sonner";
import ProductLinksEditor from "@/components/explore/ProductLinksEditor";
import VideoInfoPanel from "@/components/explore/VideoInfoPanel";
import { BackButton } from "@/components/explore/BackButton";
import { VideoLoadingState } from "@/components/explore/VideoLoadingState";
import { VideoDetailsForm } from "@/components/video/VideoDetailsForm";

const EditVideo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  
  const videoType = location.state?.videoType || 'explore';
  
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
      const correctReturnPath = formState.video_type === 'news' 
        ? "/admin/news/videos" 
        : "/admin/videos";
        
      console.log("Video saved, navigating to:", correctReturnPath);
      
      if (correctReturnPath.includes("news/videos")) {
        window.dispatchEvent(new CustomEvent("refetch-news-videos"));
      }
      
      setTimeout(() => {
        navigate(correctReturnPath);
      }, 100);
    }
  };

  const handleSaveDraft = async () => {
    const result = await saveVideo(true);
    if (result) {
      if (!id) {
        const correctReturnPath = formState.video_type === 'news' 
          ? "/admin/news/videos" 
          : "/admin/videos";
          
        navigate(`/admin/videos/${result.id}`, {
          state: { 
            returnTo: correctReturnPath,
            videoType: formState.video_type 
          }
        });
      } else {
        toast({
          description: "Your video has been saved as a draft."
        });
      }
    }
  };

  if (isLoading) {
    return <VideoLoadingState />;
  }
  
  const pageTitle = id 
    ? `Edit ${formState.video_type === 'news' ? 'News' : 'Explore'} Video` 
    : `Create New ${formState.video_type === 'news' ? 'News' : 'Explore'} Video`;

  const handleThumbnailUpdated = (newThumbnailUrl: string) => {
    handleInputChange("thumbnail_url", newThumbnailUrl);
  };

  // Create a wrapper for handleInputChange to adapt the function signature
  const handleFormInputChange = (name: string, value: any) => {
    handleInputChange({ target: { name, value } } as any);
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
                  handleInputChange={handleFormInputChange}
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
