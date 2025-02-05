import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Linkedin, Twitter, Instagram, Globe } from "lucide-react";
import { ExpertRemediesSection } from "@/components/experts/ExpertRemediesSection";
import { ExpertMediaSection } from "@/components/experts/ExpertMediaSection";
import { RelatedExpertsSection } from "@/components/experts/RelatedExpertsSection";

const ExpertProfile = () => {
  const { id } = useParams();

  const { data: expert, isLoading } = useQuery({
    queryKey: ["expert", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select(`
          *,
          expert_remedies(
            remedies(
              id,
              name,
              summary,
              image_url
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

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
              <p className="text-primary font-medium mb-6">{expert.field_of_expertise}</p>
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

      {/* Media & Interviews Section */}
      <ExpertMediaSection mediaLinks={expert.media_links} />

      {/* Related Experts Section */}
      <RelatedExpertsSection
        currentExpertId={expert.id}
        fieldOfExpertise={expert.field_of_expertise}
      />
    </div>
  );
};

export default ExpertProfile;