
import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import OptimizedImage from "@/components/ui/optimized-image";
import { getSafeImageUrl } from "@/utils/imageValidation";

interface OptimizedRemedyCardProps {
  id: string;
  name: string;
  summary: string;
  imageUrl: string;
  onClick: (id: string) => void;
}

const OptimizedRemedyCard: React.FC<OptimizedRemedyCardProps> = memo(({
  id,
  name,
  summary,
  imageUrl,
  onClick
}) => {
  const safeImageUrl = getSafeImageUrl(imageUrl);
  
  return (
    <Card 
      className="cursor-pointer touch-manipulation transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" 
      onClick={() => onClick(id)}
    >
      <CardContent className="p-0">
        <OptimizedImage
          src={safeImageUrl}
          alt={name}
          className="rounded-t-lg"
          aspectRatio="4:3"
          width={300}
          height={225}
        />
        <div className="p-6 px-[20px] py-[8px]">
          <h3 className="text-lg font-semibold text-primary dark:text-primary mb-2 line-clamp-2">
            {name}
          </h3>
          <p className="text-text-light text-sm line-clamp-3">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedRemedyCard.displayName = 'OptimizedRemedyCard';

export default OptimizedRemedyCard;
