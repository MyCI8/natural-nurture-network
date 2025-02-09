
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface RemedyImageInputProps {
  imageFile: File | null;
  imagePreview: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
}

export const RemedyImageInput = ({
  imageFile,
  imagePreview,
  onImageChange,
  onDeleteImage,
}: RemedyImageInputProps) => {
  return (
    <div>
      <Label htmlFor="image">Thumbnail Image</Label>
      <div className="mt-2">
        <div className="flex items-center gap-4">
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={onDeleteImage}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};
