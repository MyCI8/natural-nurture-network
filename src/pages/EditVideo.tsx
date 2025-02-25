
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Video, X, Crop, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const EditVideo = () => {
  const navigate = useNavigate();
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

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newMediaFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));

    setMediaFiles([...mediaFiles, ...newMediaFiles]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || mediaFiles.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

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

      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          title,
          description: description.trim() || null,
          video_url: uploadedFiles[0], // First file is main video
          thumbnail_url: uploadedFiles.length > 1 ? uploadedFiles[1] : null, // Second file as thumbnail if exists
          status: 'draft',
          creator_id: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      navigate('/admin/videos');
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
          <h1 className="text-2xl font-bold mb-6 text-[#222222]">Create New Video</h1>

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
                  className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  multiple
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
                  {mediaFiles.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMediaFiles([])}
                      className="mt-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear all media
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-[#4CAF50] hover:bg-[#388E3C] text-white min-w-[120px]"
                disabled={isUploading || !title.trim() || mediaFiles.length === 0}
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
    </div>
  );
};

export default EditVideo;
