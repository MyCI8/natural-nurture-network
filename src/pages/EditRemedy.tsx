
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedRemedyDetailsSection } from "@/components/remedies/shared/UnifiedRemedyDetailsSection";
import { UnifiedRemedyContentSection } from "@/components/remedies/shared/UnifiedRemedyContentSection";
import { RemedyIngredientsSection } from "@/components/admin/remedies/form/RemedyIngredientsSection";
import { RemedyExpertsSection } from "@/components/admin/remedies/RemedyExpertsSection";
import { RemedyHealthConcernsSection } from "@/components/admin/remedies/form/RemedyHealthConcernsSection";
import { RemedyStatusSection } from "@/components/admin/remedies/form/RemedyStatusSection";
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

const EditRemedy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    description: "",
    preparation_method: "",
    dosage_instructions: "",
    precautions_side_effects: "",
    ingredients: [] as string[],
    health_concerns: [] as string[],
    status: "draft" as "draft" | "published",
  });
  const [images, setImages] = useState<ImageData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  const { data: remedy, isLoading } = useQuery({
    queryKey: ["remedy", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (remedy) {
      setFormData({
        name: remedy.name || "",
        summary: remedy.summary || "",
        description: remedy.description || "",
        preparation_method: (remedy as any).preparation_method || "",
        dosage_instructions: (remedy as any).dosage_instructions || "",
        precautions_side_effects: (remedy as any).precautions_side_effects || "",
        ingredients: remedy.ingredients || [],
        health_concerns: remedy.symptoms || [],
        status: remedy.status as "draft" | "published" || "draft",
      });
      setSelectedExperts(remedy.expert_recommendations || []);
      
      // Load existing images
      const remedyImages = (remedy as any).images;
      if (remedyImages && Array.isArray(remedyImages)) {
        setImages(remedyImages);
      } else if (remedy.image_url) {
        setImages([{ url: remedy.image_url }]);
      }
      
      // Load existing links
      const remedyLinks = (remedy as any).links;
      if (remedyLinks && Array.isArray(remedyLinks)) {
        setLinks(remedyLinks);
      }
    }
  }, [remedy]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadImage = async (imageFile: File): Promise<string | null> => {
    try {
      console.log('Starting image upload...');
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('remedy-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('remedy-images')
        .getPublicUrl(fileName);
      
      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const saveRemedyMutation = useMutation({
    mutationFn: async (shouldPublish: boolean = false) => {
      console.log('Starting remedy save process...');
      console.log('Remedy ID:', id);
      console.log('Should publish:', shouldPublish);

      let uploadedImageUrl = '';

      // Try to upload new images
      if (images.length > 0 && images[0].file) {
        console.log('Uploading new image...');
        const imageUrl = await uploadImage(images[0].file);
        if (imageUrl) {
          uploadedImageUrl = imageUrl;
        } else {
          console.log('Image upload failed, using existing or no image');
          toast('Image upload failed, but remedy will be saved');
        }
      } else if (images.length > 0 && images[0].url) {
        uploadedImageUrl = images[0].url;
      }

      const remedyData = {
        name: formData.name,
        summary: formData.summary,
        description: formData.description,
        preparation_method: formData.preparation_method,
        dosage_instructions: formData.dosage_instructions,
        precautions_side_effects: formData.precautions_side_effects,
        image_url: uploadedImageUrl,
        images: images,
        links: links,
        ingredients: formData.ingredients,
        symptoms: formData.health_concerns,
        expert_recommendations: selectedExperts,
        status: shouldPublish ? "published" as const : formData.status,
      };

      console.log('Updating remedy with data:', remedyData);

      if (id && id !== "new") {
        const { error } = await supabase
          .from("remedies")
          .update(remedyData as any)
          .eq("id", id);

        if (error) {
          console.error('Update error:', error);
          throw new Error(`Failed to update remedy: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from("remedies")
          .insert([remedyData as any]);

        if (error) {
          console.error('Insert error:', error);
          throw new Error(`Failed to create remedy: ${error.message}`);
        }
      }

      return remedyData;
    },
    onSuccess: () => {
      console.log('Remedy saved successfully');
      toast.success('Remedy saved successfully!');
      queryClient.invalidateQueries({ queryKey: ["remedies"] });
      queryClient.invalidateQueries({ queryKey: ["remedy", id] });
      navigate("/admin/remedies");
    },
    onError: (error) => {
      console.error('Error saving remedy:', error);
      toast.error(error.message || 'Failed to save remedy. Please try again.');
    },
  });

  const handleSave = (shouldPublish = false) => {
    console.log('Save button clicked, shouldPublish:', shouldPublish);
    
    if (!formData.name.trim()) {
      toast.error('Please enter a remedy name');
      return;
    }
    
    if (!formData.summary.trim()) {
      toast.error('Please enter a brief description');
      return;
    }
    
    saveRemedyMutation.mutate(shouldPublish);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/remedies")}
          className="mb-6 flex items-center touch-manipulation"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Remedies
        </Button>

        <div className="grid gap-6 md:grid-cols-[2fr,1.5fr,1fr]">
          {/* Left Column - Main Content */}
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

          {/* Middle Column - Images, Experts, Links */}
          <div className="space-y-6">
            <MultipleImageUpload
              images={images}
              onImagesChange={setImages}
            />

            <RemedyExpertsSection
              selectedExperts={selectedExperts}
              setSelectedExperts={setSelectedExperts}
            />

            <SmartLinkInput
              links={links}
              onLinksChange={setLinks}
            />
          </div>

          {/* Right Column - Admin Fields and Actions */}
          <div className="space-y-6">
            <RemedyHealthConcernsSection
              selectedConcerns={formData.health_concerns}
              onConcernsChange={(concerns) => handleInputChange('health_concerns', concerns)}
            />

            <RemedyStatusSection
              status={formData.status}
              onStatusChange={(status) => handleInputChange('status', status)}
            />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => handleSave(false)}
                className="w-full touch-manipulation"
                disabled={saveRemedyMutation.isPending}
              >
                {saveRemedyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                className="w-full touch-manipulation"
                disabled={saveRemedyMutation.isPending}
              >
                {saveRemedyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRemedy;
