import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

interface RemedyFormProps {
  onClose: () => void;
  remedy?: any;
}

const RemedyForm = ({ onClose, remedy }: RemedyFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    symptoms: [] as string[],
    ingredients: [] as string[],
    video_url: "",
    status: "draft",
  });

  useEffect(() => {
    if (remedy) {
      setFormData({
        name: remedy.name || "",
        summary: remedy.summary || "",
        description: remedy.description || "",
        symptoms: remedy.symptoms || [],
        ingredients: remedy.ingredients || [],
        video_url: remedy.video_url || "",
        status: remedy.status || "draft",
      });
    }
  }, [remedy]);

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ingredients").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleIngredientSelect = (ingredientId: string) => {
    const ingredient = ingredients?.find(i => i.id === ingredientId);
    if (ingredient && !formData.ingredients.includes(ingredient.name)) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredient.name]
      });
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(i => i !== ingredientToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {remedy ? "Edit Remedy" : "Create New Remedy"}
          </DialogTitle>
          <DialogDescription>
            {remedy 
              ? "Update the details of this remedy" 
              : "Fill in the details to create a new remedy"
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
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Symptoms</Label>
            <Select
              value={formData.symptoms[formData.symptoms.length - 1]}
              onValueChange={(value: string) => {
                if (!formData.symptoms.includes(value)) {
                  setFormData({
                    ...formData,
                    symptoms: [...formData.symptoms, value]
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select symptoms" />
              </SelectTrigger>
              <SelectContent>
                {defaultSymptoms.map((symptom) => (
                  <SelectItem key={symptom} value={symptom}>
                    {symptom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.symptoms.map((symptom, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {symptom}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      symptoms: formData.symptoms.filter((_, i) => i !== index)
                    })}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Ingredients</Label>
            <Select onValueChange={handleIngredientSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select ingredients" />
              </SelectTrigger>
              <SelectContent>
                {ingredients?.map((ingredient) => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {ingredient}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeIngredient(ingredient)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              placeholder="YouTube or MP4 link"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {remedy ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RemedyForm;