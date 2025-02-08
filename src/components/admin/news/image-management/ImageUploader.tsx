
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  label: string;
  placeholder: string;
}

export const ImageUploader = ({
  imageUrl,
  setImageUrl,
  label,
  placeholder,
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      // Reset input value to allow selecting the same file again
      event.target.value = '';
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images-draft')
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
        .from('news-images-draft')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        toast({
          title: "Error",
          description: "Failed to get image URL. Please try again.",
          variant: "destructive",
        });
        return;
      }

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

  const handleImageDelete = async () => {
    try {
      if (!imageUrl) return;

      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('news-images-draft')
        .remove([fileName]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete image",
          variant: "destructive",
        });
        return;
      }

      setImageUrl("");
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="relative">
        {imageUrl ? (
          <div className="relative w-full bg-gray-100 rounded-lg">
            <img
              src={imageUrl}
              alt={label}
              className="w-full rounded-lg"
              style={{ maxHeight: '400px', width: 'auto' }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleImageDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Label
            htmlFor={`image-${label}`}
            className={`cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:border-primary transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="file"
              id={`image-${label}`}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <Plus className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">{placeholder}</span>
          </Label>
        )}
      </div>
    </div>
  );
};

