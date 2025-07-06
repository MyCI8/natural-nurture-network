
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { migrateRemedyImages, filterImagesForSaving } from "@/utils/remedyImageMigration";
import { healthConcerns } from "@/components/admin/remedies/form/HealthConcernsData";
import { parseRemedyContent, formatContentWithLists } from "@/utils/remedyContentParser";

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

export const useRemedyForm = () => {
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

  // Fetch user's pending health concern suggestions to restore pending selections
  const { data: pendingSuggestions = [] } = useQuery({
    queryKey: ["health-concern-suggestions"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {return [];}
        
        const { data, error } = await supabase
          .from("health_concern_suggestions" as any)
          .select("*")
          .eq("suggested_by", user.id)
          .eq("status", "pending");
        
        if (error) {
          console.error("Database error:", error);
          return [];
        }
        
        if (!data || !Array.isArray(data)) {return [];}
        
        return data
          .filter((item: any) => item && typeof item === 'object' && item.id && item.concern_name)
          .map((item: any) => ({
            id: item.id,
            concern_name: item.concern_name,
            status: item.status || 'pending'
          }));
      } catch (error) {
        console.error("Error fetching pending suggestions:", error);
        return [];
      }
    },
  });

  const { data: remedy, isLoading } = useQuery({
    queryKey: ["remedy", id],
    queryFn: async () => {
      if (!id || id === "new") {return null;}
      
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {throw error;}
      return data;
    },
  });

  useEffect(() => {
    if (remedy && pendingSuggestions) {
      console.log('Loading remedy data:', remedy);
      console.log('Pending suggestions:', pendingSuggestions);
      
      const parsed = parseRemedyContent(remedy.description || "");
      
      // Get all stored health concerns from database
      const storedConcerns = remedy.symptoms || [];
      
      // Get previously selected pending concerns from localStorage
      const storageKey = `remedy-pending-concerns-${id}`;
      const savedPendingConcerns = localStorage.getItem(storageKey);
      const previouslySelectedPending = savedPendingConcerns ? JSON.parse(savedPendingConcerns) : [];
      
      // Combine stored concerns with any available concerns
      const allHealthConcerns = [
        ...storedConcerns,
        ...previouslySelectedPending.filter((concern: string) => 
          !storedConcerns.some((stored: string) => stored === concern) && 
          (healthConcerns.some(hc => hc === concern) || pendingSuggestions.some(p => p.concern_name === concern))
        )
      ];

      console.log('Final restored health concerns:', allHealthConcerns);
      
      setFormData({
        name: remedy.name || "",
        summary: remedy.summary || remedy.brief_description || "",
        description: formatContentWithLists(parsed.about),
        preparation_method: formatContentWithLists(parsed.preparationMethod),
        dosage_instructions: formatContentWithLists(parsed.dosageInstructions),
        precautions_side_effects: formatContentWithLists(parsed.precautionsAndSideEffects),
        ingredients: remedy.ingredients || [],
        health_concerns: allHealthConcerns,
        status: remedy.status as "draft" | "published" || "draft",
      });
      setSelectedExperts(remedy.expert_recommendations || []);
      
      // Load existing images
      if (remedy.image_url && !remedy.image_url.startsWith('blob:') && remedy.image_url.startsWith('http')) {
        setImages([{ url: remedy.image_url }]);
      }
      
      // Load existing links
      const remedyLinks = (remedy as any).links;
      if (remedyLinks && Array.isArray(remedyLinks)) {
        setLinks(remedyLinks);
      }
    }
  }, [remedy, pendingSuggestions, id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Save ALL health concerns to localStorage when they change
      if (field === 'health_concerns' && id) {
        const storageKey = `remedy-health-concerns-${id}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
        console.log('Saved ALL health concerns to localStorage:', value);
      }

      return newFormData;
    });
  };

  const handleImagesChange = (newImages: ImageData[]) => {
    console.log('Images changed in EditRemedy:', newImages);
    setImages(newImages);
  };

  const uploadImage = async (imageFile: File): Promise<string | null> => {
    try {
      console.log('Starting image upload to remedy-images bucket...');
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `remedy-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
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

      const { data: { publicUrl } } = supabase.storage
        .from('remedy-images')
        .getPublicUrl(fileName);
      
      console.log('Image uploaded successfully:', publicUrl);
      
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
      console.log('All health concerns to save:', formData.health_concerns);

      let finalImageUrl = '';

      const validImagesForSaving = filterImagesForSaving(images);
      console.log('Valid images for saving:', validImagesForSaving);

      if (validImagesForSaving.length > 0) {
        const firstImage = validImagesForSaving[0];
        
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
          finalImageUrl = firstImage.url;
          console.log('Using existing image URL:', finalImageUrl);
        } else if (firstImage.url && firstImage.url.startsWith('blob:')) {
          console.error('Blob URL detected, this should have been converted to a file:', firstImage.url);
          throw new Error('Cannot save temporary image URL. Please try uploading the image again.');
        }
      }

      if (finalImageUrl.startsWith('blob:')) {
        console.error('Attempting to save blob URL, rejecting:', finalImageUrl);
        throw new Error('Cannot save temporary image URL. Please upload a new image.');
      }

      // Combine all content into the description field
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

      // Save only concerns that exist in our static data
      const allSelectedConcerns = formData.health_concerns.filter(concern => 
        healthConcerns.some(hc => hc === concern)
      );

      console.log('Health concerns being saved to DB:', allSelectedConcerns);

      if (allSelectedConcerns.length !== formData.health_concerns.length) {
        const pendingCount = formData.health_concerns.length - allSelectedConcerns.length;
        toast.success(`Remedy saved! Note: ${pendingCount} pending health concern(s) will be available after admin approval.`);
      }

      const remedyData = {
        name: formData.name,
        summary: formData.summary,
        brief_description: formData.summary,
        description: fullDescription,
        image_url: finalImageUrl,
        video_url: links.find(link => link.type === 'video')?.url || '',
        ingredients: formData.ingredients,
        symptoms: allSelectedConcerns as any,
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

  return {
    formData,
    images,
    links,
    selectedExperts,
    isLoading,
    isSaving: saveRemedyMutation.isPending,
    handleInputChange,
    handleImagesChange,
    setLinks,
    setSelectedExperts,
    handleSave,
    navigate
  };
};
