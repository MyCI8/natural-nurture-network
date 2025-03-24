
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/videos/MediaUploader";
import { useVideoForm } from "@/hooks/useVideoForm";
import { toast } from "sonner";

const EditVideo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    formState,
    isLoading,
    isSaving,
    mediaPreview,
    isYoutubeLink,
    articles,
    fetchVideo,
    fetchArticles,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo
  } = useVideoForm(id);

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
      navigate("/admin/news/videos");
    }
  };

  const handleSaveDraft = async () => {
    const result = await saveVideo(true);
    if (result && !id) {
      navigate(`/admin/videos/${result.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto p-6 max-w-[800px]">
          <div className="flex items-center justify-center h-64">
            <p>Loading video data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6 max-w-[800px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-6">
              <h1 className="text-2xl font-bold text-[#222222]">
                {id ? "Edit Video" : "Create New Video"}
              </h1>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter video title"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedArticle">Related Article (Optional)</Label>
                <Select
                  value={formState.relatedArticleId || ""}
                  onValueChange={(value) => handleInputChange("relatedArticleId", value === "" ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a related article (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {articles.map((article) => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Add a description..."
                  className="min-h-[120px]"
                />
              </div>

              <MediaUploader
                mediaPreview={mediaPreview}
                isYoutubeLink={isYoutubeLink}
                videoUrl={formState.videoUrl}
                onMediaUpload={handleMediaUpload}
                onVideoLinkChange={handleVideoLinkChange}
                onClearMedia={clearMediaFile}
              />

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showInLatest" 
                  checked={formState.showInLatest}
                  onCheckedChange={(checked) => handleInputChange("showInLatest", checked)}
                />
                <label
                  htmlFor="showInLatest"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show in Latest Videos section
                </label>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !formState.title || (!formState.videoUrl && !mediaPreview)}
              >
                {isSaving ? "Saving..." : id ? "Update Video" : "Publish Video"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditVideo;
