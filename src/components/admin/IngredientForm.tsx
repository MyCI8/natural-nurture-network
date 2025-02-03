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
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TextEditor from "@/components/ui/text-editor";

interface IngredientFormProps {
  onClose: () => void;
  ingredient?: any;
  onSave?: () => void;
}

const IngredientForm = ({ onClose, ingredient, onSave }: IngredientFormProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || "",
        description: ingredient.description || "",
        image_url: ingredient.image_url || "",
      });
    }
  }, [ingredient]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('Hero')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Hero')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (ingredient) {
        const { error } = await supabase
          .from("ingredients")
          .update({
            name: formData.name,
            description: formData.description,
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
            description: formData.description,
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

          <div>
            <Label htmlFor="description">Description</Label>
            <TextEditor
              content={formData.description}
              onChange={(content) =>
                setFormData({ ...formData, description: content })
              }
            />
          </div>

          <div>
            <Label>Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {formData.image_url && (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Ingredient"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Label
                htmlFor="image"
                className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary"
              >
                <input
                  type="file"
                  id="image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <Plus className="h-6 w-6 text-gray-400" />
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {ingredient ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientForm;