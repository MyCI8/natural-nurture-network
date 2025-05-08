
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RemedyDetailsSection } from "@/components/admin/remedies/RemedyDetailsSection";
import { RemedyContentSection } from "@/components/admin/remedies/RemedyContentSection";
import { RemedyImageSection } from "@/components/admin/remedies/RemedyImageSection";
import { RemedyIngredientsSection } from "@/components/admin/remedies/form/RemedyIngredientsSection";
import { RemedyExpertsSection } from "@/components/admin/remedies/RemedyExpertsSection";

const EditRemedy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailDescription, setThumbnailDescription] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageDescription, setMainImageDescription] = useState("");
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
      setThumbnailUrl(remedy.image_url || "");
      setThumbnailDescription(remedy.thumbnail_description || "");
      setMainImageUrl(remedy.main_image_url || "");
      setMainImageDescription(remedy.main_image_description || "");
      setIngredients(remedy.ingredients || []);
      setSelectedExperts(remedy.expert_recommendations || []);
      setVideoDescription(remedy.video_description || "");
      setStatus(remedy.status as "draft" | "published" || "draft");
    }
  }, [remedy]);

  const handleSave = async (shouldPublish = false) => {
    try {
      const remedyData = {
        name,
        summary,
        description: content,
        image_url: thumbnailUrl,
        thumbnail_description: thumbnailDescription,
        main_image_url: mainImageUrl,
        main_image_description: mainImageDescription,
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
            <RemedyImageSection
              thumbnailUrl={thumbnailUrl}
              setThumbnailUrl={setThumbnailUrl}
              thumbnailDescription={thumbnailDescription}
              setThumbnailDescription={setThumbnailDescription}
              mainImageUrl={mainImageUrl}
              setMainImageUrl={setMainImageUrl}
              mainImageDescription={mainImageDescription}
              setMainImageDescription={setMainImageDescription}
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
