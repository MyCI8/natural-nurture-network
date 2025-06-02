
import { useState } from 'react';

interface VideoMetadata {
  title: string;
  description?: string;
  thumbnail?: string;
}

export const useVideoMetadata = () => {
  const [isLoading, setIsLoading] = useState(false);

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const fetchYouTubeMetadata = async (url: string): Promise<VideoMetadata | null> => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    try {
      // Use YouTube's oEmbed API which doesn't require an API key
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      if (!response.ok) throw new Error('Failed to fetch video metadata');
      
      const data = await response.json();
      return {
        title: data.title || '',
        description: data.author_name || '',
        thumbnail: data.thumbnail_url || ''
      };
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      return null;
    }
  };

  const fetchVimeoMetadata = async (url: string): Promise<VideoMetadata | null> => {
    try {
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch Vimeo metadata');
      
      const data = await response.json();
      return {
        title: data.title || '',
        description: data.author_name || '',
        thumbnail: data.thumbnail_url || ''
      };
    } catch (error) {
      console.error('Error fetching Vimeo metadata:', error);
      return null;
    }
  };

  const fetchVideoMetadata = async (url: string): Promise<VideoMetadata | null> => {
    setIsLoading(true);
    
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return await fetchYouTubeMetadata(url);
      } else if (url.includes('vimeo.com')) {
        return await fetchVimeoMetadata(url);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchVideoMetadata,
    isLoading
  };
};
