
export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  creator_id: string | null;
  status: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  video_type: string;
  related_article_id: string | null;
  creator?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
  };
  usage?: "latest" | "article" | "both" | "none";
  relatedArticleTitle?: string;
  
  // The actual database column - this is the one to use
  show_in_latest?: boolean; // Database column that controls display in Latest Videos section
  
  // For UI display: We map 'general' in the database to 'explore' in the UI
  displayVideoType?: string;
  
  // Support for multiple image uploads (carousel)
  media_files?: string[] | null;
  is_carousel?: boolean;
}

export interface ProductLink {
  id: string;
  video_id?: string;
  title: string;
  url: string;
  price?: number | null;
  image_url?: string;
  created_at?: string;
  description?: string;
  position_x?: number | null;
  position_y?: number | null;
}
