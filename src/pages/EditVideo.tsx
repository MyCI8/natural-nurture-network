
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Video, X, Crop, Trash2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface LocationState {
  returnTo?: string;
  videoType?: string;
  articleId?: string;
}

const DAILY_UPLOAD_LIMIT = 20;

// Available video types for selection
const VIDEO_TYPES = [
  { value: "general", label: "General Video" },
  { value: "news", label: "News Video" }
];

const EditVideo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [currentCrop, setCurrentCrop] = useState<CropType>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [videoType, setVideoType] = useState("general");
  const [relatedArticleId, setRelatedArticleId] = useState<string | null>(null);
  const [articles, setArticles] = useState<{id: string, title: string}[]>([]);
  const [showArticleSelect, setShowArticleSelect] = useState(false);

  useEffect(() => {
    const state = location.state as LocationState;
    // Set video type from navigation state if provided
    if (state?.videoType) {
      setVideoType(state.videoType);
    }
    
    // Set related article ID if provided
    if (state?.articleId) {
      setRelatedArticleId(state.articleId);
    }

    // Load published articles for selection if this is a news video
    if (state?.videoType === "news" || videoType === "news") {
      fetchArticles();
    }
  }, [location, videoType]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title')
        .eq('status', 'published');
        
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  const checkUploadLimit = async (userId: string): Promise<boolean> => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId)
      .gte('created_at', yesterday);

    if (error) {
      console.error('Error checking upload limit:', error);
      return false;
    }

    return (count || 0) < DAILY_UPLOAD_LIMIT;
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > 0) {
      const file = files[0];
      const newMediaFile = {
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
      };
      
      if (mediaFiles.length > 0) {
        mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
      }
      
      setMediaFiles([newMediaFile]);
      setVideoLink("");
      setIsAddingLink(false);
    }
  };

  const handleVideoTypeChange = (value: string) => {
    setVideoType(value);
    setShowArticleSelect(value === "news");
  };

  const handleDeleteMedia = (index: number) => {
    URL.revokeObjectURL(mediaFiles[index].preview);
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleCropClick = (index: number) => {
    if (mediaFiles[index].type === 'image') {
      setCropImageIndex(index);
      setIsCropDialogOpen(true);
    }
  };

  const handleCropComplete = async () => {
    if (cropImageIndex === null || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = currentCrop.width! * scaleX;
    canvas.height = currentCrop.height! * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      currentCrop.x! * scaleX,
      currentCrop.y! * scaleY,
      currentCrop.width! * scaleX,
      currentCrop.height! * scaleY,
      0,
      0,
      currentCrop.width! * scaleX,
      currentCrop.height! * scaleY
    );

    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], mediaFiles[cropImageIndex].file.name, { type: 'image/jpeg' });
        const updatedMediaFiles = [...mediaFiles];
        updatedMediaFiles[cropImageIndex] = {
          file,
          preview: URL.createObjectURL(blob),
          type: 'image'
        };
        setMediaFiles(updatedMediaFiles);
      }
    }, 'image/jpeg');

    setIsCropDialogOpen(false);
    setCropImageIndex(null);
  };

  const openAddLinkDialog = () => {
    setIsAddLinkDialogOpen(true);
  };

  const handleAddVideoLink = () => {
    if (!videoLink.trim()) {
      toast({
        title: "Missing link",
        description: "Please enter a valid video URL",
        variant: "destructive",
      });
      return;
    }
    
    if (mediaFiles.length > 0) {
      mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
      setMediaFiles([]);
    }
    
    setIsAddingLink(true);
    setIsAddLinkDialogOpen(false);
  };

  const clearVideoLink = () => {
    setVideoLink("");
    setIsAddingLink(false);
  };

  const getYouTubeThumbnail = (url: string): string => {
    try {
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
    }
    
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (mediaFiles.length === 0 && !isAddingLink)) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and provide either a video file or link",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const canUpload = await checkUploadLimit(user.id);
      if (!canUpload) {
        toast({
          title: "Upload limit reached",
          description: `You can only upload ${DAILY_UPLOAD_LIMIT} videos per day`,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      let videoUrl;
      let thumbnailUrl = null;
      
      if (isAddingLink) {
        videoUrl = videoLink;
        thumbnailUrl = getYouTubeThumbnail(videoLink);
      } else {
        const uploadedFiles = await Promise.all(mediaFiles.map(async (mediaFile) => {
          const fileExt = mediaFile.file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('video-media')
            .upload(fileName, mediaFile.file);

          if (uploadError) throw uploadError;

          return supabase.storage
            .from('video-media')
            .getPublicUrl(fileName).data.publicUrl;
        }));

        videoUrl = uploadedFiles[0];
        thumbnailUrl = uploadedFiles.length > 1 ? uploadedFiles[1] : null;
      }

      // Prepare the video data with proper type and related article if applicable
      const videoData = {
        title,
        description: description.trim() || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: 'published',
        creator_id: user.id,
        video_type: videoType,
        related_article_id: relatedArticleId
      };

      const { error: insertError } = await supabase
        .from('videos')
        .insert(videoData);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Video published successfully",
      });

      const state = location.state as LocationState;
      const returnPath = state?.returnTo || '/admin/videos';
      navigate(returnPath);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6 max-w-[600px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 text-[#222222]">
            Create New {videoType === "news" ? "News " : ""}Video
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="border-gray-300 focus:border-[#4CAF50]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoType">Video Type</Label>
              <Select
                value={videoType}
                onValueChange={handleVideoTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showArticleSelect && articles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="relatedArticle">Related Article (Optional)</Label>
                <Select
                  value={relatedArticleId || ""}
                  onValueChange={(value) => setRelatedArticleId(value === "" ? null : value)}
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
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="min-h-[120px] border-gray-300 focus:border-[#4CAF50]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className={`border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white ${isAddingLink ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isAddingLink}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openAddLinkDialog}
                  className={`border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white ${mediaFiles.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={mediaFiles.length > 0}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </div>

              {mediaFiles.length > 0 && (
                <div className="mt-4">
                  <Slider {...sliderSettings}>
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {media.type === 'video' ? (
                            <video 
                              src={media.preview} 
                              controls 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img 
                              src={media.preview} 
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          )}
                          <div className="absolute top-2 right-2 space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedia(index)}
                              className="bg-white/80 hover:bg-white text-[#4CAF50] hover:text-[#388E3C] rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {media.type === 'image' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCropClick(index)}
                                className="bg-white/80 hover:bg-white text-[#4CAF50] hover:text-[#388E3C] rounded-full"
                              >
                                <Crop className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}

              {isAddingLink && (
                <div className="mt-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Video Link</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearVideoLink}
                        className="text-red-600 hover:text-red-700 p-1 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground break-all mb-2">{videoLink}</p>
                    {getYouTubeThumbnail(videoLink) && (
                      <div className="aspect-video rounded-lg overflow-hidden mt-2">
                        <img 
                          src={getYouTubeThumbnail(videoLink)} 
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-[#4CAF50] hover:bg-[#388E3C] text-white min-w-[120px]"
                disabled={isUploading || !title.trim() || (mediaFiles.length === 0 && !isAddingLink)}
              >
                {isUploading ? "Uploading..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="bg-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {cropImageIndex !== null && mediaFiles[cropImageIndex]?.type === 'image' && (
            <div className="mt-4">
              <ReactCrop
                crop={currentCrop}
                onChange={(c) => setCurrentCrop(c)}
                aspect={16 / 9}
              >
                <img
                  ref={imageRef}
                  src={mediaFiles[cropImageIndex].preview}
                  alt="Crop preview"
                  className="max-h-[60vh] w-auto mx-auto"
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCropDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropComplete}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white"
            >
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddLinkDialogOpen} onOpenChange={setIsAddLinkDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add Video Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="video-link">Video URL</Label>
            <Input
              id="video-link"
              placeholder="https://youtube.com/watch?v=..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Paste a YouTube or other video platform link
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddVideoLink}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white"
            >
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditVideo;
