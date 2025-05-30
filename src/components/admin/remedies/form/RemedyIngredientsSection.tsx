
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import IngredientForm from "@/components/admin/IngredientForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  availableIngredients = [],
}: RemedyIngredientsSectionProps) => {
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the data from query if availableIngredients is not provided
  const { data: fetchedIngredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      if (availableIngredients && availableIngredients.length > 0) return availableIngredients;
      
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !availableIngredients || availableIngredients.length === 0,
  });

  const ingredientsList = availableIngredients?.length > 0 
    ? availableIngredients 
    : fetchedIngredients || [];

  const handleIngredientAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["ingredients"] });
  };

  // Handle ingredient changes and call the appropriate callback
  const handleIngredientsChange = (newIngredients: string[]) => {
    if (setIngredients) {
      setIngredients(newIngredients);
    }
    if (onIngredientsChange) {
      onIngredientsChange(newIngredients);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Ingredients</Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsIngredientFormOpen(true)}
          className="touch-manipulation active-scale touch-button"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add New
        </Button>
      </div>
      
      <Select
        value="select-ingredient"
        onValueChange={(value) => {
          if (value !== "select-ingredient") {
            const ingredient = ingredientsList?.find(i => i.id === value);
            if (ingredient && !ingredients.includes(ingredient.name)) {
              handleIngredientsChange([...ingredients, ingredient.name]);
            }
          }
        }}
      >
        <SelectTrigger className="bg-background w-full min-h-10 touch-manipulation">
          <SelectValue placeholder="Select ingredients" />
        </SelectTrigger>
        <SelectContent className="bg-background max-h-60 overflow-y-auto">
          <SelectItem value="select-ingredient">Select an ingredient</SelectItem>
          {ingredientsList?.map((ingredient) => (
            <SelectItem key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="mt-2 flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1.5 touch-manipulation"
          >
            {ingredient}
            <X
              className="h-3 w-3 cursor-pointer ml-1"
              onClick={() => handleIngredientsChange(ingredients.filter((_, i) => i !== index))}
            />
          </Badge>
        ))}
      </div>

      {isIngredientFormOpen && (
        <IngredientForm 
          onClose={() => setIsIngredientFormOpen(false)}
          onSave={handleIngredientAdded}
        />
      )}
    </div>
  );
};
