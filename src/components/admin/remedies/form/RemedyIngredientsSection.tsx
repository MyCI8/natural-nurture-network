
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
import IngredientForm from "@/components/admin/IngredientForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RemedyIngredientsSectionProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export const RemedyIngredientsSection = ({
  ingredients,
  onIngredientsChange,
}: RemedyIngredientsSectionProps) => {
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: availableIngredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleIngredientAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    setIsIngredientFormOpen(false);
  };

  const addIngredient = (ingredientName: string) => {
    if (!ingredients.includes(ingredientName)) {
      onIngredientsChange([...ingredients, ingredientName]);
    }
  };

  const removeIngredient = (index: number) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Ingredients</Label>
        <Button 
          type="button"
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
            const ingredient = availableIngredients?.find(i => i.id === value);
            if (ingredient) {
              addIngredient(ingredient.name);
            }
          }
        }}
      >
        <SelectTrigger className="bg-background w-full min-h-10 touch-manipulation">
          <SelectValue placeholder="Select ingredients" />
        </SelectTrigger>
        <SelectContent className="bg-background max-h-60 overflow-y-auto">
          <SelectItem value="select-ingredient">Select an ingredient</SelectItem>
          {availableIngredients?.map((ingredient) => (
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
              onClick={() => removeIngredient(index)}
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
