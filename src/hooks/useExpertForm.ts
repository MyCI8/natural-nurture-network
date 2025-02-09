
import { useState, useEffect } from "react";
import { Json } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Expert } from "@/types/expert";

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

  const {
    data: expertData,
    isLoading: isFetching,
    error: fetchError,
  } = useQuery({
    queryKey: ["expert", expertId],
    queryFn: async () => {
      if (!expertId || expertId === "new") return null;

      console.log("Fetching expert data for ID:", expertId);
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("id", expertId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching expert:", error);
        toast({
          title: "Error",
          description: "Failed to fetch expert data",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        console.log("No expert found with ID:", expertId);
        toast({
          title: "Not Found",
          description: "Expert not found",
          variant: "destructive",
        });
        return null;
      }

      // Convert the Supabase data to match our Expert type
      const expertData: Expert = {
        id: data.id,
        full_name: data.full_name,
        title: data.title,
        bio: data.bio || "",
        image_url: data.image_url || "",
        field_of_expertise: data.field_of_expertise || "",
        social_media: data.social_media as Expert['social_media'],
        media_links: data.media_links as Expert['media_links'],
        affiliations: data.affiliations || [],
        credentials: data.credentials || [],
      };

      console.log("Received expert data:", expertData);
      return expertData;
    },
    enabled: !!expertId && expertId !== "new",
    retry: false,
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
        socialMedia: convertToSocialMediaLinks(expertData.social_media as Json),
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
    fetchError,
    setIsLoading,
    handleChange,
    handleSocialMediaChange,
    handleCrawlerData,
  };
};
