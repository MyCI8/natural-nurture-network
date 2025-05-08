
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
import { Textarea } from "@/components/ui/textarea";

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
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    description: "",
  });

  const handleAddIngredient = async () => {
    if (newIngredient.name.trim()) {
      const updatedIngredients = [...ingredients, newIngredient.name.trim()];
      
      // Call appropriate handlers
      if (setIngredients) {
        setIngredients(updatedIngredients);
      }
      if (onIngredientsChange) {
        onIngredientsChange(updatedIngredients);
      }
      
      // Also save to ingredients table
      try {
        const { error } = await supabase
          .from("ingredients")
          .insert([{ 
            name: newIngredient.name.trim(),
            description: newIngredient.description.trim()
          }]);

        if (error) throw error;
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }

      setNewIngredient({ name: "", description: "" });
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newIngredient.description}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, description: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <Button 
                onClick={handleAddIngredient}
                className="touch-manipulation active-scale"
              >
                Add Ingredient
              </Button>
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
