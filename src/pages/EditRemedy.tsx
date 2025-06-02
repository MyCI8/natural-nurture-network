
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RemedyDetailsSection } from "@/components/admin/remedies/RemedyDetailsSection";
import { RemedyContentSection } from "@/components/admin/remedies/RemedyContentSection";
import { RemedyIngredientsSection } from "@/components/admin/remedies/form/RemedyIngredientsSection";
import { RemedyExpertsSection } from "@/components/admin/remedies/RemedyExpertsSection";
import { MultipleImageUpload } from "@/components/remedies/shared/MultipleImageUpload";
import { SmartLinkInput } from "@/components/remedies/shared/SmartLinkInput";

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
  
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [videoDescription, setVideoDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

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
      setName(remedy.name || "");
      setSummary(remedy.summary || "");
      setContent(remedy.description || "");
      setIngredients(remedy.ingredients || []);
      setSelectedExperts(remedy.expert_recommendations || []);
      setVideoDescription(remedy.video_description || "");
      setStatus(remedy.status as "draft" | "published" || "draft");
      
      // Load existing images
      if (remedy.images && Array.isArray(remedy.images)) {
        setImages(remedy.images);
      } else if (remedy.image_url) {
        setImages([{ url: remedy.image_url }]);
      }
      
      // Load existing links
      if (remedy.links && Array.isArray(remedy.links)) {
        setLinks(remedy.links);
      }
    }
  }, [remedy]);

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
        name,
        summary,
        description: content,
        image_url: uploadedImages[0]?.url || "", // Keep first image as main for compatibility
        images: uploadedImages,
        links: links,
        ingredients,
        expert_recommendations: selectedExperts,
        video_description: videoDescription,
        status: shouldPublish ? "published" as const : status,
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

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <RemedyDetailsSection
              name={name}
              setName={setName}
              summary={summary}
              setSummary={setSummary}
            />

            <RemedyContentSection 
              content={content}
              onChange={setContent}
            />

            <RemedyIngredientsSection
              ingredients={ingredients}
              setIngredients={setIngredients}
            />
          </div>

          <div className="space-y-6">
            <MultipleImageUpload
              images={images}
              onImagesChange={setImages}
            />

            <SmartLinkInput
              links={links}
              onLinksChange={setLinks}
            />

            <RemedyExpertsSection
              selectedExperts={selectedExperts}
              setSelectedExperts={setSelectedExperts}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleSave(false)}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave(true)}>
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
