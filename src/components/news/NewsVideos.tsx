
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface VideoLink {
  title: string;
  url: string;
}

interface NewsVideosProps {
  videoLinks: VideoLink[];
  videoDescription?: string | null;
  isDesktop: boolean;
}

export const NewsVideos = ({ videoLinks, videoDescription, isDesktop }: NewsVideosProps) => {
  if (!videoLinks.length) return null;

  // Filter out invalid URLs
  const validVideoLinks = videoLinks.filter(link => link.url && link.url.trim() !== '');

  if (!validVideoLinks.length) return null;

  const getEmbedUrl = (url: string) => {
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle YouTube short links
    else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Return original URL if it's already an embed or another video service
    return url;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className={`p-0 ${isDesktop ? 'px-4' : 'px-0'}`}>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Related Videos</h2>
          {videoDescription && (
            <p className="text-sm text-muted-foreground mt-1">{videoDescription}</p>
          )}
        </div>

        <div className="space-y-4">
          {validVideoLinks.map((video, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={getEmbedUrl(video.url)}
                  title={video.title || `Video ${index + 1}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              {video.title && (
                <div className="flex items-start">
                  <h3 className="text-sm font-medium">{video.title}</h3>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 ml-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
