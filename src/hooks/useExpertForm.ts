
import { useState, useEffect } from "react";
import { Json } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Expert, ExpertFormData } from "@/types/expert";

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
  console.log("Converting social media data:", data); // Debug log
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return defaultSocialMedia;
  }

  const socialMedia = data as Record<string, unknown>;
  return {
    youtube: typeof socialMedia.youtube === 'string' ? socialMedia.youtube : '',
    linkedin: typeof socialMedia.linkedin === 'string' ? socialMedia.linkedin : '',
    twitter: typeof socialMedia.twitter === 'string' ? socialMedia.twitter : '',
    instagram: typeof socialMedia.instagram === 'string' ? socialMedia.instagram : '',
    website: typeof socialMedia.website === 'string' ? socialMedia.website : '',
    wikipedia: typeof socialMedia.wikipedia === 'string' ? socialMedia.wikipedia : '',
  };
};

export const useExpertForm = (expertId?: string, initialData?: Partial<ExpertFormData>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ExpertFormData>({
    imageUrl: initialData?.imageUrl || "",
    fullName: initialData?.fullName || "",
    title: initialData?.title || "",
    bio: initialData?.bio || "",
    fieldOfExpertise: initialData?.fieldOfExpertise || "",
    affiliations: initialData?.affiliations || [],
    socialMedia: initialData?.socialMedia || defaultSocialMedia,
  });

  console.log("Expert ID:", expertId); // Debug log

  const {
    data: expertData,
    isLoading: isFetching,
    error: fetchError,
  } = useQuery({
    queryKey: ["expert", expertId],
    queryFn: async () => {
      if (!expertId || expertId === "new") return null;

      console.log("Fetching expert data for ID:", expertId); // Debug log
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

      console.log("Raw expert data from Supabase:", data); // Debug log
      return data as Expert;
    },
    enabled: !!expertId && expertId !== "new",
  });

  useEffect(() => {
    if (expertData) {
      console.log("Setting form data from expert:", expertData); // Debug log
      const newFormData = {
        imageUrl: expertData.image_url || "",
        fullName: expertData.full_name || "",
        title: expertData.title || "",
        bio: expertData.bio || "",
        fieldOfExpertise: expertData.field_of_expertise || "",
        affiliations: expertData.affiliations || [],
        socialMedia: convertToSocialMediaLinks(expertData.social_media),
      };
      console.log("New form data being set:", newFormData); // Debug log
      setFormData(newFormData);
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

  const handleChange = <K extends keyof ExpertFormData>(
    field: K,
    value: ExpertFormData[K]
  ) => {
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
