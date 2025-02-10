
import { Json } from "@/integrations/supabase/types";

export interface Expert {
  id: string;
  full_name: string;
  title: string;
  bio?: string;
  image_url: string | null;
  field_of_expertise?: string;
  social_media?: Json;
  media_links?: Json;
  affiliations?: string[];
  credentials?: string[];
  created_at?: string;
  updated_at?: string;
  expert_remedies?: { count: number }[];
}

export interface ExpertFormData {
  imageUrl: string;
  fullName: string;
  title: string;
  bio: string;
  fieldOfExpertise: string;
  affiliations: string[];
  socialMedia: {
    youtube: string;
    linkedin: string;
    twitter: string;
    instagram: string;
    website: string;
    wikipedia: string;
  };
}
