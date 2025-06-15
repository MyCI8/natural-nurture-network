
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";

interface RemedyImageCardProps {
  imageUrl: string;
  name: string;
  summary?: string;
  onClick?: () => void;
}

const RemedyImageCard: React.FC<RemedyImageCardProps> = ({ imageUrl, name, summary, onClick }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Intelligent aspect ratio detection, fallback to 16:9
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      setIsLoaded(true);
    }
  }, []);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
    setIsLoaded(true);
  };

  return (
    <Card
      tabIndex={0}
      className={clsx(
        "remedy-image-card group transition-all duration-300 cursor-pointer touch-manipulation active:scale-[0.97] shadow-none hover:shadow-xl bg-background/95",
        "rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
      onClick={onClick}
      aria-label={`View remedy: ${name}`}
    >
      <CardContent className="p-0">
        {/* THE IMAGE, always uses object-contain */}
        <div
          className="w-full flex items-center justify-center bg-muted transition-all duration-200"
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : "16/9",
            maxHeight: 250,
            minHeight: 120,
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          {/* Image skeleton */}
          {!isLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-border/50" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={name}
            ref={imgRef}
            decoding="async"
            loading="lazy"
            onLoad={handleImgLoad}
            draggable={false}
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              maxHeight: 240,
              maxWidth: "100%",
              borderRadius: "1rem",
              display: isLoaded ? "block" : "none",
              background: "transparent",
              transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
            }}
            className="bg-muted group-hover:scale-105"
          />
        </div>
        <div className="px-5 py-3 flex flex-col items-center">
          <h3 className="text-base font-semibold text-primary mb-1 text-center leading-tight line-clamp-2 select-text">
            {name}
          </h3>
          {summary && (
            <p className="text-[15px] text-muted-foreground text-center leading-snug line-clamp-2 select-text">
              {summary}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RemedyImageCard;
