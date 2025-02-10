
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import TextEditor from "@/components/ui/text-editor";
import { ImageManagementSection } from "@/components/admin/news/ImageManagementSection";
import { ExpertsSection } from "@/components/admin/news/ExpertsSection";
import { VideoLinksSection } from "@/components/admin/news/VideoLinksSection";
import { RelatedIngredientsSection } from "@/components/admin/symptoms/RelatedIngredientsSection";

const EditSymptom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewSymptom = id === "new";

  const form = useForm({
    defaultValues: {
      symptom: "",
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

  const { data: symptom } = useQuery({
    queryKey: ["symptom", id],
    queryFn: async () => {
      if (isNewSymptom) return null;
      
      const { data, error } = await supabase
        .from("symptom_details")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewSymptom,
    meta: {
      onSuccess: (data: any) => {
        if (data) {
          const capitalizedSymptom = data.symptom.charAt(0).toUpperCase() + data.symptom.slice(1);
          form.reset({
            ...data,
            symptom: capitalizedSymptom,
            video_links: data.video_links || [],
            related_experts: data.related_experts || [],
            related_ingredients: data.related_ingredients || [],
          });
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
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async (values: any) => {
    try {
      // Ensure symptom name starts with capital letter
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

      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="symptom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptom Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="max-w-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brief_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Description</FormLabel>
                      <FormControl>
                        <Input {...field} className="max-w-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <TextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ImageManagementSection
              thumbnailUrl={form.watch("image_url") || ""}
              setThumbnailUrl={(url) => form.setValue("image_url", url)}
              thumbnailDescription={form.watch("thumbnail_description") || ""}
              setThumbnailDescription={(desc) => form.setValue("thumbnail_description", desc)}
              mainImageUrl=""
              setMainImageUrl={() => {}}
              mainImageDescription=""
              setMainImageDescription={() => {}}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ExpertsSection
              experts={experts}
              selectedExperts={form.watch("related_experts") || []}
              setSelectedExperts={(experts) => form.setValue("related_experts", experts)}
              onExpertAdded={() => {}}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <RelatedIngredientsSection
              selectedIngredients={form.watch("related_ingredients") || []}
              setSelectedIngredients={(ingredients) => form.setValue("related_ingredients", ingredients)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <VideoLinksSection
              videoLinks={form.watch("video_links") || []}
              setVideoLinks={(links) => form.setValue("video_links", links)}
              videoDescription={form.watch("video_description") || ""}
              setVideoDescription={(desc) => form.setValue("video_description", desc)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditSymptom;
