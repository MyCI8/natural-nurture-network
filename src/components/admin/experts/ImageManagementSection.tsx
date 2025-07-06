import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ImageManagementSectionProps {
  imageUrl: string;
  setImageUrl: (value: string) => void;
}

export const ImageManagementSection = ({
  imageUrl,
  setImageUrl,
}: ImageManagementSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {return;}

      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('expert-images')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('expert-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Expert Image</h3>
      
      <div className="space-y-4">
        <Label>Profile Image</Label>
        <div className="flex items-center gap-4">
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={() => setImageUrl("")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Label
            htmlFor="expertImage"
            className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary"
          >
            <input
              type="file"
              id="expertImage"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <Plus className="h-6 w-6 text-gray-400" />
          </Label>
        </div>
      </div>
    </div>
  );
};