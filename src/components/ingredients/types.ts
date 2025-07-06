
import { Json } from "@/integrations/supabase/types";

export interface Video {
  title: string;
  url: string;
  thumbnail?: string;
}

export interface Expert {
  id: string;
  full_name: string;
  image_url: string | null;
}

export const parseVideos = (videosData: Json | null): Video[] => {
  if (!videosData || !Array.isArray(videosData)) {return [];}
  
  return videosData
    .filter((video): video is { title: string; url: string; thumbnail?: string } => {
      if (typeof video !== 'object' || video === null) {return false;}
      const v = video as any;
      return typeof v.title === 'string' && typeof v.url === 'string' &&
             (v.thumbnail === undefined || typeof v.thumbnail === 'string');
    });
};
