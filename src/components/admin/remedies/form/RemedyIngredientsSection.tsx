
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";

interface RemedyIngredientsSectionProps {
  ingredients: string[];
  setIngredients?: (ingredients: string[]) => void;
  onIngredientsChange?: (ingredients: string[]) => void;
  availableIngredients?: any[];
}

export const RemedyIngredientsSection = ({
  ingredients,
  setIngredients,
  onIngredientsChange,
}: RemedyIngredientsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    brief_description: "",
    image_url: "",
    description: "",
    precautions: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch existing ingredients
  const { data: existingIngredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleAddExistingIngredient = (ingredientName: string) => {
    if (ingredientName && !ingredients.includes(ingredientName)) {
      const updatedIngredients = [...ingredients, ingredientName];
      
      if (setIngredients) {
        setIngredients(updatedIngredients);
      }
      if (onIngredientsChange) {
        onIngredientsChange(updatedIngredients);
      }
      
      setSelectedIngredient("");
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting image upload to ingredient-images bucket...');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `ingredient-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to ingredient-images bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('ingredient-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return null;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ingredient-images')
        .getPublicUrl(fileName);
      
      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const handleCreateNewIngredient = async () => {
    if (newIngredient.name.trim() && newIngredient.brief_description.trim()) {
      const ingredientName = newIngredient.name.trim();
      
      // Add to current ingredients list first
      const updatedIngredients = [...ingredients, ingredientName];
      
      if (setIngredients) {
        setIngredients(updatedIngredients);
      }
      if (onIngredientsChange) {
        onIngredientsChange(updatedIngredients);
      }
      
      // Handle image upload if there's a file
      let finalImageUrl = newIngredient.image_url;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }
      
      // Save to ingredients table with full details
      try {
        const { error } = await supabase
          .from("ingredients")
          .insert([{ 
            name: ingredientName,
            brief_description: newIngredient.brief_description.trim(),
            image_url: finalImageUrl || null,
            description: newIngredient.description.trim() || null,
            precautions: newIngredient.precautions.trim() || null,
          }]);

        if (error) {
          console.error("Error adding ingredient:", error);
          if (!error.message.includes('duplicate')) {
            toast.error("Failed to save ingredient to database");
          }
        } else {
          toast.success(`Ingredient "${ingredientName}" created and added successfully!`);
        }
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }

      setNewIngredient({
        name: "",
        brief_description: "",
        image_url: "",
        description: "",
        precautions: "",
      });
      setImageFile(null);
      setIsDialogOpen(false);
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    
    if (setIngredients) {
      setIngredients(updatedIngredients);
    }
    if (onIngredientsChange) {
      onIngredientsChange(updatedIngredients);
    }
  };

  // Filter out already added ingredients
  const availableToAdd = existingIngredients.filter(
    ing => !ingredients.includes(ing.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ingredients</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background touch-manipulation active-scale"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Ingredient</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the details to create a new ingredient
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ingredient-name">Name *</Label>
                <Input
                  id="ingredient-name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="bg-background"
                  placeholder="Enter ingredient name"
                />
              </div>
              
              <div>
                <Label htmlFor="brief-description">Brief Description *</Label>
                <Textarea
                  id="brief-description"
                  value={newIngredient.brief_description}
                  onChange={(e) => setNewIngredient({ ...newIngredient, brief_description: e.target.value })}
                  className="bg-background"
                  placeholder="Enter brief description"
                  rows={2}
                />
              </div>

              <div>
                <Label>Image</Label>
                <EnhancedImageUpload
                  value={newIngredient.image_url}
                  onChange={(url) => setNewIngredient({ ...newIngredient, image_url: url })}
                  onFileSelect={(file) => setImageFile(file)}
                  aspectRatio={1}
                  maxSize={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="full-description">Full Description</Label>
                <Textarea
                  id="full-description"
                  value={newIngredient.description}
                  onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                  className="bg-background"
                  placeholder="Enter full description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="precautions">Precautions</Label>
                <Textarea
                  id="precautions"
                  value={newIngredient.precautions}
                  onChange={(e) => setNewIngredient({ ...newIngredient, precautions: e.target.value })}
                  className="bg-background"
                  placeholder="Enter precautions (optional)"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 touch-manipulation"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateNewIngredient}
                  className="flex-1 touch-manipulation active-scale"
                  disabled={!newIngredient.name.trim() || !newIngredient.brief_description.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dropdown to select existing ingredients */}
      {availableToAdd.length > 0 && (
        <div>
          <Label>Add Existing Ingredient</Label>
          <Select value={selectedIngredient} onValueChange={handleAddExistingIngredient}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select an ingredient..." />
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.map((ingredient) => (
                <SelectItem key={ingredient.id} value={ingredient.name}>
                  {ingredient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected ingredients as badges */}
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1.5 touch-manipulation"
          >
            {ingredient}
            <X
              className="h-3 w-3 cursor-pointer ml-1"
              onClick={() => removeIngredient(index)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
