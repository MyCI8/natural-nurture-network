
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemedyRatingDisplayProps {
  average?: number;
  count?: number;
  userRating?: number;
  size?: number; // pixel size (default 18)
}
export const RemedyRatingDisplay: React.FC<RemedyRatingDisplayProps> = ({
  average = 0,
  count = 0,
  userRating,
  size = 18,
}) => {
  // For stars: highlight user's rating if present, otherwise average (to the nearest 0.5).
  const filledStars = userRating ?? Math.round(average * 2) / 2;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            "transition-colors",
            (filledStars >= i ? "text-yellow-400 fill-yellow-300" :
            filledStars >= i - 0.5 ? "text-yellow-400 fill-yellow-200" :
            "text-gray-300"),
            userRating && i <= userRating ? "scale-110" : ""
          )}
          aria-label={`${i <= (userRating ?? average) ? "filled" : "empty"} star`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {average > 0 ? `${average.toFixed(1)}` : "No rating"}
        {count ? <span className="text-xs text-muted-foreground"> ({count})</span> : ""}
      </span>
      {userRating && (
        <span className="ml-1 px-2 py-0.5 rounded bg-yellow-50 border text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700">
          Your rating
        </span>
      )}
    </div>
  );
};
export default RemedyRatingDisplay;
