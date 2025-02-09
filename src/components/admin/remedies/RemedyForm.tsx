
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { RemedyBasicInfoSection } from "./form/RemedyBasicInfoSection";
import { RemedySymptomSection } from "./form/RemedySymptomSection";
import { RemedyStatusSection } from "./form/RemedyStatusSection";
import { RemedyImageInput } from "./form/RemedyImageInput";

type SymptomType = Database['public']['Enums']['symptom_type'];

interface RemedyFormProps {
  onClose: () => void;
  remedy?: any;
}

const RemedyForm = ({ onClose, remedy }: RemedyFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    symptoms: [] as SymptomType[],
    ingredients: [] as string[],
    video_url: "",
    status: "draft" as "draft" | "published",
  });

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ingredients").select("*");
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
        symptoms: remedy.symptoms || [],
        ingredients: remedy.ingredients || [],
        video_url: remedy.video_url || "",
        status: remedy.status || "draft",
      });
      if (remedy.image_url) {
        setImagePreview(remedy.image_url);
      }
    }
  }, [remedy]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (remedy?.image_url) {
        const oldImagePath = remedy.image_url.split("/").pop();
        if (oldImagePath) {
          const { error: storageError } = await supabase.storage
            .from("remedy-images")
            .remove([oldImagePath]);
          
          if (storageError) {
            throw storageError;
          }
        }
      }
      
      if (remedy) {
        const { error: updateError } = await supabase
          .from("remedies")
          .update({ image_url: null })
          .eq("id", remedy.id);

        if (updateError) {
          throw updateError;
        }

        queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      }

      setImageFile(null);
      setImagePreview("");
      
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = remedy?.image_url || "";

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("remedy-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("remedy-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;

        if (remedy?.image_url) {
          const oldImagePath = remedy.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("remedy-images")
              .remove([oldImagePath]);
          }
        }
      }

      const remedyData = {
        ...formData,
        image_url: imageUrl,
      };

      if (remedy?.id) {
        const { error } = await supabase
          .from("remedies")
          .update(remedyData)
          .eq("id", remedy.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Remedy updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("remedies")
          .insert([remedyData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Remedy created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      onClose();
    } catch (error) {
      console.error("Error saving remedy:", error);
      toast({
        title: "Error",
        description: "Failed to save remedy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {remedy ? "Edit Remedy" : "Create New Remedy"}
          </DialogTitle>
          <DialogDescription>
            {remedy 
              ? "Update the details of this remedy" 
              : "Fill in the details to create a new remedy"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RemedyImageInput
            imageFile={imageFile}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
          />

          <RemedyBasicInfoSection
            name={formData.name}
            summary={formData.summary}
            description={formData.description}
            video_url={formData.video_url}
            onNameChange={(name) => setFormData({ ...formData, name })}
            onSummaryChange={(summary) => setFormData({ ...formData, summary })}
            onDescriptionChange={(description) => setFormData({ ...formData, description })}
            onVideoUrlChange={(video_url) => setFormData({ ...formData, video_url })}
          />

          <RemedySymptomSection
            symptoms={formData.symptoms}
            onSymptomsChange={(symptoms) => setFormData({ ...formData, symptoms })}
          />

          <div>
            <Label>Ingredients</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {ingredient}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      ingredients: formData.ingredients.filter((_, i) => i !== index)
                    })}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <RemedyStatusSection
            status={formData.status}
            onStatusChange={(status) => setFormData({ ...formData, status })}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {remedy ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RemedyForm;
