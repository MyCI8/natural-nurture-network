
import { ImageUploader } from "./image-management/ImageUploader";
import { ImageDescriptionInput } from "./image-management/ImageDescriptionInput";

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
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Image Management</h3>
      
      <div className="space-y-4">
        <ImageUploader
          imageUrl={thumbnailUrl}
          setImageUrl={setThumbnailUrl}
          label="Thumbnail Image"
          placeholder="Add thumbnail image"
        />
        <ImageDescriptionInput
          id="thumbnailDescription"
          value={thumbnailDescription}
          onChange={setThumbnailDescription}
          label="Thumbnail Description"
          placeholder="Description of the thumbnail image"
        />
      </div>

      <div className="space-y-4">
        <ImageUploader
          imageUrl={mainImageUrl}
          setImageUrl={setMainImageUrl}
          label="Main Article Image (Optional)"
          placeholder="Add main article image"
        />
        <ImageDescriptionInput
          id="mainImageDescription"
          value={mainImageDescription}
          onChange={setMainImageDescription}
          label="Main Image Description"
          placeholder="Description of the main article image"
        />
      </div>
    </div>
  );
};
