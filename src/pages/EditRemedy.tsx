
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedRemedyDetailsSection } from "@/components/remedies/shared/UnifiedRemedyDetailsSection";
import { UnifiedRemedyContentSection } from "@/components/remedies/shared/UnifiedRemedyContentSection";
import { RemedyIngredientsSection } from "@/components/admin/remedies/form/RemedyIngredientsSection";
import { RemedyExpertsSection } from "@/components/admin/remedies/RemedyExpertsSection";
import { RemedySymptomSection } from "@/components/admin/remedies/form/RemedySymptomSection";
import { RemedyStatusSection } from "@/components/admin/remedies/form/RemedyStatusSection";
import { MultipleImageUpload } from "@/components/remedies/shared/MultipleImageUpload";
import { SmartLinkInput } from "@/components/remedies/shared/SmartLinkInput";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

interface ImageData {
  file?: File;
  url: string;
  description?: string;
}

interface LinkData {
  url: string;
  title?: string;
  description?: string;
  type: 'link' | 'video';
}

const EditRemedy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    ingredients: [] as string[],
    symptoms: [] as SymptomType[],
    status: "draft" as "draft" | "published",
  });
  const [images, setImages] = useState<ImageData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  const { data: remedy, isLoading } = useQuery({
    queryKey: ["remedy", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (remedy) {
      setFormData({
        name: remedy.name || "",
        summary: remedy.summary || "",
        description: remedy.description || "",
        ingredients: remedy.ingredients || [],
        symptoms: remedy.symptoms || [],
        status: remedy.status as "draft" | "published" || "draft",
      });
      setSelectedExperts(remedy.expert_recommendations || []);
      
      // Load existing images
      const remedyImages = (remedy as any).images;
      if (remedyImages && Array.isArray(remedyImages)) {
        setImages(remedyImages);
      } else if (remedy.image_url) {
        setImages([{ url: remedy.image_url }]);
      }
      
      // Load existing links
      const remedyLinks = (remedy as any).links;
      if (remedyLinks && Array.isArray(remedyLinks)) {
        setLinks(remedyLinks);
      }
    }
  }, [remedy]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (shouldPublish = false) => {
    try {
      // Upload new images
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (!image.file) return image; // Already uploaded
          
          const fileExt = image.file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("remedy-images")
            .upload(fileName, image.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("remedy-images")
            .getPublicUrl(fileName);

          return { url: publicUrl, description: image.description };
        })
      );

      const remedyData = {
        name: formData.name,
        summary: formData.summary,
        description: formData.description,
        image_url: uploadedImages[0]?.url || "", // Keep first image as main for compatibility
        images: uploadedImages,
        links: links,
        ingredients: formData.ingredients,
        symptoms: formData.symptoms,
        expert_recommendations: selectedExperts,
        status: shouldPublish ? "published" as const : formData.status,
      };

      if (id && id !== "new") {
        const { error } = await supabase
          .from("remedies")
          .update(remedyData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("remedies")
          .insert([remedyData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Remedy saved successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["remedies"] });
      navigate("/admin/remedies");
    } catch (error) {
      console.error("Error saving remedy:", error);
      toast({
        title: "Error",
        description: "Failed to save remedy",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/remedies")}
          className="mb-6 flex items-center touch-manipulation active-scale touch-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Remedies
        </Button>

        <div className="grid gap-6 md:grid-cols-[2fr,1.5fr,1fr]">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            <UnifiedRemedyDetailsSection
              formData={formData}
              onChange={handleInputChange}
            />

            <UnifiedRemedyContentSection 
              formData={formData}
              onChange={handleInputChange}
            />

            <RemedyIngredientsSection
              ingredients={formData.ingredients}
              setIngredients={(ingredients) => handleInputChange('ingredients', ingredients)}
            />
          </div>

          {/* Middle Column - Images, Experts, Links */}
          <div className="space-y-6">
            <MultipleImageUpload
              images={images}
              onImagesChange={setImages}
            />

            <RemedyExpertsSection
              selectedExperts={selectedExperts}
              setSelectedExperts={setSelectedExperts}
            />

            <SmartLinkInput
              links={links}
              onLinksChange={setLinks}
            />
          </div>

          {/* Right Column - Admin Fields and Actions */}
          <div className="space-y-6">
            <RemedySymptomSection
              symptoms={formData.symptoms}
              onSymptomsChange={(symptoms) => handleInputChange('symptoms', symptoms)}
            />

            <RemedyStatusSection
              status={formData.status}
              onStatusChange={(status) => handleInputChange('status', status)}
            />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => handleSave(false)}
                className="w-full touch-manipulation"
              >
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                className="w-full touch-manipulation"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRemedy;
