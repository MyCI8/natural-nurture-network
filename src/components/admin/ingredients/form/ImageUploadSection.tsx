
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
interface ImageUploadSectionProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

const ImageUploadSection = ({ imageUrl, onImageChange }: ImageUploadSectionProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {return;}

      setUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('remedy-images')
        .upload(`ingredients/${fileName}`, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image. Please ensure you have admin permissions.",
          variant: "destructive",
        });
        return;
      }

        .from('remedy-images')
        .getPublicUrl(`ingredients/${fileName}`);

      onImageChange(publicUrl);
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
    <div>
      <Label>Image</Label>
      <div className="mt-2 flex items-center gap-4">
        {imageUrl && (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Ingredient"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={() => onImageChange("")}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Label
          htmlFor="image"
          className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary"
        >
          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          <Plus className="h-6 w-6 text-gray-400" />
        </Label>
      </div>
    </div>
  );
};

export default ImageUploadSection;
