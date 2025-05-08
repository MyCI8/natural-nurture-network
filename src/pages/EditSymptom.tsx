
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { SymptomFormLayout } from "@/components/admin/symptoms/form/SymptomFormLayout";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database["public"]["Enums"]["symptom_type"];

interface SymptomFormValues {
  symptom: SymptomType;
  brief_description: string;
  description: string;
  image_url: string;
  thumbnail_description: string;
  video_description: string;
  related_experts: string[];
  related_ingredients: string[];
  video_links: { url: string; title: string }[];
}

const EditSymptom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewSymptom = id === "new";

  const form = useForm<SymptomFormValues>({
    defaultValues: {
      symptom: "Cough" as SymptomType, // Set a default valid symptom type
      brief_description: "",
      description: "",
      image_url: "",
      thumbnail_description: "",
      video_description: "",
      related_experts: [],
      related_ingredients: [],
      video_links: [],
    },
  });

  const { data: symptom, isLoading } = useQuery({
    queryKey: ["symptom", id],
    queryFn: async () => {
      if (isNewSymptom) return null;
      
      const { data, error } = await supabase
        .from("symptom_details")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        toast.error("Failed to load symptom details");
        throw error;
      }

      if (!data) {
        toast.error("Symptom not found");
        throw new Error("Symptom not found");
      }

      console.log("Fetched symptom data:", data);
      
      // Ensure arrays are properly handled and transformed
      const videoLinks = Array.isArray(data.video_links) 
        ? data.video_links.map((link: any) => ({
            url: typeof link === 'object' ? link.url || '' : '',
            title: typeof link === 'object' ? link.title || '' : ''
          }))
        : [];
      const relatedExperts = Array.isArray(data.related_experts) ? data.related_experts : [];
      const relatedIngredients = Array.isArray(data.related_ingredients) ? data.related_ingredients : [];

      // Set the form data
      form.reset({
        symptom: data.symptom,
        description: data.description || "",
        brief_description: data.brief_description || "",
        image_url: data.image_url || "",
        thumbnail_description: data.thumbnail_description || "",
        video_description: data.video_description || "",
        video_links: videoLinks,
        related_experts: relatedExperts,
        related_ingredients: relatedIngredients,
      });

      return data;
    },
    enabled: !isNewSymptom
  });

  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("id, full_name, title")
        .order("full_name");
      if (error) {
        toast.error("Failed to load experts");
        throw error;
      }
      return data;
    },
  });

  const handleSave = async (values: SymptomFormValues) => {
    try {
      console.log("Saving values:", values);

      if (!values.symptom) {
        toast.error("Symptom name is required");
        return;
      }

      // Clean up values before saving
      const dataToSave = {
        ...values,
        symptom: values.symptom.trim() as SymptomType, // Remove any extra spaces
        video_links: values.video_links || [],
        related_experts: values.related_experts || [],
        related_ingredients: values.related_ingredients || [],
      };

      if (isNewSymptom) {
        const { data, error } = await supabase
          .from("symptom_details")
          .insert([dataToSave])
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        toast.success("Symptom created successfully");
        navigate("/admin/symptoms");
      } else {
        const { error } = await supabase
          .from("symptom_details")
          .update(dataToSave)
          .eq("id", id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        toast.success("Symptom updated successfully");
        navigate("/admin/symptoms");
      }
    } catch (error) {
      console.error("Error saving symptom:", error);
      toast.error("Failed to save symptom");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 mt-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-12 h-12 touch-button touch-manipulation active-scale"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-accent/50 transition-all rounded-full w-12 h-12 touch-button touch-manipulation active-scale"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isNewSymptom ? "Add New Symptom" : "Edit Symptom"}
        </h1>
        <Button onClick={form.handleSubmit(handleSave)}>
          Save Changes
        </Button>
      </div>

      <SymptomFormLayout form={form} experts={experts} />
    </div>
  );
};

export default EditSymptom;
