
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [newIngredientName, setNewIngredientName] = useState("");

  const handleAddIngredient = async () => {
    if (newIngredientName.trim()) {
      const ingredientName = newIngredientName.trim();
      
      // Add to current ingredients list first
      const updatedIngredients = [...ingredients, ingredientName];
      
      // Call appropriate handlers
      if (setIngredients) {
        setIngredients(updatedIngredients);
      }
      if (onIngredientsChange) {
        onIngredientsChange(updatedIngredients);
      }
      
      // Also save to ingredients table (basic entry)
      try {
        const { error } = await supabase
          .from("ingredients")
          .insert([{ 
            name: ingredientName,
            brief_description: `${ingredientName} - Natural ingredient`
          }]);

        if (error) {
          console.error("Error adding ingredient:", error);
          // Don't show error if ingredient already exists
          if (!error.message.includes('duplicate')) {
            toast.error("Failed to save ingredient to database");
          }
        } else {
          toast.success(`Ingredient "${ingredientName}" added successfully!`);
        }
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }

      setNewIngredientName("");
      setIsDialogOpen(false);
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    
    // Call appropriate handlers
    if (setIngredients) {
      setIngredients(updatedIngredients);
    }
    if (onIngredientsChange) {
      onIngredientsChange(updatedIngredients);
    }
  };

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
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ingredient-name">Ingredient Name</Label>
                <Input
                  id="ingredient-name"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  className="bg-background"
                  placeholder="Enter ingredient name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 touch-manipulation"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddIngredient}
                  className="flex-1 touch-manipulation active-scale"
                  disabled={!newIngredientName.trim()}
                >
                  Add Ingredient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
