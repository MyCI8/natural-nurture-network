
import { Card, CardContent } from "@/components/ui/card";
import MediaContainer from "@/components/ui/media-container";

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
  return (
    <Card 
      className="x-media-card cursor-pointer touch-manipulation active-scale" 
      onClick={() => onClick(id)}
    >
      <CardContent className="p-0">
        <MediaContainer 
          aspectRatio="auto"
          imageUrl={imageUrl}
          imageAlt={name}
          onClick={() => onClick(id)}
        >
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500" 
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
