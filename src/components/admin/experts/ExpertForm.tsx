import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const ExpertForm = ({ expertId, initialData, onSuccess }: ExpertFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [fieldOfExpertise, setFieldOfExpertise] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>(
    initialData?.social_media ? 
      { ...defaultSocialMedia, ...initialData.social_media } : 
      defaultSocialMedia
  );

  useQuery({
    queryKey: ["expert", expertId],
    queryFn: async () => {
      if (!expertId || expertId === "new") return null;
      
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("id", expertId)
        .single();

      if (error) throw error;

      setImageUrl(data.image_url || "");
      setFullName(data.full_name || "");
      setTitle(data.title || "");
      setBio(data.bio || "");
      setFieldOfExpertise(data.field_of_expertise || "");
      setAffiliations(data.affiliations || []);
      
      const socialMediaData = data.social_media as Json;
      if (socialMediaData && typeof socialMediaData === 'object') {
        setSocialMedia({
          youtube: (socialMediaData as any).youtube || "",
          linkedin: (socialMediaData as any).linkedin || "",
          twitter: (socialMediaData as any).twitter || "",
          instagram: (socialMediaData as any).instagram || "",
          website: (socialMediaData as any).website || "",
          wikipedia: (socialMediaData as any).wikipedia || "",
        });
      }

      return data;
    },
    enabled: !!expertId && expertId !== "new",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expertData = {
      full_name: fullName,
      title,
      bio,
      image_url: imageUrl,
      field_of_expertise: fieldOfExpertise,
      affiliations,
      social_media: socialMedia as unknown as Json,
    };

    const { error } = expertId
      ? await supabase
          .from("experts")
          .update(expertData)
          .eq("id", expertId)
      : await supabase
          .from("experts")
          .insert([expertData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save expert",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expert saved successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin/manage-experts");
      }
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
        <Button type="submit">
          {expertId ? "Update Expert" : "Create Expert"}
        </Button>
      </div>
    </form>
  );
};
