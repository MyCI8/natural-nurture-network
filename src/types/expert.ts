
export interface Expert {
  id: string;
  full_name: string;
  title: string;
  bio?: string;
  image_url?: string;
  field_of_expertise?: string;
  social_media?: {
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    wikipedia?: string;
  };
  media_links?: {
    videos?: string[];
    news_articles?: string[];
  } | null;
  affiliations?: string[];
  credentials?: string[];
  expert_remedies?: { count: number }[];
}

export interface ExpertFormData extends Omit<Expert, 'id' | 'expert_remedies'> {
  id?: string;
}

export interface ExpertSuggestion {
  id: string;
  name: string;
  email?: string;
  expertise?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  social_links?: {
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    wikipedia?: string;
  };
  created_at?: string;
  updated_at?: string;
}
