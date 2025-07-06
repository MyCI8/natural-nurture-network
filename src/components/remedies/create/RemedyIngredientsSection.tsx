import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RemedyIngredientsSectionProps {
  selectedIngredients: string[];
  onChange: (ingredients: string[]) => void;
}

export const RemedyIngredientsSection = ({ selectedIngredients, onChange }: RemedyIngredientsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select('id, name')
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) {throw error;}
      return data || [];
    },
    enabled: showSearch && searchTerm.length > 0,
  });

  const addIngredient = (ingredientName: string) => {
    if (!selectedIngredients.includes(ingredientName)) {
      onChange([...selectedIngredients, ingredientName]);
    }
    setSearchTerm('');
    setShowSearch(false);
  };

  const removeIngredient = (ingredientName: string) => {
    onChange(selectedIngredients.filter(name => name !== ingredientName));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ingredients</h3>
      
      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <Badge key={ingredient} variant="secondary" className="text-sm py-1 px-3">
              {ingredient}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(ingredient)}
                className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Ingredient */}
      <div className="space-y-2">
        {!showSearch ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSearch(true)}
            className="w-full touch-manipulation"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ingredients..."
                className="pl-10 touch-manipulation bg-background"
                autoFocus
              />
            </div>
            
            {ingredients && ingredients.length > 0 && (
              <div className="border rounded-lg p-2 bg-background max-h-40 overflow-y-auto">
                {ingredients.map((ingredient) => (
                  <Button
                    key={ingredient.id}
                    type="button"
                    variant="ghost"
                    onClick={() => addIngredient(ingredient.name)}
                    className="w-full justify-start text-left touch-manipulation"
                  >
                    {ingredient.name}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm('');
                }}
                className="flex-1 touch-manipulation"
              >
                Cancel
              </Button>
              {searchTerm && (
                <Button
                  type="button"
                  onClick={() => addIngredient(searchTerm)}
                  className="flex-1 touch-manipulation"
                >
                  Add "{searchTerm}"
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
