import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { X, Loader2 } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    symptoms: [] as SymptomType[],
    ingredients: [] as string[],
    video_url: "",
    status: "draft" as "draft" | "published",
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
      setImagePreview(remedy.image_url || "");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = remedy?.image_url || "";

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("remedy-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("remedy-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;

        if (remedy?.image_url) {
          const oldImagePath = remedy.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("remedy-images")
              .remove([oldImagePath]);
          }
        }
      }

      const remedyData = {
        ...formData,
        image_url: imageUrl,
      };

      if (remedy) {
        const { error } = await supabase
          .from("remedies")
          .update(remedyData)
          .eq("id", remedy.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Remedy updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("remedies")
          .insert([remedyData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Remedy created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      onClose();
    } catch (error) {
      console.error("Error saving remedy:", error);
      toast({
        title: "Error",
        description: "Failed to save remedy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="image">Thumbnail Image</Label>
            <div className="mt-2">
              <div className="flex items-center gap-4">
                {(imagePreview || remedy?.image_url) && (
                  <img
                    src={imagePreview || remedy?.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[200px]"
            />
          </div>

          <div>
            <Label>Symptoms</Label>
            <Select
              value={formData.symptoms[formData.symptoms.length - 1] || "none"}
              onValueChange={(value: SymptomType) => {
                if (value !== "none" && !formData.symptoms.includes(value)) {
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
                <SelectItem value="none">Select a symptom</SelectItem>
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
            <Select
              value={ingredients?.find(i => formData.ingredients.includes(i.name))?.id || "none"}
              onValueChange={(value: string) => {
                if (value !== "none") {
                  const ingredient = ingredients?.find(i => i.id === value);
                  if (ingredient && !formData.ingredients.includes(ingredient.name)) {
                    setFormData({
                      ...formData,
                      ingredients: [...formData.ingredients, ingredient.name]
                    });
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ingredients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select an ingredient</SelectItem>
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
                    onClick={() => setFormData({
                      ...formData,
                      ingredients: formData.ingredients.filter((_, i) => i !== index)
                    })}
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
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="YouTube or MP4 link"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "draft" | "published") => 
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {remedy ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RemedyForm;