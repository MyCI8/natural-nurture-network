
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Linkedin, Twitter, Instagram, Globe } from "lucide-react";
import { ExpertRemediesSection } from "@/components/experts/ExpertRemediesSection";
import { ExpertNewsSection } from "@/components/experts/ExpertNewsSection";
import { ExpertMediaSection } from "@/components/experts/ExpertMediaSection";
import { RelatedExpertsSection } from "@/components/experts/RelatedExpertsSection";
import { useExpertStats } from "@/hooks/useExpertStats";
import { Json } from "@/integrations/supabase/types";

interface SocialMedia {
  youtube?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  website?: string | null;
}

interface MediaLinks {
  podcasts: string[];
  news_articles: string[];
  youtube_videos: string[];
  research_papers: string[];
}

interface Expert {
  id: string;
  full_name: string;
  title: string;
  bio: string | null;
  image_url: string | null;
  field_of_expertise: string | null;
  social_media: SocialMedia;
  affiliations: string[];
  media_links: MediaLinks;
}

const ExpertProfile = () => {
  const { id } = useParams();

  const { data: expert, isLoading } = useQuery({
    queryKey: ["expert", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Transform the response to match our Expert interface
      const expertData: Expert = {
        id: data.id,
        full_name: data.full_name,
        title: data.title,
        bio: data.bio,
        image_url: data.image_url,
        field_of_expertise: data.field_of_expertise,
        social_media: data.social_media as SocialMedia || {},
        affiliations: data.affiliations || [],
        media_links: {
          podcasts: ((data.media_links as any)?.podcasts || []) as string[],
          news_articles: ((data.media_links as any)?.news_articles || []) as string[],
          youtube_videos: ((data.media_links as any)?.youtube_videos || []) as string[],
          research_papers: ((data.media_links as any)?.research_papers || []) as string[],
        },
      };
      
      return expertData;
    },
  });

  const { data: stats } = useExpertStats(id || "");

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!expert) {
    return <div className="min-h-screen flex items-center justify-center">Expert not found</div>;
  }

  const socialMediaIcons = {
    youtube: { Icon: Youtube, url: expert.social_media?.youtube },
    linkedin: { Icon: Linkedin, url: expert.social_media?.linkedin },
    twitter: { Icon: Twitter, url: expert.social_media?.twitter },
    instagram: { Icon: Instagram, url: expert.social_media?.instagram },
    website: { Icon: Globe, url: expert.social_media?.website },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={expert.image_url || "/placeholder.svg"}
              alt={expert.full_name}
              className="w-48 h-48 rounded-full object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-4">{expert.full_name}</h1>
              <p className="text-lg text-text-light mb-4">{expert.title}</p>
              <p className="text-primary font-medium mb-2">{expert.field_of_expertise}</p>
              
              {/* Stats */}
              <div className="flex gap-6 justify-center md:justify-start mb-6">
                <div className="text-center">
                  <div className="font-semibold text-lg">{stats?.remediesCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Remedies</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{stats?.newsCount || 0}</div>
                  <div className="text-sm text-muted-foreground">News</div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center md:justify-start">
                {Object.entries(socialMediaIcons).map(([platform, { Icon, url }]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-light hover:text-primary transition-colors"
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Information Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">About {expert.full_name}</h2>
          <div className="prose max-w-none">
            <p className="mb-8">{expert.bio}</p>
            {expert.affiliations && expert.affiliations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Affiliations</h3>
                <ul className="list-disc pl-6">
                  {expert.affiliations.map((affiliation, index) => (
                    <li key={index}>{affiliation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recommended Remedies Section */}
      <ExpertRemediesSection expertId={expert.id} />

      {/* Related News Articles Section */}
      <ExpertNewsSection expertId={expert.id} />

      {/* Media & Interviews Section */}
      <ExpertMediaSection mediaLinks={expert.media_links} />

      {/* Related Experts Section */}
      <RelatedExpertsSection
        currentExpertId={expert.id}
        fieldOfExpertise={expert.field_of_expertise || ''}
      />
    </div>
  );
};

export default ExpertProfile;
