
import { useState, useEffect } from "react";
import { Json } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SocialMediaLinks {
  youtube: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  website: string;
  wikipedia: string;
}

const defaultSocialMedia: SocialMediaLinks = {
  youtube: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  website: "",
  wikipedia: "",
};

const convertToSocialMediaLinks = (data: Json | null): SocialMediaLinks => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return defaultSocialMedia;
  }

  return {
    youtube: typeof data.youtube === 'string' ? data.youtube : '',
    linkedin: typeof data.linkedin === 'string' ? data.linkedin : '',
    twitter: typeof data.twitter === 'string' ? data.twitter : '',
    instagram: typeof data.instagram === 'string' ? data.instagram : '',
    website: typeof data.website === 'string' ? data.website : '',
    wikipedia: typeof data.wikipedia === 'string' ? data.wikipedia : '',
  };
};

export const useExpertForm = (expertId?: string) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: "",
    fullName: "",
    title: "",
    bio: "",
    fieldOfExpertise: "",
    affiliations: [] as string[],
    socialMedia: defaultSocialMedia,
  });

  const { data: expertData, isLoading: isFetching } = useQuery({
    queryKey: ["expert", expertId],
    queryFn: async () => {
      if (!expertId || expertId === "new") return null;
      
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("id", expertId)
        .single();

      if (error) {
        console.error("Error fetching expert:", error);
        toast({
          title: "Error",
          description: "Failed to fetch expert data",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    enabled: !!expertId && expertId !== "new",
  });

  useEffect(() => {
    if (expertData) {
      console.log("Setting form data from expert data:", expertData);
      setFormData({
        imageUrl: expertData.image_url || "",
        fullName: expertData.full_name || "",
        title: expertData.title || "",
        bio: expertData.bio || "",
        fieldOfExpertise: expertData.field_of_expertise || "",
        affiliations: expertData.affiliations || [],
        socialMedia: convertToSocialMediaLinks(expertData.social_media),
      });
    }
  }, [expertData]);

  const handleSocialMediaChange = (platform: keyof SocialMediaLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCrawlerData = (data: any) => {
    setFormData(prev => ({
      ...prev,
      fullName: data.name || prev.fullName,
      bio: data.biography || prev.bio,
      imageUrl: data.image || prev.imageUrl,
      socialMedia: {
        ...prev.socialMedia,
        ...(data.socialLinks || {}),
      },
    }));
  };

  return {
    formData,
    isLoading: isLoading || isFetching,
    setIsLoading,
    handleChange,
    handleSocialMediaChange,
    handleCrawlerData,
  };
};
