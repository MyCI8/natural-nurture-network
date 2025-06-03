
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedRemedyDetailsSection } from "@/components/remedies/shared/UnifiedRemedyDetailsSection";
import { UnifiedRemedyContentSection } from "@/components/remedies/shared/UnifiedRemedyContentSection";
import { RemedyHealthConcernsSection } from "@/components/admin/remedies/form/RemedyHealthConcernsSection";
import { RemedyStatusSection } from "@/components/admin/remedies/form/RemedyStatusSection";
import { RemedyIngredientsSection } from "@/components/admin/remedies/form/RemedyIngredientsSection";
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

interface RemedyFormProps {
  onClose: () => void;
  remedy?: any;
}

const RemedyForm = ({ onClose, remedy }: RemedyFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    preparation_method: "",
    dosage_instructions: "",
    precautions_side_effects: "",
    health_concerns: [] as string[],
    ingredients: [] as string[],
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
        preparation_method: remedy.preparation_method || "",
        dosage_instructions: remedy.dosage_instructions || "",
        precautions_side_effects: remedy.precautions_side_effects || "",
        health_concerns: remedy.symptoms || [], // Map old symptoms to health_concerns
        ingredients: remedy.ingredients || [],
        status: remedy.status || "draft",
      });
      
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        ...formData,
        symptoms: formData.health_concerns, // Map health_concerns back to symptoms for compatibility
        image_url: uploadedImages[0]?.url || "", // Keep first image as main for compatibility
        images: uploadedImages,
        links: links,
      };

      if (remedy?.id) {
        const { error } = await supabase
          .from("remedies")
          .update(remedyData as any)
          .eq("id", remedy.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Remedy updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("remedies")
          .insert([remedyData as any]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <UnifiedRemedyDetailsSection
                formData={formData}
                onChange={handleInputChange}
              />

              <UnifiedRemedyContentSection
                formData={formData}
                onChange={handleInputChange}
              />

              <RemedyHealthConcernsSection
                selectedConcerns={formData.health_concerns}
                onConcernsChange={(concerns) => handleInputChange('health_concerns', concerns)}
              />

              <RemedyIngredientsSection
                ingredients={formData.ingredients}
                availableIngredients={ingredients || []}
                onIngredientsChange={(ingredients) => handleInputChange('ingredients', ingredients)}
              />

              <RemedyStatusSection
                status={formData.status}
                onStatusChange={(status) => handleInputChange('status', status)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <MultipleImageUpload
                images={images}
                onImagesChange={setImages}
              />

              <SmartLinkInput
                links={links}
                onLinksChange={setLinks}
              />
            </div>
          </div>

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
