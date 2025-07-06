
import { Card } from "@/components/ui/card";
import { Video } from "./types";

interface IngredientVideosProps {
  videos: Video[];
}

export const IngredientVideos = ({ videos }: IngredientVideosProps) => {
  if (videos.length === 0) {return null;}

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <Card key={index} className="p-4">
            {video.thumbnail && (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-medium">{video.title}</h3>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Watch Video
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
};
