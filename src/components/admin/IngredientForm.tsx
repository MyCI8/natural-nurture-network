
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
import { Loader2 } from "lucide-react";

interface IngredientFormProps {
  onClose: () => void;
  ingredient?: any;
  onSave?: () => void;
}

const IngredientForm = ({ onClose, ingredient, onSave }: IngredientFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brief_description: "",
    full_description: "",
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || "",
        brief_description: ingredient.brief_description || "",
        full_description: ingredient.full_description || "",
      });
    }
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Ingredient name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (ingredient) {
        const { error } = await supabase
          .from("ingredients")
          .update({
            name: formData.name.trim(),
            brief_description: formData.brief_description.trim() || null,
            full_description: formData.full_description.trim() || null,
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
            name: formData.name.trim(),
            brief_description: formData.brief_description.trim() || null,
            full_description: formData.full_description.trim() || null,
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
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter ingredient name"
              required
              className="bg-background"
            />
          </div>

          <div>
            <Label htmlFor="brief_description">Brief Description</Label>
            <Input
              id="brief_description"
              value={formData.brief_description}
              onChange={(e) =>
                setFormData({ ...formData, brief_description: e.target.value })
              }
              placeholder="Short description of the ingredient"
              className="bg-background"
            />
          </div>

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
              className="bg-background"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
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
