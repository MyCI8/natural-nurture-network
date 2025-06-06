
import { Card, CardContent } from "@/components/ui/card";
import MediaContainer from "@/components/ui/media-container";
import { getSafeImageUrl } from "@/utils/imageValidation";

interface RemedyCardProps {
  id: string;
  name: string;
  summary: string;
  imageUrl: string;
  onClick: (id: string) => void;
}

const RemedyCard = ({
  id,
  name,
  summary,
  imageUrl,
  onClick
}: RemedyCardProps) => {
  // Ensure we're using a safe image URL
  const safeImageUrl = getSafeImageUrl(imageUrl);
  
  console.log(`RemedyCard rendering: ${name} with image:`, {
    original: imageUrl,
    safe: safeImageUrl,
    is_placeholder: safeImageUrl === "/placeholder.svg"
  });
  
  return (
    <Card 
      className="x-media-card cursor-pointer touch-manipulation active-scale" 
      onClick={() => onClick(id)}
    >
      <CardContent className="p-0">
        <MediaContainer 
          aspectRatio="4:3"
          imageUrl={safeImageUrl}
          imageAlt={name}
          onClick={() => onClick(id)}
        >
          <img 
            src={safeImageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500"
            onLoad={() => {
              console.log(`RemedyCard image loaded successfully for ${name}:`, safeImageUrl);
            }}
            onError={(e) => {
              console.error(`RemedyCard image failed to load for ${name}:`, safeImageUrl);
              // Set fallback image
              const target = e.target as HTMLImageElement;
              if (target.src !== "/placeholder.svg") {
                console.log('RemedyCard: Setting fallback to placeholder');
                target.src = "/placeholder.svg";
              }
            }}
          />
        </MediaContainer>
        <div className="p-6 px-[20px] py-[8px]">
          <h3 className="text-lg font-semibold text-primary dark:text-primary mb-2">
            {name}
          </h3>
          <p className="text-text-light text-sm">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RemedyCard;
