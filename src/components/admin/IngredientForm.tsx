
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploadSection from "./ingredients/form/ImageUploadSection";
import DescriptionSection from "./ingredients/form/DescriptionSection";

interface IngredientFormProps {
  onClose: () => void;
  ingredient?: any;
  onSave?: () => void;
}

const IngredientForm = ({ onClose, ingredient, onSave }: IngredientFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    brief_description: "",
    full_description: "",
    image_url: "",
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || "",
        brief_description: ingredient.brief_description || "",
        full_description: ingredient.full_description || "",
        image_url: ingredient.image_url || "",
      });
    }
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (ingredient) {
        const { error } = await supabase
          .from("ingredients")
          .update({
            name: formData.name,
            brief_description: formData.brief_description,
            full_description: formData.full_description,
            image_url: formData.image_url,
          })
          .eq("id", ingredient.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ingredient updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("ingredients")
          .insert([{
            name: formData.name,
            brief_description: formData.brief_description,
            full_description: formData.full_description,
            image_url: formData.image_url,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ingredient created successfully",
        });
      }

      onSave?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save ingredient",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? "Edit Ingredient" : "Create New Ingredient"}
          </DialogTitle>
          <DialogDescription>
            {ingredient 
              ? "Update the details of this ingredient" 
              : "Fill in the details to create a new ingredient"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <DescriptionSection
            briefDescription={formData.brief_description}
            fullDescription={formData.full_description}
            onBriefDescriptionChange={(value) =>
              setFormData({ ...formData, brief_description: value })
            }
            onFullDescriptionChange={(value) =>
              setFormData({ ...formData, full_description: value })
            }
          />

          <ImageUploadSection
            imageUrl={formData.image_url}
            onImageChange={(url) =>
              setFormData({ ...formData, image_url: url })
            }
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">
              {ingredient ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientForm;
