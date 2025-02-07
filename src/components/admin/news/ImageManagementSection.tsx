
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ImageManagementSectionProps {
  thumbnailUrl: string;
  setThumbnailUrl: (value: string) => void;
  thumbnailDescription: string;
  setThumbnailDescription: (value: string) => void;
  mainImageUrl: string;
  setMainImageUrl: (value: string) => void;
  mainImageDescription: string;
  setMainImageDescription: (value: string) => void;
}

export const ImageManagementSection = ({
  thumbnailUrl,
  setThumbnailUrl,
  thumbnailDescription,
  setThumbnailDescription,
  mainImageUrl,
  setMainImageUrl,
  mainImageDescription,
  setMainImageDescription,
}: ImageManagementSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setImageUrl: (url: string) => void
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      // Reset input value to allow selecting the same file again
      event.target.value = '';
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Image Management</h3>
      
      <div className="space-y-4">
        <Label>Thumbnail Image</Label>
        <div className="flex items-center gap-4">
          {thumbnailUrl && (
            <div className="relative">
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={() => setThumbnailUrl("")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Label
            htmlFor="thumbnail"
            className={`cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="file"
              id="thumbnail"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setThumbnailUrl)}
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-pulse">Uploading...</div>
            ) : (
              <Plus className="h-6 w-6 text-gray-400" />
            )}
          </Label>
        </div>
        <div>
          <Label htmlFor="thumbnailDescription">Thumbnail Description</Label>
          <Input
            id="thumbnailDescription"
            value={thumbnailDescription}
            onChange={(e) => setThumbnailDescription(e.target.value)}
            placeholder="Description of the thumbnail image"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Main Article Image (Optional)</Label>
        <div className="flex items-center gap-4">
          {mainImageUrl && (
            <div className="relative">
              <img
                src={mainImageUrl}
                alt="Main"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={() => setMainImageUrl("")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Label
            htmlFor="mainImage"
            className={`cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="file"
              id="mainImage"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setMainImageUrl)}
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-pulse">Uploading...</div>
            ) : (
              <Plus className="h-6 w-6 text-gray-400" />
            )}
          </Label>
        </div>
        <div>
          <Label htmlFor="mainImageDescription">Main Image Description</Label>
          <Input
            id="mainImageDescription"
            value={mainImageDescription}
            onChange={(e) => setMainImageDescription(e.target.value)}
            placeholder="Description of the main article image"
          />
        </div>
      </div>
    </div>
  );
};
