
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
import { migrateRemedyImages, filterValidImages } from "@/utils/remedyImageMigration";

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

// Valid symptom enum values from the database
const VALID_SYMPTOMS = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 'Anxiety', 
  'Depression', 'Insomnia', 'Headache', 'Joint Pain', 'Digestive Issues', 
  'Fatigue', 'Skin Irritation', 'Hair Loss', 'Eye Strain'
] as const;

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

  // Run migration on component mount
  useEffect(() => {
    migrateRemedyImages();
  }, []);

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
        summary: remedy.summary || remedy.brief_description || "",
        description: remedy.description || "",
        preparation_method: (remedy as any).preparation_method || "",
        dosage_instructions: (remedy as any).dosage_instructions || "",
        precautions_side_effects: (remedy as any).precautions_side_effects || "",
        ingredients: remedy.ingredients || [],
        health_concerns: remedy.symptoms || [],
        status: remedy.status as "draft" | "published" || "draft",
      });
      setSelectedExperts(remedy.expert_recommendations || []);
      
      // Load existing images - STANDARDIZED: Only use image_url field
      if (remedy.image_url && !remedy.image_url.startsWith('blob:') && remedy.image_url.startsWith('http')) {
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

  const handleImagesChange = (newImages: ImageData[]) => {
    console.log('Images changed in EditRemedy:', newImages);
    // Use improved validation that allows the upload flow to work
    const validImages = filterValidImages(newImages);
    console.log('Valid images after filtering:', validImages);
    setImages(validImages);
  };

  const uploadImage = async (imageFile: File): Promise<string | null> => {
    try {
      console.log('Starting image upload to remedy-images bucket...');
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `remedy-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to remedy-images bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('remedy-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        toast.error('Failed to upload image');
        return null;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('remedy-images')
        .getPublicUrl(fileName);
      
      console.log('Image uploaded successfully:', publicUrl);
      
      // Validate the URL format
      if (!publicUrl.includes('supabase.co') || !publicUrl.includes('/remedy-images/')) {
        console.error('Invalid storage URL format:', publicUrl);
        return null;
      }
      
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Image upload failed');
      return null;
    }
  };

  const saveRemedyMutation = useMutation({
    mutationFn: async (shouldPublish: boolean = false) => {
      console.log('Starting remedy save process...');
      console.log('Remedy ID:', id);
      console.log('Should publish:', shouldPublish);
      console.log('Current images:', images);

      let finalImageUrl = '';

      // Handle image upload if there's a new file
      if (images.length > 0) {
        const firstImage = images[0];
        
        if (firstImage.file) {
          console.log('Uploading new image file...');
          const uploadedUrl = await uploadImage(firstImage.file);
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            console.log('New image uploaded successfully:', uploadedUrl);
          } else {
            throw new Error('Failed to upload image');
          }
        } else if (firstImage.url && !firstImage.url.startsWith('blob:')) {
          // Use existing valid URL
          finalImageUrl = firstImage.url;
          console.log('Using existing image URL:', finalImageUrl);
        } else if (firstImage.url && firstImage.url.startsWith('blob:')) {
          console.error('Blob URL detected, this should have been converted to a file:', firstImage.url);
          throw new Error('Cannot save temporary image URL. Please try uploading the image again.');
        }
      }

      // Validate that we don't save blob URLs
      if (finalImageUrl.startsWith('blob:')) {
        console.error('Attempting to save blob URL, rejecting:', finalImageUrl);
        throw new Error('Cannot save temporary image URL. Please upload a new image.');
      }

      // Combine all content into the description field like CreateRemedy does
      let fullDescription = formData.description;
      
      if (formData.preparation_method) {
        fullDescription += `\n\n**Preparation Method:**\n${formData.preparation_method}`;
      }
      
      if (formData.dosage_instructions) {
        fullDescription += `\n\n**Dosage Instructions:**\n${formData.dosage_instructions}`;
      }
      
      if (formData.precautions_side_effects) {
        fullDescription += `\n\n**Precautions & Side Effects:**\n${formData.precautions_side_effects}`;
      }

      // Filter health concerns to only include valid enum values
      const validSymptoms = formData.health_concerns.filter(concern => 
        VALID_SYMPTOMS.includes(concern as any)
      ) as typeof VALID_SYMPTOMS[number][];

      console.log('Valid symptoms filtered:', validSymptoms);

      // Prepare data for database operation - STANDARDIZED on image_url field
      const remedyData = {
        name: formData.name,
        summary: formData.summary,
        brief_description: formData.summary,
        description: fullDescription,
        image_url: finalImageUrl, // ONLY use image_url field
        video_url: links.find(link => link.type === 'video')?.url || '',
        ingredients: formData.ingredients,
        symptoms: validSymptoms,
        expert_recommendations: selectedExperts,
        status: shouldPublish ? "published" as const : formData.status,
      };

      console.log('Updating remedy with data:', remedyData);
      console.log('Final image URL being saved:', finalImageUrl);

      if (id && id !== "new") {
        const { error } = await supabase
          .from("remedies")
          .update(remedyData)
          .eq("id", id);

        if (error) {
          console.error('Update error:', error);
          throw new Error(`Failed to update remedy: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from("remedies")
          .insert(remedyData);

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
      queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      queryClient.invalidateQueries({ queryKey: ["latest-remedies"] });
      navigate("/admin/remedies");
    },
    onError: (error) => {
      console.error('Error saving remedy:', error);
      toast.error(error.message || 'Failed to save remedy. Please try again.');
    },
  });

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter a remedy name';
    }
    
    if (!formData.summary.trim()) {
      return 'Please enter a brief description';
    }
    
    return null;
  };

  const handleSave = (shouldPublish = false) => {
    console.log('Save button clicked, shouldPublish:', shouldPublish);
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
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
              onImagesChange={handleImagesChange}
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
