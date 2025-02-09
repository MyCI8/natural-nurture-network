
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageManagementSection } from "./ImageManagementSection";
import { ExpertDetailsSection } from "./ExpertDetailsSection";
import { ExpertCredentialsSection } from "./ExpertCredentialsSection";
import { ExpertCrawlerSection } from "./ExpertCrawlerSection";
import { SocialMediaSection } from "./SocialMediaSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useExpertForm } from "@/hooks/useExpertForm";
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

export const ExpertForm = ({ expertId, onSuccess }: ExpertFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    formData,
    isLoading,
    setIsLoading,
    handleChange,
    handleSocialMediaChange,
    handleCrawlerData,
  } = useExpertForm(expertId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const expertData = {
        full_name: formData.fullName,
        title: formData.title,
        bio: formData.bio,
        image_url: formData.imageUrl,
        field_of_expertise: formData.fieldOfExpertise,
        affiliations: formData.affiliations,
        social_media: formData.socialMedia as unknown as Json,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <ImageManagementSection
            imageUrl={formData.imageUrl}
            setImageUrl={(url) => handleChange("imageUrl", url)}
          />
          
          <ExpertDetailsSection
            fullName={formData.fullName}
            setFullName={(value) => handleChange("fullName", value)}
            title={formData.title}
            setTitle={(value) => handleChange("title", value)}
            bio={formData.bio}
            setBio={(value) => handleChange("bio", value)}
          />

          <div className="space-y-4">
            <Label htmlFor="fieldOfExpertise">Field of Expertise</Label>
            <Input
              id="fieldOfExpertise"
              value={formData.fieldOfExpertise}
              onChange={(e) => handleChange("fieldOfExpertise", e.target.value)}
              placeholder="e.g. Herbal Medicine, Nutrition"
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-8">
          <ExpertCrawlerSection onDataSelect={handleCrawlerData} />
          
          <ExpertCredentialsSection />

          <SocialMediaSection
            socialMedia={formData.socialMedia}
            onSocialMediaChange={handleSocialMediaChange}
          />
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
