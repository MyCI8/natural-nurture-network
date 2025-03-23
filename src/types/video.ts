
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
  related_article_id?: string | null;
  creator?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
  };
  usage?: "latest" | "article" | "both" | "none";
  relatedArticleTitle?: string;
  showInLatest?: boolean; // Field to explicitly control display in Latest Videos section
  show_in_latest?: boolean; // Actual database column name
}

export interface ProductLink {
  id: string;
  video_id?: string;
  title: string;
  url: string;
  price?: number | null;
  position_x?: number | null;
  position_y?: number | null;
  created_at?: string;
}
