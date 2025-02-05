import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageManagementSection } from "./ImageManagementSection";
import { ExpertDetailsSection } from "./ExpertDetailsSection";
import { ExpertCredentialsSection } from "./ExpertCredentialsSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

interface ExpertFormProps {
  expertId?: string;
}

interface SocialMediaLinks {
  youtube: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  website: string;
}

const defaultSocialMedia: SocialMediaLinks = {
  youtube: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  website: "",
};

export const ExpertForm = ({ expertId }: ExpertFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [fieldOfExpertise, setFieldOfExpertise] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>(defaultSocialMedia);

  useQuery({
    queryKey: ["expert", expertId],
    queryFn: async () => {
      if (!expertId) return null;
      
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
      
      // Handle social media data from Supabase
      const socialMediaData = data.social_media as Json;
      if (socialMediaData && typeof socialMediaData === 'object') {
        setSocialMedia({
          youtube: (socialMediaData as any).youtube || "",
          linkedin: (socialMediaData as any).linkedin || "",
          twitter: (socialMediaData as any).twitter || "",
          instagram: (socialMediaData as any).instagram || "",
          website: (socialMediaData as any).website || "",
        });
      }

      return data;
    },
    enabled: !!expertId,
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
      social_media: socialMedia as Json,
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
      navigate("/admin/manage-experts");
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