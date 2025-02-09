
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RemedyIngredientsSectionProps {
  ingredients: string[];
  availableIngredients: any[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export const RemedyIngredientsSection = ({
  ingredients,
  availableIngredients,
  onIngredientsChange,
}: RemedyIngredientsSectionProps) => {
  return (
    <div>
      <Label>Ingredients</Label>
      <Select
        value="select-ingredient"
        onValueChange={(value) => {
          if (value !== "select-ingredient") {
            const ingredient = availableIngredients?.find(i => i.id === value);
            if (ingredient && !ingredients.includes(ingredient.name)) {
              onIngredientsChange([...ingredients, ingredient.name]);
            }
          }
        }}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Select ingredients" />
        </SelectTrigger>
        <SelectContent className="bg-background">
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
            className="flex items-center gap-1"
          >
            {ingredient}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onIngredientsChange(ingredients.filter((_, i) => i !== index))}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
