import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedRemedyDetailsSection } from "@/components/remedies/shared/UnifiedRemedyDetailsSection";
import { UnifiedRemedyContentSection } from "@/components/remedies/shared/UnifiedRemedyContentSection";
import { RemedyIngredientsSection } from "@/components/admin/remedies/form/RemedyIngredientsSection";
import { RemedyExpertsSection } from "@/components/admin/remedies/RemedyExpertsSection";
import { RemedyHealthConcernsSection } from "@/components/admin/remedies/form/RemedyHealthConcernsSection";
import { MultipleImageUpload } from "@/components/remedies/shared/MultipleImageUpload";
import { SmartLinkInput } from "@/components/remedies/shared/SmartLinkInput";

interface ImageData {
  file?: File;
  url: string;
  description?: string;
}

interface LinkData {
  url: string;
  title?: string;
  description?: string;
  type: 'link' | 'video';
}

const CreateRemedy = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    precautions_side_effects: '',
    preparation_method: '',
    dosage_instructions: '',
    ingredients: [] as string[],
    health_concerns: [] as string[],
    experts: [] as string[],
  });
  
  const [images, setImages] = useState<ImageData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);

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

      console.log('Starting remedy creation with data:', {
        formData,
        images: images.length,
        links: links.length
      });

      // Upload images to storage
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (!image.file) return { url: image.url, description: image.description };
          
          const fileExt = image.file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          
          console.log('Uploading image:', fileName);
          
          const { error: uploadError } = await supabase.storage
            .from('remedy-images')
            .upload(fileName, image.file);

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('remedy-images')
            .getPublicUrl(fileName);
          
          return { url: publicUrl, description: image.description };
        })
      );

      // Prepare data for database insert - include both summary and brief_description
      const remedyData = {
        name: formData.name,
        summary: formData.summary, // Required field
        brief_description: formData.summary, // Map summary to brief_description as well
        description: formData.description,
        precautions_side_effects: formData.precautions_side_effects,
        preparation_method: formData.preparation_method,
        dosage_instructions: formData.dosage_instructions,
        image_url: uploadedImages[0]?.url || '', // Keep first image as main for compatibility
        images: JSON.stringify(uploadedImages), // Convert to JSON
        related_links: JSON.stringify(links), // Map links to related_links as JSON
        ingredients: formData.ingredients,
        health_concerns: formData.health_concerns, // Map to health_concerns instead of symptoms
        expert_recommendations: formData.experts,
        status: 'published' // Changed from 'draft' to 'published' so remedies appear immediately
      };

      console.log('Inserting remedy data:', remedyData);

      const { error, data } = await supabase
        .from('remedies')
        .insert(remedyData)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Failed to create remedy: ${error.message}`);
      }

      console.log('Remedy created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Remedy created successfully!');
      queryClient.invalidateQueries({ queryKey: ['userRemedies'] });
      queryClient.invalidateQueries({ queryKey: ['remedies'] });
      navigate('/remedies');
    },
    onError: (error) => {
      console.error('Error creating remedy:', error);
      toast.error(error.message || 'Failed to create remedy');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a remedy name');
      return;
    }
    
    if (!formData.summary.trim()) {
      toast.error('Please enter a brief description');
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

  const videoLinks = links.filter(link => link.type === 'video');

  return (
    <div className="min-h-screen bg-background">
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

      {/* Content with minimal padding */}
      <div className="px-2 py-4 max-w-full mx-auto lg:px-4">
        <form onSubmit={handleSubmit}>
          {/* Three-column layout with tighter spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr,1fr] gap-4 lg:gap-6">
            {/* Left column - Main content */}
            <div className="space-y-6">
              <UnifiedRemedyDetailsSection
                formData={formData}
                onChange={handleInputChange}
              />

              <UnifiedRemedyContentSection
                formData={formData}
                onChange={handleInputChange}
              />

              <RemedyIngredientsSection
                ingredients={formData.ingredients}
                onIngredientsChange={(ingredients) => handleInputChange('ingredients', ingredients)}
              />
            </div>

            {/* Middle column - Images, Experts, Links */}
            <div className="space-y-6">
              <MultipleImageUpload
                images={images}
                onImagesChange={setImages}
              />

              <RemedyExpertsSection
                selectedExperts={formData.experts}
                setSelectedExperts={(experts) => handleInputChange('experts', experts)}
              />

              <SmartLinkInput
                links={links}
                onLinksChange={setLinks}
              />
            </div>

            {/* Right column - Health Concerns and Actions */}
            <div className="space-y-6">
              <RemedyHealthConcernsSection
                selectedConcerns={formData.health_concerns}
                onConcernsChange={(concerns) => handleInputChange('health_concerns', concerns)}
              />

              {/* Videos Section */}
              {videoLinks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Videos</h3>
                  <div className="space-y-2">
                    {videoLinks.map((video, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="text-sm font-medium truncate">
                          {video.title || new URL(video.url).hostname}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {video.url}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons - Desktop */}
              <div className="hidden lg:block space-y-4">
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
          <div className="lg:hidden mt-8">
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
