
export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  creator_id: string;
  status: 'draft' | 'published' | 'archived';
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
}

export interface ProductLink {
  id: string;
  video_id: string;
  title: string;
  url: string;
  price: number | null;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
}
