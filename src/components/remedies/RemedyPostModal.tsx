
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RemedyPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RemedyPostModal = ({ isOpen, onClose }: RemedyPostModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

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

      // Map fields to correct database schema
      const remedyData = {
        name: formData.name,
        brief_description: formData.summary, // Map summary to brief_description
        description: formData.description,
        image_url: imageUrl,
        status: 'draft'
      };

      const { error } = await supabase
        .from('remedies')
        .insert(remedyData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Remedy created successfully!');
      queryClient.invalidateQueries({ queryKey: ['userRemedies'] });
      queryClient.invalidateQueries({ queryKey: ['remedies'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating remedy:', error);
      toast.error('Failed to create remedy');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      summary: '',
      description: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.summary.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }
    createRemedyMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center overflow-y-auto">
      <div className="bg-background border border-border rounded-2xl max-w-2xl w-[90%] mx-5 my-5 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold">Share a Natural Remedy</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Remedy Image</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a photo of your remedy
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      Choose Image
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Remedy Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Honey and Ginger Tea for Sore Throat"
                required
              />
            </div>

            <div>
              <Label htmlFor="summary">Short Description *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of what this remedy helps with..."
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the benefits and how this remedy works..."
                rows={6}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRemedyMutation.isPending}
              className="flex-1"
            >
              {createRemedyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share Remedy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
