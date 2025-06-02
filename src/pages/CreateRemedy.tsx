
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RemedyDetailsSection } from "@/components/remedies/create/RemedyDetailsSection";
import { RemedyContentSection } from "@/components/remedies/create/RemedyContentSection";
import { RemedyImageSection } from "@/components/remedies/create/RemedyImageSection";
import { RemedyIngredientsSection } from "@/components/remedies/create/RemedyIngredientsSection";
import { RemedyExpertsSection } from "@/components/remedies/create/RemedyExpertsSection";

const CreateRemedy = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    preparation_method: '',
    dosage_instructions: '',
    ingredients: [] as string[],
    experts: [] as string[],
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      toast("Please sign in to create a remedy");
      navigate("/auth");
    }
  }, [currentUser, isLoadingUser, navigate]);

  const createRemedyMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('User not authenticated');

      let imageUrl = '';
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('remedy-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('remedy-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('remedies')
        .insert({
          name: formData.name,
          summary: formData.summary,
          description: formData.description,
          preparation_method: formData.preparation_method,
          dosage_instructions: formData.dosage_instructions,
          image_url: imageUrl,
          ingredients: formData.ingredients,
          status: 'draft'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Remedy created successfully!');
      queryClient.invalidateQueries({ queryKey: ['userRemedies'] });
      queryClient.invalidateQueries({ queryKey: ['remedies'] });
      navigate('/remedies');
    },
    onError: (error) => {
      console.error('Error creating remedy:', error);
      toast.error('Failed to create remedy');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | null, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.summary.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }
    createRemedyMutation.mutate();
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/remedies')}
          className="rounded-full h-10 w-10 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold">
          Create Natural Remedy
        </h1>
        
        <Button
          onClick={handleSubmit}
          disabled={createRemedyMutation.isPending}
          size="sm"
          className="touch-manipulation md:hidden"
        >
          {createRemedyMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </header>

      {/* Content */}
      <div className="container mx-auto p-6">
        <form onSubmit={handleSubmit}>
          {/* Two-column layout matching admin */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8">
            {/* Left column - Main content */}
            <div className="space-y-8">
              {/* Remedy Details */}
              <RemedyDetailsSection
                formData={formData}
                onChange={handleInputChange}
              />

              {/* Content */}
              <RemedyContentSection
                formData={formData}
                onChange={handleInputChange}
              />

              {/* Ingredients */}
              <RemedyIngredientsSection
                selectedIngredients={formData.ingredients}
                onChange={(ingredients) => handleInputChange('ingredients', ingredients)}
              />
            </div>

            {/* Right column - Images, Experts, Actions */}
            <div className="space-y-8">
              {/* Images */}
              <RemedyImageSection
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
              />

              {/* Related Experts */}
              <RemedyExpertsSection
                selectedExperts={formData.experts}
                onChange={(experts) => handleInputChange('experts', experts)}
              />

              {/* Action Buttons - Desktop */}
              <div className="hidden md:block space-y-4">
                <Button 
                  type="submit" 
                  className="w-full touch-manipulation"
                  disabled={createRemedyMutation.isPending}
                >
                  {createRemedyMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Create Remedy
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full touch-manipulation"
                  onClick={() => navigate('/remedies')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Button - Mobile */}
          <div className="md:hidden mt-8">
            <Button 
              type="submit" 
              className="w-full py-6 rounded-full touch-manipulation"
              disabled={createRemedyMutation.isPending}
            >
              {createRemedyMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Create Remedy
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRemedy;
