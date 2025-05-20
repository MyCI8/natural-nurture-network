
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/explore/MediaUploader";
import RegenerateThumbnail from "@/components/explore/RegenerateThumbnail";
import { VideoFormState } from "@/hooks/video/useVideoFormState";
import { Upload } from "lucide-react";

interface VideoDetailsFormProps {
  formState: VideoFormState;
  mediaPreview: string | null;
  isYoutubeLink: boolean;
  articles: { id: string; title: string }[];
  videoId?: string;
  isSaving: boolean;
  handleInputChange: (name: keyof VideoFormState, value: any) => void;
  handleMediaUpload: (file: File) => void;
  handleVideoLinkChange: (url: string) => void;
  clearMediaFile: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSaveDraft: () => Promise<void>;
  onThumbnailUpdated: (newThumbnailUrl: string) => void;
}

export function VideoDetailsForm({
  formState,
  mediaPreview,
  isYoutubeLink,
  articles,
  videoId,
  isSaving,
  handleInputChange,
  handleMediaUpload,
  handleVideoLinkChange,
  clearMediaFile,
  handleSubmit,
  handleSaveDraft,
  onThumbnailUpdated,
}: VideoDetailsFormProps) {
  return (
    <form onSubmit={handleSubmit}>
      <div className="pt-4 space-y-4 sm:pt-6 sm:space-y-6 px-4 sm:px-6">
        {/* Only show title if videoType is not 'explore' */}
        {formState.videoType !== 'explore' && (
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
        )}

        {formState.videoType === 'news' && (
          <div className="space-y-2">
            <Label htmlFor="relatedArticle">Related Article (Optional)</Label>
            <Select
              value={formState.relatedArticleId || "none"}
              onValueChange={(value) => handleInputChange("relatedArticleId", value === "none" ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a related article (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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

        <>
          <MediaUploader
            mediaPreview={mediaPreview}
            isYoutubeLink={isYoutubeLink}
            videoUrl={formState.videoUrl}
            onMediaUpload={handleMediaUpload}
            onVideoLinkChange={handleVideoLinkChange}
            onClearMedia={clearMediaFile}
          />
          
          {videoId && formState.videoUrl && (
            <div className="flex justify-end">
              <RegenerateThumbnail 
                video={{
                  id: videoId,
                  title: formState.title,
                  video_url: formState.videoUrl,
                  thumbnail_url: formState.thumbnailUrl,
                  // Include other required Video properties
                  description: formState.description,
                  creator_id: null,
                  status: formState.status,
                  views_count: 0,
                  likes_count: 0,
                  created_at: "",
                  updated_at: "",
                  video_type: formState.videoType,
                  related_article_id: formState.relatedArticleId
                }}
                onThumbnailUpdated={onThumbnailUpdated}
              />
            </div>
          )}
        </>

        {formState.videoType === 'news' && (
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
        )}
      </div>
      
      <div className="flex justify-between border-t px-4 sm:px-6 py-3 sm:py-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="touch-manipulation"
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={
            isSaving ||
            (formState.videoType !== "explore" && !formState.title) || 
            (!formState.videoUrl && !mediaPreview)
          }
          className="touch-manipulation flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isSaving ? "Saving..." : videoId ? "Update Post" : "Post"}
        </Button>
      </div>
    </form>
  );
}
