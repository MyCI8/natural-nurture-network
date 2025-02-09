
import { ImageUploader } from "@/components/admin/news/image-management/ImageUploader";
import { ImageDescriptionInput } from "@/components/admin/news/image-management/ImageDescriptionInput";

interface RemedyImageSectionProps {
  thumbnailUrl: string;
  setThumbnailUrl: (url: string) => void;
  thumbnailDescription: string;
  setThumbnailDescription: (description: string) => void;
  mainImageUrl: string;
  setMainImageUrl: (url: string) => void;
  mainImageDescription: string;
  setMainImageDescription: (description: string) => void;
}

export const RemedyImageSection = ({
  thumbnailUrl,
  setThumbnailUrl,
  thumbnailDescription,
  setThumbnailDescription,
  mainImageUrl,
  setMainImageUrl,
  mainImageDescription,
  setMainImageDescription,
}: RemedyImageSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Images</h3>
      
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
          placeholder="Enter thumbnail description"
        />
      </div>

      <div className="space-y-4">
        <ImageUploader
          imageUrl={mainImageUrl}
          setImageUrl={setMainImageUrl}
          label="Main Image"
          placeholder="Add main image"
        />
        <ImageDescriptionInput
          id="mainImageDescription"
          value={mainImageDescription}
          onChange={setMainImageDescription}
          label="Main Image Description"
          placeholder="Enter main image description"
        />
      </div>
    </div>
  );
};
