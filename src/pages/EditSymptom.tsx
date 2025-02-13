
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { SymptomFormLayout } from "@/components/admin/symptoms/form/SymptomFormLayout";

const DEFAULT_COUGH_DESCRIPTION = "A cough is a reflex action that helps clear the throat and airways of mucus, irritants, or infections. It can be acute, lasting a few weeks, or chronic if it persists for longer.";

const EditSymptom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewSymptom = id === "new";

  const form = useForm({
    defaultValues: {
      symptom: "Cough", // Set a valid default enum value
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

      // If no data found, throw an error
      if (!data) {
        toast.error("Symptom not found");
        throw new Error("Symptom not found");
      }

      // Validate that symptom is not empty
      if (!data.symptom) {
        toast.error("Invalid symptom data");
        throw new Error("Invalid symptom data");
      }

      return data;
    },
    enabled: !isNewSymptom,
    meta: {
      onSuccess: (data: any) => {
        if (data) {
          console.log("Setting form data:", data);
          // Ensure symptom is a valid string before capitalizing
          const capitalizedSymptom = data.symptom ? 
            data.symptom.charAt(0).toUpperCase() + data.symptom.slice(1) :
            "Cough"; // Fallback to a valid enum value

          const formData = {
            ...data,
            symptom: capitalizedSymptom,
            description: data.description || '',
            brief_description: data.symptom?.toLowerCase() === 'cough' 
              ? DEFAULT_COUGH_DESCRIPTION 
              : (data.brief_description || ''),
            video_description: data.video_description || '',
            thumbnail_description: data.thumbnail_description || '',
            video_links: data.video_links || [],
            related_experts: data.related_experts || [],
            related_ingredients: data.related_ingredients || [],
          };
          console.log("Formatted form data:", formData);
          form.reset(formData);
        }
      }
    }
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

  const handleSave = async (values: any) => {
    try {
      // Ensure the symptom value is valid before saving
      if (!values.symptom) {
        toast.error("Symptom name is required");
        return;
      }

      values.symptom = values.symptom.charAt(0).toUpperCase() + values.symptom.slice(1);

      if (isNewSymptom) {
        const { error } = await supabase
          .from("symptom_details")
          .insert([values]);

        if (error) throw error;
        toast.success("Symptom created successfully");
      } else {
        const { error } = await supabase
          .from("symptom_details")
          .update(values)
          .eq("id", id);

        if (error) throw error;
        toast.success("Symptom updated successfully");
      }

      navigate("/admin/symptoms");
    } catch (error) {
      console.error("Error saving symptom:", error);
      toast.error("Failed to save symptom");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
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
