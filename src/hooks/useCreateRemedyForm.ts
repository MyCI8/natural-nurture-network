
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormHookReturn } from "@/types/form";

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

interface CreateRemedyFormData {
  name: string;
  summary: string;
  description: string;
  precautions_side_effects: string;
  preparation_method: string;
  dosage_instructions: string;
  ingredients: string[];
  health_concerns: string[];
  experts: string[];
}

const VALID_HEALTH_CONCERNS = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 'Anxiety', 
  'Depression', 'Insomnia', 'Headache', 'Joint Pain', 'Digestive Issues', 
  'Fatigue', 'Skin Irritation', 'Hair Loss', 'Eye Strain'
] as const;

export const useCreateRemedyForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<CreateRemedyFormData>({
    name: '',
    summary: '',
    description: '',
    precautions_side_effects: '',
    preparation_method: '',
    dosage_instructions: '',
    ingredients: [],
    health_concerns: [],
    experts: [],
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

  const uploadImage = async (imageFile: File): Promise<string | null> => {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `remedy-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
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
      
      if (!publicUrl.includes('supabase.co') || !publicUrl.includes('/remedy-images/')) {
        console.error('Invalid storage URL format:', publicUrl);
        return null;
      }
      
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const createRemedyMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('User not authenticated');

      let finalImageUrl = '';

      if (images.length > 0) {
        const firstImage = images[0];
        
        if (firstImage.file) {
          const uploadedUrl = await uploadImage(firstImage.file);
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            toast('Image upload failed, but remedy will be saved');
          }
        } else if (firstImage.url && !firstImage.url.startsWith('blob:') && firstImage.url.startsWith('http')) {
          finalImageUrl = firstImage.url;
        }
      }

      if (finalImageUrl.startsWith('blob:')) {
        throw new Error('Cannot save temporary image URL. Please upload a proper image.');
      }

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

      const validHealthConcerns = formData.health_concerns.filter(concern => 
        VALID_HEALTH_CONCERNS.some(validConcern => validConcern === concern)
      ) as typeof VALID_HEALTH_CONCERNS[number][];

      const remedyData = {
        name: formData.name,
        summary: formData.summary,
        brief_description: formData.summary,
        description: fullDescription,
        image_url: finalImageUrl,
        video_url: links.find(link => link.type === 'video')?.url || '',
        ingredients: formData.ingredients,
        symptoms: validHealthConcerns,
        expert_recommendations: formData.experts,
        status: 'published' as const
      };

      const { error, data } = await supabase
        .from('remedies')
        .insert(remedyData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create remedy: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Remedy created successfully!');
      queryClient.invalidateQueries({ queryKey: ['userRemedies'] });
      queryClient.invalidateQueries({ queryKey: ['remedies'] });
      queryClient.invalidateQueries({ queryKey: ['latest-remedies'] });
      navigate('/remedies');
    },
    onError: (error) => {
      console.error('Error creating remedy:', error);
      toast.error(error.message || 'Failed to create remedy. Please try again.');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter a remedy name';
    }
    
    if (!formData.summary.trim()) {
      return 'Please enter a brief description';
    }
    
    if (!formData.description.trim()) {
      return 'Please enter a detailed description';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    createRemedyMutation.mutate();
  };

  return {
    formData,
    images,
    links,
    currentUser,
    isLoading: isLoadingUser,
    isSaving: createRemedyMutation.isPending,
    handleInputChange,
    setImages,
    setLinks,
    handleSubmit,
    validateForm,
    navigate
  };
};
