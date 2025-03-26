
import React, { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Trash } from "lucide-react";
import { uploadProfileImage, dataURLtoFile } from '@/utils/imageUtils';
import { useToast } from "@/components/ui/use-toast";

interface ProfileImageUploadProps {
  userId: string;
  avatarUrl?: string | null;
  fullName?: string;
  onImageUpdate: (url: string) => void;
}

export function ProfileImageUpload({ 
  userId, 
  avatarUrl, 
  fullName, 
  onImageUpdate 
}: ProfileImageUploadProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle touch events for mobile
  const handleTouchStart = () => {
    // This allows the actual click/touch handler to work on mobile
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      setIsUploading(true);
      
      // Upload to Supabase storage
      const publicUrl = await uploadProfileImage(file, userId);
      
      if (publicUrl) {
        onImageUpdate(publicUrl);
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpdate('');
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-32 w-32 relative group">
        <AvatarImage src={previewUrl || ''} />
        <AvatarFallback className="text-2xl">{fullName?.[0] || '?'}</AvatarFallback>
        
        {/* Hover overlay with edit button */}
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white" 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            onTouchStart={handleTouchStart}
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>
      </Avatar>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="flex gap-1" 
          disabled={isUploading}
          asChild
        >
          <label 
            className="cursor-pointer"
            onTouchStart={handleTouchStart}
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? "Uploading..." : "Change"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </Button>
        
        {previewUrl && (
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            className="flex gap-1 text-destructive"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <Trash className="h-4 w-4" />
            <span>Remove</span>
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        JPG, GIF or PNG. Max size 3MB.
      </p>
    </div>
  );
}
