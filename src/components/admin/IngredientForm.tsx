
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";

interface IngredientFormProps {
  onClose: () => void;
  ingredient?: any;
  onSave?: () => void;
}

const IngredientForm = ({ onClose, ingredient, onSave }: IngredientFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    brief_description: "",
    full_description: "",
    precautions: "",
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || "",
        brief_description: ingredient.brief_description || "",
        full_description: ingredient.full_description || "",
        precautions: ingredient.summary || "", // Map summary to precautions
      });
      if (ingredient.image_url) {
        setImagePreview(ingredient.image_url);
      }
    }
  }, [ingredient]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Ingredient name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.brief_description.trim()) {
      toast({
        title: "Error",
        description: "Brief description is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = ingredient?.image_url || "";

      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("remedy-images")
          .upload(`ingredients/${fileName}`, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("remedy-images")
          .getPublicUrl(`ingredients/${fileName}`);

        imageUrl = publicUrl;

        // Remove old image if it exists
        if (ingredient?.image_url) {
          const oldImagePath = ingredient.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("remedy-images")
              .remove([`ingredients/${oldImagePath}`]);
          }
        }
      }

      const ingredientData = {
        name: formData.name.trim(),
        brief_description: formData.brief_description.trim(),
        full_description: formData.full_description.trim() || null,
        summary: formData.precautions.trim() || null, // Map precautions to summary field
        image_url: imageUrl || null,
      };

      if (ingredient) {
        const { error } = await supabase
          .from("ingredients")
          .update(ingredientData)
          .eq("id", ingredient.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ingredient updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("ingredients")
          .insert([ingredientData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ingredient created successfully",
        });
      }

      onSave?.();
      onClose();
    } catch (error: any) {
      console.error("Error saving ingredient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ingredient",
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
            {ingredient ? "Edit Ingredient" : "Create New Ingredient"}
          </DialogTitle>
          <DialogDescription>
            {ingredient 
              ? "Update the details of this ingredient" 
              : "Fill in the details to create a new ingredient"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter ingredient name"
              required
              className="bg-background touch-manipulation"
            />
          </div>

          {/* Brief Description Field */}
          <div>
            <Label htmlFor="brief_description">Brief Description *</Label>
            <Input
              id="brief_description"
              value={formData.brief_description}
              onChange={(e) =>
                setFormData({ ...formData, brief_description: e.target.value })
              }
              placeholder="Short description of the ingredient"
              required
              className="bg-background touch-manipulation"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <Label>Image</Label>
            <div className="mt-2 space-y-4">
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Ingredient preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 touch-manipulation"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div>
                <Label
                  htmlFor="image"
                  className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary touch-manipulation"
                >
                  <input
                    type="file"
                    id="image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="text-center">
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Click to upload image</span>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Full Description Field */}
          <div>
            <Label htmlFor="full_description">Full Description</Label>
            <Textarea
              id="full_description"
              value={formData.full_description}
              onChange={(e) =>
                setFormData({ ...formData, full_description: e.target.value })
              }
              placeholder="Detailed description of the ingredient and its properties"
              rows={4}
              className="bg-background touch-manipulation"
            />
          </div>

          {/* Precautions Field */}
          <div>
            <Label htmlFor="precautions">Precautions</Label>
            <Textarea
              id="precautions"
              value={formData.precautions}
              onChange={(e) =>
                setFormData({ ...formData, precautions: e.target.value })
              }
              placeholder="Safety information, contraindications, and precautions"
              rows={3}
              className="bg-background touch-manipulation"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              type="button"
              disabled={isSubmitting}
              className="touch-manipulation"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="touch-manipulation"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ingredient ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientForm;
