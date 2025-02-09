
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TextEditor from "@/components/ui/text-editor";
import { ImageManagementSection } from "./ImageManagementSection";
import { ExpertDetailsSection } from "./ExpertDetailsSection";
import { ExpertCredentialsSection } from "./ExpertCredentialsSection";
import { ExpertCrawlerSection } from "./ExpertCrawlerSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

interface ExpertFormProps {
  expertId?: string;
  initialData?: {
    full_name?: string;
    image_url?: string;
    bio?: string;
    social_media?: {
      youtube?: string;
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      website?: string;
      wikipedia?: string;
    };
    website?: string;
  };
  onSuccess?: () => void;
}

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

// Helper function to validate and convert social media data
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

export const ExpertForm = ({ expertId, initialData, onSuccess }: ExpertFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state with initialData if available, otherwise use default values
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [fieldOfExpertise, setFieldOfExpertise] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>(
    initialData?.social_media ? convertToSocialMediaLinks(initialData.social_media as Json) : defaultSocialMedia
  );

  // Fetch expert data when expertId is available
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

  // Update state when expert data is fetched
  useEffect(() => {
    if (expertData) {
      setImageUrl(expertData.image_url || "");
      setFullName(expertData.full_name || "");
      setTitle(expertData.title || "");
      setBio(expertData.bio || "");
      setFieldOfExpertise(expertData.field_of_expertise || "");
      setAffiliations(expertData.affiliations || []);
      setSocialMedia(convertToSocialMediaLinks(expertData.social_media));
    }
  }, [expertData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const expertData = {
        full_name: fullName,
        title,
        bio,
        image_url: imageUrl,
        field_of_expertise: fieldOfExpertise,
        affiliations,
        social_media: socialMedia as unknown as Json,
      };

      const { error } = expertId && expertId !== "new"
        ? await supabase
            .from("experts")
            .update(expertData)
            .eq("id", expertId)
        : await supabase
            .from("experts")
            .insert([expertData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Expert saved successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin/manage-experts");
      }
    } catch (error) {
      console.error("Error saving expert:", error);
      toast({
        title: "Error",
        description: "Failed to save expert",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrawlerData = (data: any) => {
    if (data.name) setFullName(data.name);
    if (data.biography) setBio(data.biography);
    if (data.image) setImageUrl(data.image);
    if (data.socialLinks) {
      setSocialMedia(prev => ({
        ...prev,
        ...data.socialLinks
      }));
    }
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <ImageManagementSection
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
          />
          
          <ExpertDetailsSection
            fullName={fullName}
            setFullName={setFullName}
            title={title}
            setTitle={setTitle}
            bio={bio}
            setBio={setBio}
          />

          <div className="space-y-4">
            <Label htmlFor="fieldOfExpertise">Field of Expertise</Label>
            <Input
              id="fieldOfExpertise"
              value={fieldOfExpertise}
              onChange={(e) => setFieldOfExpertise(e.target.value)}
              placeholder="e.g. Herbal Medicine, Nutrition"
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-8">
          <ExpertCrawlerSection onDataSelect={handleCrawlerData} />
          
          <ExpertCredentialsSection />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Media Links</h3>
            {Object.entries(socialMedia).map(([platform, url]) => (
              <div key={platform}>
                <Label htmlFor={platform} className="capitalize">
                  {platform}
                </Label>
                <Input
                  id={platform}
                  value={url}
                  onChange={(e) =>
                    setSocialMedia((prev) => ({
                      ...prev,
                      [platform]: e.target.value,
                    }))
                  }
                  placeholder={`${platform} URL`}
                  className="bg-background"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/manage-experts")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {expertId && expertId !== "new" ? "Update Expert" : "Create Expert"}
        </Button>
      </div>
    </form>
  );
};
